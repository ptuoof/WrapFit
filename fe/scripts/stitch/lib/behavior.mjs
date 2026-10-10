import { parse, parseExpression } from '@babel/parser';
import _generate from '@babel/generator';
import _traverse from '@babel/traverse';

const traverse = _traverse.default ?? _traverse;
const generate = _generate.default ?? _generate;

/**
 * Turns a screen's classic scripts plus its inline `on*` attributes into one ES module.
 *
 * Classic scripts share the global object; a module is strict and private. To keep the
 * scripts' behavior, the conversion:
 * - runs the code inside `defineStitchBehavior(scope => …)` where `window`, `document`
 *   and the timer functions are the tracked stand-ins from the runtime;
 * - rewrites bare reads/writes of names that live on `window` (`window.fn = …` then
 *   `fn()`, or sloppy-mode implicit globals) to `window.fn`;
 * - mirrors top-level function declarations onto `window`, as a classic script would;
 * - turns top-level `this` into `window`;
 * - compiles each inline handler into a `function (event) {…}` in the same closure, so
 *   it sees the script's functions exactly like the original attribute did.
 */

const PARSE_OPTIONS = { sourceType: 'script', allowReturnOutsideFunction: true };

const SCOPE_NAMES = [
  'window',
  'document',
  'setTimeout',
  'clearTimeout',
  'setInterval',
  'clearInterval',
  'requestAnimationFrame',
  'cancelAnimationFrame',
];

function collectWindowNames(ast) {
  const names = new Set();
  traverse(ast, {
    AssignmentExpression(path) {
      const left = path.get('left');
      if (left.isMemberExpression() && left.get('object').isIdentifier({ name: 'window' })) {
        const prop = left.node.property;
        if (!left.node.computed && prop.type === 'Identifier') names.add(prop.name);
        if (left.node.computed && prop.type === 'StringLiteral') names.add(prop.value);
      }
      if (left.isIdentifier() && !path.scope.hasBinding(left.node.name) && !SCOPE_NAMES.includes(left.node.name)) {
        names.add(left.node.name); // sloppy-mode implicit global
      }
    },
  });
  return names;
}

/** Rewrites free references to window-held names, and top-level `this`. */
function rewriteGlobals(ast, windowNames) {
  const toWindow = (path) => path.replaceWith(parseExpression(`window.${path.node.name}`));
  traverse(ast, {
    Identifier(path) {
      const { name } = path.node;
      if (!windowNames.has(name) || path.scope.hasBinding(name)) return;
      const parent = path.parentPath;
      const isWrite =
        (parent.isAssignmentExpression() && parent.node.left === path.node) ||
        (parent.isUpdateExpression() && parent.node.argument === path.node);
      if (isWrite || path.isReferencedIdentifier()) toWindow(path);
    },
    ThisExpression(path) {
      const owner = path.findParent((p) => p.isFunction() && !p.isArrowFunctionExpression());
      if (!owner || owner.isProgram()) path.replaceWith(parseExpression('window'));
    },
  });
}

const indent = (code, pad) => code.replace(/^(?=.)/gm, pad);
const gen = (node) => generate(node, { comments: true }).code;

/**
 * In a page, an exception stops only the <script> that threw: later scripts and the inline
 * handlers keep working. Each script therefore runs in its own try/catch. Its top-level
 * declarations are lifted out of the try (as `let`, functions as they are) so the other
 * scripts and the handlers can still see them, as they would see globals.
 */
function isolateScript(ast, index, declared) {
  const outer = [];
  const inner = [];
  traverse(ast, {
    Program(path) {
      for (const statement of path.get('body')) {
        const node = statement.node;
        if (node.type === 'FunctionDeclaration') {
          outer.push(gen(node));
        } else if (node.type === 'VariableDeclaration') {
          const names = Object.keys(statement.getBindingIdentifiers()).filter((n) => !declared.has(n));
          names.forEach((n) => declared.add(n));
          if (names.length) outer.push(`let ${names.join(', ')};`);
          for (const declarator of node.declarations) {
            if (declarator.init) inner.push(`(${gen(declarator.id)} = ${gen(declarator.init)});`);
          }
        } else if (node.type === 'ClassDeclaration') {
          if (!declared.has(node.id.name)) outer.push(`let ${node.id.name};`);
          declared.add(node.id.name);
          inner.push(`${node.id.name} = ${gen({ ...node, type: 'ClassExpression' })};`);
        } else {
          inner.push(gen(node));
        }
      }
      path.stop();
    },
  });
  const guarded = inner.length
    ? `try {\n${indent(inner.join('\n'), '  ')}\n} catch (error) {\n  console.error('[stitch] script ${index + 1} failed', error);\n}`
    : '';
  return [...outer, guarded].filter(Boolean).join('\n');
}

export function buildBehaviorModule(screen, handlers, { banner }) {
  const asts = screen.inlineScripts.map((code) => parse(code, PARSE_OPTIONS));
  // A name one script declares and another assigns is shared state, not a window property.
  const topLevelNames = new Set(
    asts.flatMap((ast) => {
      let names = [];
      traverse(ast, {
        Program(path) {
          names = Object.keys(path.scope.bindings);
          path.stop();
        },
      });
      return names;
    }),
  );
  const windowNames = new Set(asts.flatMap((ast) => [...collectWindowNames(ast)]).filter((n) => !topLevelNames.has(n)));
  const topLevelFunctions = asts.flatMap((ast) =>
    ast.program.body.filter((n) => n.type === 'FunctionDeclaration' && n.id).map((n) => n.id.name),
  );
  const declared = new Set(topLevelFunctions);
  const body = asts
    .map((ast, index) => {
      rewriteGlobals(ast, windowNames);
      return isolateScript(ast, index, declared);
    })
    .join('\n\n');

  const handlerEntries = handlers.map(({ id, event, code }) => {
    const fnAst = parse(`(function (event) {\n${code}\n});`, PARSE_OPTIONS);
    // Names the script declares at top level are closure variables here, not window lookups.
    rewriteGlobals(fnAst, new Set([...windowNames].filter((n) => !topLevelFunctions.includes(n))));
    const fn = generate(fnAst, { comments: false }).code.replace(/^\(|\);?$/g, '');
    return `/* ${event} */ ${JSON.stringify(id)}: ${fn},`;
  });

  const lines = [
    '// @ts-nocheck — machine-converted classic script; types are checked at the defineStitchBehavior boundary.',
    `/* ${banner} */`,
    "import { defineStitchBehavior } from '../runtime/defineStitchBehavior';",
  ];
  if (screen.usesThree) lines.push("import * as THREE_NAMESPACE from 'three';");
  lines.push('', 'export default defineStitchBehavior((scope) => {');
  lines.push(`  const { ${SCOPE_NAMES.join(', ')} } = scope;`);
  if (screen.usesThree) lines.push('  const THREE = scope.useThree(THREE_NAMESPACE);');
  if (topLevelFunctions.length) {
    lines.push('', '  // Classic scripts publish top-level functions on window.');
    for (const name of topLevelFunctions) lines.push(`  window.${name} = ${name};`);
  }
  if (body.trim()) lines.push('', indent(body, '  '));
  lines.push('', '  return {', '    handlers: {');
  for (const entry of handlerEntries) lines.push(indent(entry, '      '));
  lines.push('    },', '  };', '});', '');
  return lines.join('\n');
}

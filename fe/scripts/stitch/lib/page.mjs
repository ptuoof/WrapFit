import { cleanTitle } from './source.mjs';
import { viewPathFor } from './paths.mjs';

const componentName = (slug) =>
  slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('') + (slug === 'not-found' ? '' : 'Page');

/** Source of `src/views/<route>/index.tsx` for one screen. Server Component: static markup plus one client island. */
export function buildViewModule(screen, { jsx, rootProps, usesLink, hasBehavior, banner }) {
  const lines = [`/* ${banner} */`];
  if (usesLink) lines.push("import Link from 'next/link';");
  if (hasBehavior) lines.push("import { StitchRuntime } from '@/features/stitch/runtime/StitchRuntime';");
  if (lines.length > 1) lines.push('');
  lines.push(`export default function ${componentName(screen.slug)}() {`);
  lines.push('  return (');
  lines.push(`    <div ${rootProps}>`);
  lines.push(jsx);
  if (hasBehavior) lines.push(`      <StitchRuntime screen="${screen.slug}" />`);
  lines.push('    </div>');
  lines.push('  );');
  lines.push('}');
  lines.push('');
  return lines.join('\n');
}

/** Source of `src/app/<route>/page.tsx` (or `not-found.tsx`): route metadata plus the screen from `src/views`. */
export function buildPageModule(screen, { banner }) {
  const view = `@/views/${viewPathFor(screen.route)}`;
  if (screen.route === 'not-found') {
    return [`/* ${banner} */`, `export { default } from '${view}';`, ''].join('\n');
  }
  const name = componentName(screen.slug);
  return [
    `/* ${banner} */`,
    "import type { Metadata } from 'next';",
    `import ${name} from '${view}';`,
    '',
    `export const metadata: Metadata = { title: ${JSON.stringify(cleanTitle(screen.title))} };`,
    '',
    `export default ${name};`,
    '',
  ].join('\n');
}

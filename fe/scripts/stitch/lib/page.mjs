import { cleanTitle } from './source.mjs';

const componentName = (slug) =>
  slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('') + (slug === 'not-found' ? '' : 'Page');

/** Source of `page.tsx` (or `not-found.tsx`) for one screen. Server Component: static markup plus one client island. */
export function buildPageModule(screen, { jsx, rootProps, usesLink, hasBehavior, banner }) {
  const lines = [`/* ${banner} */`];
  const isNotFound = screen.route === 'not-found';
  if (!isNotFound) lines.push("import type { Metadata } from 'next';");
  if (usesLink) lines.push("import Link from 'next/link';");
  if (hasBehavior) lines.push("import { StitchRuntime } from '@/features/stitch/runtime/StitchRuntime';");
  lines.push('');
  if (!isNotFound) {
    lines.push(`export const metadata: Metadata = { title: ${JSON.stringify(cleanTitle(screen.title))} };`, '');
  }
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

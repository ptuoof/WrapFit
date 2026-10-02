/** class-transformer helper: `@Transform(trim)` removes surrounding whitespace from strings. */
export const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

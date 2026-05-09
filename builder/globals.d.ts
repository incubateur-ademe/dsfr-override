declare module 'js-yaml' {
  export function load(input: string): unknown;
  export function dump(input: unknown): string;
}

declare module 'mqpacker' {
  import type { Plugin } from 'postcss';
  function mqpacker(opts?: { sort?: boolean | ((a: string, b: string) => number) }): Plugin;
  export = mqpacker;
}

declare module 'postcss-combine-duplicated-selectors' {
  import type { Plugin } from 'postcss';
  const plugin: Plugin;
  export default plugin;
}

declare module 'postcss-discard-duplicates' {
  import type { Plugin } from 'postcss';
  const plugin: Plugin;
  export default plugin;
}

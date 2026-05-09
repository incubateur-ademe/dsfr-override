// Loose stubs for highlight.js loaded via the CDN (esm.sh) — we only use
// the registerLanguage / highlight surface, so we avoid pulling the full
// upstream typings (the package is CJS-only locally and we rely on the
// browser CDN for ESM).

declare module 'hljs/core' {
  interface HljsLanguage {
    name?: string;
    aliases?: string[];
    [key: string]: unknown;
  }
  interface HljsResult { value: string }
  interface HljsApi {
    registerLanguage(name: string, language: () => HljsLanguage): void;
    highlight(code: string, opts: { language: string; ignoreIllegals?: boolean }): HljsResult;
  }
  const hljs: HljsApi;
  export default hljs;
}

declare module 'hljs/yaml' {
  const yaml: () => unknown;
  export default yaml;
}

/** @type { import('@storybook/html-vite').StorybookConfig } */

// Reuses every story / mdx that DSFR ships in the submodule. Our overrides
// reach those stories through the CSS we serve from <projectRoot>/dist/
// (mounted at /dist/ via staticDirs) — the stories themselves are pristine.
const config = {
  stories: [
    '../../dsfr/dsfr-sb/*.mdx',
    // src/dsfr/**/*.mdx left out: DSFR doesn't ship per-component .mdx, only
    // .stories.js. Including it would just print a no-match warning.
    '../../dsfr/src/dsfr/**/*.stories.@(js|jsx|mjs|ts|tsx)'
  ],

  addons: [
    '@storybook/theming',
    '@storybook/addon-themes',
    '@whitespace/storybook-addon-html',
    '@storybook/addon-mdx-gfm',
    {
      name: '@storybook/addon-essentials',
      options: {
        backgrounds: false,
        actions: false,
        outline: false,
        grid: false,
        viewport: true
      }
    }
  ],

  framework: {
    name: '@storybook/html-vite',
    options: {}
  },

  // The autodocs renderer pulls @mdx-js/react + react/jsx-runtime lazily.
  // Without explicit pre-bundling, vite reloads the iframe mid-render and
  // docs pages stay blank. Listing them in optimizeDeps forces the deps to
  // be ready before any docs page renders.
  viteFinal: (config) => {
    config.optimizeDeps = {
      ...config.optimizeDeps,
      include: [
        ...(config.optimizeDeps?.include ?? []),
        '@mdx-js/react',
        'react/jsx-runtime'
      ]
    };
    return config;
  },

  // Storybook 8.6 has its own host validation middleware in front of Vite —
  // setting vite's server.allowedHosts has no effect. The flag lives on
  // `core.allowedHosts`. `true` allows any Host header, fine for a local dev
  // tool reachable through tailscale / reverse proxies.
  core: {
    allowedHosts: true
  },

  docs: {
    autodocs: 'tag'
  },

  staticDirs: [
    './static',
    // dist/ now holds dist/icons/ too (copied + Lucide-overlaid by the
    // builder), so we don't need a separate mount for icons anymore.
    { from: '../../dist', to: 'dist' },
    { from: '../../dsfr/tool/example/img', to: 'img' },
    // Pictograms are still served from the submodule — we don't (yet) curate
    // or override them.
    { from: '../../dsfr/src/dsfr/core/asset/artwork', to: 'dist/artwork' },
    // The vanilla DSFR JS comes from the npm package — DSFR submodule itself
    // doesn't ship dist/. The stories need this for interactive components.
    { from: '../node_modules/@gouvfr/dsfr/dist/dsfr', to: 'vendor' }
  ]
};

export default config;

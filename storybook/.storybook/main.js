/** @type { import('@storybook/html-vite').StorybookConfig } */

// Reuses every story / mdx that DSFR ships in the submodule. Our overrides
// reach those stories through the CSS we serve from <projectRoot>/dist/
// (mounted at /dist/ via staticDirs) — the stories themselves are pristine.
const config = {
  stories: [
    '../../dsfr/dsfr-sb/*.mdx',
    '../../dsfr/src/dsfr/**/*.mdx',
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

  staticDirs: [
    './static',
    { from: '../../dist', to: 'dist' },
    { from: '../../dsfr/tool/example/img', to: 'img' },
    // The vanilla DSFR JS comes from the npm package — DSFR submodule itself
    // doesn't ship dist/. The stories need this for interactive components.
    { from: '../node_modules/@gouvfr/dsfr/dist/dsfr', to: 'vendor' }
  ],

  docs: {}
};

export default config;

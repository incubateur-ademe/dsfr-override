import { create } from '@storybook/theming/create';

/**
 * Thème Storybook piloté par `mapping.yml` au build (cf. `viteFinal` dans
 * `main.ts`, qui définit ces globals via `define`). En dehors du build Vite
 * (par exemple si quelqu'un import ce fichier sans Vite), les valeurs ne
 * seront pas remplacées et resteront des chaînes littérales — pas idéal,
 * mais le module n'est consommé qu'à l'intérieur du Storybook.
 */
declare const __ADEME_FONT_BASE__: string;
declare const __ADEME_PRIMARY_HEX__: string;
declare const __ADEME_PRIMARY_HEX_DARK__: string;
declare const __ADEME_SECONDARY_HEX__: string;
declare const __ADEME_BRAND_TITLE__: string;

const PREFER_COLOR_SCHEME = true;

const PRIMARY = __ADEME_PRIMARY_HEX__;
const PRIMARY_DARK = __ADEME_PRIMARY_HEX_DARK__;
const SECONDARY = __ADEME_SECONDARY_HEX__;
const FONT_BASE = __ADEME_FONT_BASE__;
const BRAND_TITLE = __ADEME_BRAND_TITLE__;

const light = {
  base: 'light' as const,
  fontBase: FONT_BASE,
  fontCode: 'monospace',

  brandTitle: BRAND_TITLE,
  brandUrl: '#',
  brandImage: 'logo-light.png',
  brandTarget: '_self',

  colorPrimary: PRIMARY,
  colorSecondary: SECONDARY,

  appBg: '#fff',
  appContentBg: '#fff',
  appPreviewBg: '#f5f5fe',
  appBorderColor: '#666',
  appBorderRadius: 0,

  textColor: '#3a3a3a',
  textInverseColor: '#fff',

  barTextColor: '#3a3a3a',
  barSelectedColor: PRIMARY,
  barHoverColor: PRIMARY,
  barBg: '#f5f5fe',

  inputBg: '#eee',
  inputBorder: '#3a3a3a',
  inputTextColor: '#3a3a3a',
  inputBorderRadius: 0
};

const dark = {
  ...light,
  base: 'dark' as const,

  brandImage: 'logo-dark.png',

  colorPrimary: PRIMARY_DARK,
  colorSecondary: SECONDARY,

  appBg: '#161616',
  appContentBg: '#161616',
  appPreviewBg: '#1b1b35',
  appBorderColor: '#353535',
  appBorderRadius: 0,

  textColor: '#cecece',
  textInverseColor: '#666',

  barTextColor: '#cecece',
  barSelectedColor: PRIMARY_DARK,
  barHoverColor: PRIMARY_DARK,
  barBg: '#1b1b35',

  inputBg: '#242424',
  inputBorder: '#cecece',
  inputTextColor: '#cecece',
  inputBorderRadius: 0
};

const lightVars = create(light);
const darkVars = create(dark);

export default { light: lightVars, dark: darkVars };

export const getPreferredColorScheme = (): typeof lightVars => {
  if (typeof window === 'undefined' || !window.matchMedia) return lightVars;
  if (!PREFER_COLOR_SCHEME) return lightVars;
  const theme = document.documentElement.getAttribute('data-fr-theme');
  if (theme) return theme === 'dark' ? darkVars : lightVars;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? darkVars : lightVars;
};

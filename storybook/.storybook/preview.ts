// @ts-expect-error: side-effect CSS import has no type declarations
import './preview.css';
// @ts-expect-error: js-beautify ships no type declarations
import jsBeautifier from 'js-beautify';
import dsfrTheme, { getPreferredColorScheme } from './dsfr-theme.js'
import { DecoratorHelpers } from '@storybook/addon-themes';
import { UrlStore } from '@storybook/preview-api';

const { initializeThemeState, pluckThemeFromContext, useThemeParameters } = DecoratorHelpers;

const defaultTheme = 'light';
const themes = Object.keys(dsfrTheme);
initializeThemeState(themes, defaultTheme);

const themeDecorator = (Story: () => unknown, context: Parameters<typeof pluckThemeFromContext>[0]) => {
  const selectedTheme = pluckThemeFromContext(context);
  const { themeOverride } = useThemeParameters();

  const theme = themeOverride || selectedTheme || defaultTheme;

  document.documentElement.setAttribute('data-fr-theme', theme);

  return Story();
};

const getInitialTheme = () => {
  const store = new UrlStore();
  const theme = (store?.selectionSpecifier?.globals?.['theme'] ?? 'light') as string;
  document.documentElement.setAttribute('data-fr-theme', theme);
  return getPreferredColorScheme();
}

const viewports = {
  xs: {
    name: 'Phone - Breakpoint XS',
    styles: {
      width: '375px',
      height: '667px',
    },
  },
  sm: {
    name: 'Phablet - Breakpoint SM',
    styles: {
      width: '576px',
      height: '1024px',
    },
  },
  md: {
    name: 'Tablette - Breakpoint MD',
    styles: {
      width: '768px',
      height: '1024px',
    },
  },
  lg: {
    name: 'Tablette horizontale - Breakpoint LG',
    styles: {
      width: '1024px',
      height: '768px',
    },
  },
  xl: {
    name: 'Desktop - Breakpoint XL',
    styles: {
      width: 'auto',
      height: 'auto',
    },
  },
};

const preview = {
  decorators: [
    themeDecorator
  ],

  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    html: {
      highlighter: {
        showLineNumbers: true, // default: false
        wrapLines: false, // default: true
      },
    },
    docs: {
      theme: getInitialTheme(),
      source: {
        language: 'html',
        transform: (src: string) => jsBeautifier.html(src, { indent_size: 2, preserve_newlines: false }),
      },
    },
    options: {
      storySort: (a: { title: string; tags?: string[] }, b: { title: string; tags?: string[] }) => {
        const getLetterIndex = (letter: string) => letter.toLowerCase().charCodeAt(0) - 64;

        const getStoryIndex = (story: { title: string; tags?: string[] }) => {
          const chunks = story.title.split('/');
          const name = chunks.pop() ?? '';
          const sort = story?.tags?.filter((tag: string) => tag.startsWith('sort:')).map((tag: string) => parseInt((tag.split(':')[1] ?? '') as string));
          // Le JS original utilisait `sort ?? 0` où `sort` est `number[] | undefined` ;
          // la coercition `array + number` qui en résulte est un noop buggué qu'on
          // préserve verbatim pour rester iso-comportement avec la story DSFR.
          const index = getLetterIndex(name[0] ?? '') * 10**9 + getLetterIndex(name[1] ?? '') * 10**7 + getLetterIndex(name[2] ?? '') * 10**5 + ((sort ?? 0) as unknown as number);
          return index;
        };

        const indexA = getStoryIndex(a);
        const indexB = getStoryIndex(b);

        return indexA - indexB;
      }
    },
    viewport: {
      viewports: viewports,
      defaultViewport: 'lg',
    },
  },

  tags: ['autodocs']
};


// FIX : Vide la div 'storybook-root' pour eviter les conflits d'ID entre les docs et les stories
addEventListener("DOMContentLoaded", (_event) => {
  const root = document.getElementById('storybook-root');
  if (root && root.hasAttribute('hidden')) {
    root.innerHTML = '';
  }
});

export default preview;

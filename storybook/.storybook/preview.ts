// @ts-expect-error: side-effect CSS import has no type declarations
import './preview.css';
// @ts-expect-error: js-beautify ships no type declarations
import jsBeautifier from 'js-beautify';
// Import sans extension : Vite/rollup résolvent `dsfr-theme.ts` via
// `resolve.extensions`. L'extension explicite `.js` ne ferait pas fallback
// `.ts` côté rollup en build. NodeNext râle sur cet import — l'override
// est volontaire, la résolution est faite par Vite, pas par `tsc`.
// @ts-expect-error: extension volontairement omise (cf. ci-dessus)
import dsfrTheme, { getPreferredColorScheme } from './dsfr-theme';
import { DecoratorHelpers } from '@storybook/addon-themes';
import { UrlStore } from '@storybook/preview-api';
import type { Decorator, Preview } from '@storybook/html';

const { initializeThemeState, pluckThemeFromContext, useThemeParameters } = DecoratorHelpers;

const defaultTheme = 'light';
const themes = Object.keys(dsfrTheme);
initializeThemeState(themes, defaultTheme);

const themeDecorator: Decorator = (Story, context) => {
  const selectedTheme = pluckThemeFromContext(context);
  const { themeOverride } = useThemeParameters();
  const theme = themeOverride || selectedTheme || defaultTheme;
  document.documentElement.setAttribute('data-fr-theme', theme);
  return Story(context) as ReturnType<typeof Story>;
};

const getInitialTheme = () => {
  const store = new UrlStore();
  const theme = (store?.selectionSpecifier?.globals?.['theme'] ?? 'light') as string;
  document.documentElement.setAttribute('data-fr-theme', theme);
  return getPreferredColorScheme();
};

const viewports = {
  xs: { name: 'Phone - Breakpoint XS',                styles: { width: '375px',  height: '667px' } },
  sm: { name: 'Phablet - Breakpoint SM',              styles: { width: '576px',  height: '1024px' } },
  md: { name: 'Tablette - Breakpoint MD',             styles: { width: '768px',  height: '1024px' } },
  lg: { name: 'Tablette horizontale - Breakpoint LG', styles: { width: '1024px', height: '768px' } },
  xl: { name: 'Desktop - Breakpoint XL',              styles: { width: 'auto',   height: 'auto' } }
};

const preview: Preview = {
  decorators: [themeDecorator],

  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    },
    html: {
      highlighter: {
        showLineNumbers: true,
        wrapLines: false
      }
    },
    docs: {
      theme: getInitialTheme(),
      source: {
        language: 'html',
        transform: (src: string) => jsBeautifier.html(src, { indent_size: 2, preserve_newlines: false })
      }
    },
    options: {
      // Storybook (csf-tools) extrait l'AST de cette fonction, le ré-émet via
      // babel-generator (qui ne strip pas les annotations TypeScript) puis
      // l'exécute via Function-constructor pour calculer l'ordre des stories.
      // Le body doit donc rester en JavaScript pur — cf. doc SB 8.6 :
      // « the function is executed in a JavaScript environment, so use JSDoc
      // for IntelliSense ». Le type extérieur `Preview` couvre les paramètres.
      //
      // Algorithme conservé verbatim depuis la story DSFR upstream — incluant
      // la coercition `array + number` du `(sort ?? 0)` final qui est un noop
      // bugué qu'on garde pour rester iso-comportement.
      // @ts-expect-error: scope JS pur, pas d'annotations TS sur (a, b)
      storySort: (a, b) => {
        // @ts-expect-error: scope JS pur, (letter) sans annotation
        const getLetterIndex = (letter) => letter.toLowerCase().charCodeAt(0) - 64;
        // @ts-expect-error: scope JS pur, (story) sans annotation
        const getStoryIndex = (story) => {
          const chunks = story.title.split('/');
          const name = chunks.pop() ?? '';
          const sort = story?.tags
            // @ts-expect-error: (tag) sans annotation
            ?.filter((tag) => tag.startsWith('sort:'))
            // @ts-expect-error: (tag) sans annotation
            .map((tag) => parseInt(tag.split(':')[1] ?? ''));
          return (
            getLetterIndex(name[0] ?? '') * 10 ** 9 +
            getLetterIndex(name[1] ?? '') * 10 ** 7 +
            getLetterIndex(name[2] ?? '') * 10 ** 5 +
            (sort ?? 0)
          );
        };
        return getStoryIndex(a) - getStoryIndex(b);
      }
    },
    viewport: {
      viewports,
      defaultViewport: 'lg'
    }
  },

  tags: ['autodocs']
};

// Vide la div `storybook-root` pour éviter les conflits d'ID entre les docs
// et les stories quand le renderer recycle le même container.
addEventListener('DOMContentLoaded', (_event) => {
  const root = document.getElementById('storybook-root');
  if (root && root.hasAttribute('hidden')) {
    root.replaceChildren();
  }
});

export default preview;

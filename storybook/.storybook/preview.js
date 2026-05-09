import './preview.css';
import jsBeautifier from 'js-beautify';
// Import sans extension : Vite/rollup résolvent vers `dsfr-theme.ts`
// via `resolve.extensions`. Mettre `.js` explicite ne tomberait pas en
// fallback `.ts` (Vite ne fait la résolution croisée que pour les imports
// sans extension).
import dsfrTheme, { getPreferredColorScheme } from './dsfr-theme';
import { DecoratorHelpers } from '@storybook/addon-themes';
import { UrlStore } from '@storybook/preview-api';

// Le fichier reste en JavaScript : Storybook (csf-tools) extrait
// `parameters.options.storySort` puis exécute son source littéral via le
// Function-constructor pour résoudre l'index. Toute annotation TypeScript
// dans la fonction casse cette résolution avec « Unexpected token ':' ».
// dsfr-theme.ts (importé plus haut) reste typé puisqu'il n'est pas extrait.

const { initializeThemeState, pluckThemeFromContext, useThemeParameters } = DecoratorHelpers;

const defaultTheme = 'light';
const themes = Object.keys(dsfrTheme);
initializeThemeState(themes, defaultTheme);

const themeDecorator = (Story, context) => {
  const selectedTheme = pluckThemeFromContext(context);
  const { themeOverride } = useThemeParameters();
  const theme = themeOverride || selectedTheme || defaultTheme;
  document.documentElement.setAttribute('data-fr-theme', theme);
  return Story();
};

const getInitialTheme = () => {
  const store = new UrlStore();
  const theme = store?.selectionSpecifier?.globals?.['theme'] ?? 'light';
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

const preview = {
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
        transform: (src) => jsBeautifier.html(src, { indent_size: 2, preserve_newlines: false })
      }
    },
    options: {
      // Tri custom inline : SB extrait cette fonction pour la rejouer côté
      // index ; on conserve verbatim l'algorithme de la story DSFR upstream
      // (incluant le `(sort ?? 0)` final qui est un noop bugué — `sort` est
      // un `number[]` qui se coerce en string lors de l'addition).
      storySort: (a, b) => {
        const getLetterIndex = (letter) => letter.toLowerCase().charCodeAt(0) - 64;
        const getStoryIndex = (story) => {
          const chunks = story.title.split('/');
          const name = chunks.pop() ?? '';
          const sort = story?.tags
            ?.filter((tag) => tag.startsWith('sort:'))
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
addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('storybook-root');
  if (root && root.hasAttribute('hidden')) {
    root.replaceChildren();
  }
});

export default preview;

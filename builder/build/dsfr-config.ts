import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';

/**
 * Reproduit le sous-ensemble de `dsfr/tool/generate/*` nécessaire à la
 * compilation Sass ET au storybook (pictogram.json, icon.json), pour qu'on
 * n'ait pas besoin de `yarn install` dans le submodule.
 *
 * Les fichiers générés vont dans `<root>/.config/`, qui est dans le `.gitignore`
 * du submodule. L'appelant passe le chemin du workspace pendant un build (pour
 * que `.config` soit à côté du SCSS workspace) et le chemin du submodule
 * avant de lancer storybook (pour que `dsfr/src/dsfr/**\/*.stories.js` résolve
 * ses refs `@config` relativement).
 */
export function generateDsfrConfig(dsfrRoot: string): void {
  const configDir = join(dsfrRoot, '.config');
  if (!existsSync(configDir)) mkdirSync(configDir, { recursive: true });

  generateCore(dsfrRoot, configDir);
  generateIconRegistry(dsfrRoot, configDir);
  generatePictogramRegistry(dsfrRoot, configDir);
  generateMiscStubs(configDir);
}

// Les stories Storybook importent `.config/i18n.json` et `.config/colors.json`.
// Construire les vrais nécessite `tool/classes/I18n` + le générateur de couleurs
// upstream avec leurs deps yarn (yaml, sass-true…). On fournit des stubs vides
// mais valides : un lookup i18n échoue (le texte fallback sur la clé), et les
// refs de couleur tombent sur un registre vide — rien ne casse visuellement.
function generateMiscStubs(configDir: string): void {
  const i18nPath = join(configDir, 'i18n.json');
  if (!existsSync(i18nPath)) writeFileSync(i18nPath, '{}');
  const colorsPath = join(configDir, 'colors.json');
  if (!existsSync(colorsPath)) writeFileSync(colorsPath, '[]');
}

function generateCore(dsfrRoot: string, configDir: string): void {
  const pkg = JSON.parse(readFileSync(join(dsfrRoot, 'package.json'), 'utf8')) as { config?: Record<string, unknown>; version?: string };
  const cfg = pkg.config ?? {};

  const scss = Object.entries(cfg).map(([k, v]) => `$${k}: '${v}';\r\n`).join('');
  writeFileSync(join(configDir, 'config.scss'), scss);

  const lines = Object.entries(cfg).map(([k, v]) => `  ${k}: '${v}'`);
  lines.push(`  version: '${pkg.version}'`);
  const js = `const config = {\r\n${lines.join(',\r\n')}\r\n};\r\n\r\nexport default config;\r\n`;
  writeFileSync(join(configDir, 'config.js'), js);
}

function generateIconRegistry(dsfrRoot: string, configDir: string): void {
  const iconDir = join(dsfrRoot, 'src/dsfr/core/icon');
  if (!existsSync(iconDir)) {
    writeFileSync(join(configDir, 'icon.scss'), '$icons-config: (\n);\n');
    writeFileSync(join(configDir, 'icon.json'), '[]');
    return;
  }

  const categories = readdirSync(iconDir).filter(f => lstatSync(join(iconDir, f)).isDirectory());
  let sass = '$icons-config: (\n';
  const json: Array<{ name: string; family: string; category: string; path: string }> = [];
  for (const category of categories) {
    const dir = join(iconDir, category);
    const icons = readdirSync(dir).filter(file =>
      lstatSync(join(dir, file)).isFile() && extname(file) === '.svg'
    );
    for (const icon of icons) {
      const filename = icon.replace(/\.svg$/, '');
      let family: string;
      let name: string;
      if (filename.includes('--')) {
        const [prefix, ...rest] = filename.split('--');
        if (prefix === 'fr') {
          family = 'dsfr';
          name = rest.join('--');
        } else continue;
      } else {
        family = 'remix';
        name = filename;
      }
      const p = `icons/${category}/${icon}`;
      sass += `  ${name}: ( family: '${family}', category: '${category}', path: '${p}' ),\n`;
      json.push({ name, family, category, path: p });
    }
  }
  sass += ');\n';
  writeFileSync(join(configDir, 'icon.scss'), sass);
  writeFileSync(join(configDir, 'icon.json'), JSON.stringify(json));
}

function generatePictogramRegistry(dsfrRoot: string, configDir: string): void {
  const pictoDir = join(dsfrRoot, 'src/dsfr/core/asset/artwork/pictograms');
  if (!existsSync(pictoDir)) {
    writeFileSync(join(configDir, 'pictogram.scss'), '$pictogram-config: (\n);\n');
    writeFileSync(join(configDir, 'pictogram.json'), '[]');
    return;
  }

  const categories = readdirSync(pictoDir).filter(f => lstatSync(join(pictoDir, f)).isDirectory());
  let sass = '$pictogram-config: (\n';
  const json: Array<{ name: string; category: string; path: string }> = [];
  for (const category of categories) {
    const dir = join(pictoDir, category);
    const items = readdirSync(dir).filter(file =>
      lstatSync(join(dir, file)).isFile() && extname(file) === '.svg'
    );
    for (const item of items) {
      const name = item.replace(/\.svg$/, '');
      const p = `artwork/pictograms/${category}/${item}`;
      sass += `  ${name}: ( category: '${category}', path: '${p}' ),\n`;
      json.push({ name, category, path: p });
    }
  }
  sass += ');\n';
  writeFileSync(join(configDir, 'pictogram.scss'), sass);
  writeFileSync(join(configDir, 'pictogram.json'), JSON.stringify(json));
}

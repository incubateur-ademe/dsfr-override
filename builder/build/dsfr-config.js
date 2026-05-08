import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';

/**
 * Reproduce the subset of dsfr/tool/generate/* needed for sass compilation
 * AND for the storybook (pictogram.json, icon.json), so we don't have to run
 * `yarn install` inside the submodule.
 *
 * Generated files go into <root>/.config/, which is in the submodule's
 * .gitignore. Caller passes the workspace path during a build (so .config
 * lives next to the workspace SCSS), and the submodule path before launching
 * storybook (so dsfr/src/dsfr/**\/*.stories.js can resolve their @config refs).
 */
export function generateDsfrConfig(dsfrRoot) {
  const configDir = join(dsfrRoot, '.config');
  if (!existsSync(configDir)) mkdirSync(configDir, { recursive: true });

  generateCore(dsfrRoot, configDir);
  generateIconRegistry(dsfrRoot, configDir);
  generatePictogramRegistry(dsfrRoot, configDir);
  generateMiscStubs(configDir);
}

/**
 * Storybook stories import .config/i18n.json and .config/colors.json. Building
 * the real ones requires the upstream tool/classes/I18n + colors generator with
 * yarn-installed deps (yaml, sass-true...). We provide empty-but-valid stubs:
 * stories that try to lookup an i18n key get null (text falls back to keys),
 * and color references get an empty registry — visually nothing breaks.
 */
function generateMiscStubs(configDir) {
  const i18nPath = join(configDir, 'i18n.json');
  if (!existsSync(i18nPath)) writeFileSync(i18nPath, '{}');
  const colorsPath = join(configDir, 'colors.json');
  if (!existsSync(colorsPath)) writeFileSync(colorsPath, '[]');
}

function generateCore(dsfrRoot, configDir) {
  const pkg = JSON.parse(readFileSync(join(dsfrRoot, 'package.json'), 'utf8'));
  const cfg = pkg.config ?? {};

  const scss = Object.entries(cfg).map(([k, v]) => `$${k}: '${v}';\r\n`).join('');
  writeFileSync(join(configDir, 'config.scss'), scss);

  const lines = Object.entries(cfg).map(([k, v]) => `  ${k}: '${v}'`);
  lines.push(`  version: '${pkg.version}'`);
  const js = `const config = {\r\n${lines.join(',\r\n')}\r\n};\r\n\r\nexport default config;\r\n`;
  writeFileSync(join(configDir, 'config.js'), js);
}

function generateIconRegistry(dsfrRoot, configDir) {
  const iconDir = join(dsfrRoot, 'src/dsfr/core/icon');
  if (!existsSync(iconDir)) {
    writeFileSync(join(configDir, 'icon.scss'), '$icons-config: (\n);\n');
    writeFileSync(join(configDir, 'icon.json'), '[]');
    return;
  }

  const categories = readdirSync(iconDir).filter(f => lstatSync(join(iconDir, f)).isDirectory());
  let sass = '$icons-config: (\n';
  const json = [];
  for (const category of categories) {
    const dir = join(iconDir, category);
    const icons = readdirSync(dir).filter(file =>
      lstatSync(join(dir, file)).isFile() && extname(file) === '.svg'
    );
    for (const icon of icons) {
      const filename = icon.replace(/\.svg$/, '');
      let family, name;
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

function generatePictogramRegistry(dsfrRoot, configDir) {
  const pictoDir = join(dsfrRoot, 'src/dsfr/core/asset/artwork/pictograms');
  if (!existsSync(pictoDir)) {
    writeFileSync(join(configDir, 'pictogram.scss'), '$pictogram-config: (\n);\n');
    writeFileSync(join(configDir, 'pictogram.json'), '[]');
    return;
  }

  const categories = readdirSync(pictoDir).filter(f => lstatSync(join(pictoDir, f)).isDirectory());
  let sass = '$pictogram-config: (\n';
  const json = [];
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

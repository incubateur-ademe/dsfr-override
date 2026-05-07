import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';

/**
 * Reproduce the subset of dsfr/tool/generate/{core,icon}.js needed for sass compilation,
 * so we don't have to run `yarn install` inside the submodule.
 *
 * The DSFR pipeline imports two generated files via @import '../../../.config/<name>.scss':
 *   - config.scss : prefix/namespace/organisation from package.json
 *   - icon.scss   : icon registry built by walking core/icon/icons/<category>/*.svg
 *
 * Output goes into <dsfr>/.config/, which is in the submodule's .gitignore.
 */
export function generateDsfrConfig(dsfrRoot) {
  const configDir = join(dsfrRoot, '.config');
  if (!existsSync(configDir)) mkdirSync(configDir, { recursive: true });

  generateCore(dsfrRoot, configDir);
  generateIconRegistry(dsfrRoot, configDir);
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
    return;
  }

  const categories = readdirSync(iconDir).filter(f => lstatSync(join(iconDir, f)).isDirectory());
  let sass = '$icons-config: (\n';
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
    }
  }
  sass += ');\n';
  writeFileSync(join(configDir, 'icon.scss'), sass);
}

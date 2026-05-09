/**
 * Types du schema de `mapping.yml`. Reflètent `mapping.yml.example`.
 *
 * Les noms de champs existent à la fois en kebab-case (forme authored YAML) et
 * en camelCase parce que le code runtime accepte les deux — un héritage des
 * premières moutures où on lisait directement les clés camelCase.
 */

export type Hex = string;

export type FontStyleKey = 'normal' | 'italic';

/**
 * Une variante par style pour un poids donné. `[k: string]` couvre les valeurs
 * synthétiques qu'on pourrait rencontrer (ex : `oblique`).
 */
export interface FontWeightVariants {
  normal?: string;
  italic?: string;
  [k: string]: string | undefined;
}

/** Section `typography.primary` du mapping : police principale qui remplace Marianne. */
export interface PrimaryTypography {
  'css-name'?: string;
  'files-source'?: string;
  display?: string;
  weights?: Record<string, FontWeightVariants>;
}

/**
 * Section `typography` du mapping. `alt: 'keep'` signale qu'on conserve la
 * police alternative DSFR (Spectral) telle quelle.
 */
export interface Typography {
  primary?: PrimaryTypography;
  alt?: 'keep' | string;
}

export interface AnchorSpec {
  hex?: Hex;
}

/**
 * Description d'un grade injecté manuellement via `colors.<family>.add-grades`.
 * Sert quand une famille a besoin d'un grade absent du profil LCh par défaut
 * (typiquement `sun-157` pour Red Laura, qui n'a pas de variante `sun` upstream).
 */
export interface AddGradeSpec {
  L: number;
  'c-factor'?: number;
  cFactor?: number;
  'dL-hover'?: number;
  dLHover?: number;
  'dL-active'?: number;
  dLActive?: number;
  'c-factor-hover'?: number;
  cFactorHover?: number;
  'c-factor-active'?: number;
  cFactorActive?: number;
}

/** Contrainte WCAG attachée à un grade : ratio minimum contre une couleur de fond. */
export interface WcagSpec {
  min: number;
  against: Hex;
}

/**
 * Configuration d'une famille de couleurs sous `colors.<family>` dans le
 * mapping. Consommée à 3 endroits : génération de palette LCh
 * (`generate/palette.ts`), réécriture de `_options.scss`
 * (`build/transform-options.ts`), et post-process sed (`build/post-process.ts`).
 */
export interface ColorFamily {
  rename?: string;
  anchor?: AnchorSpec;
  generation?: 'lch-remap' | 'manual' | string;
  'recalibrate-grade'?: Record<string, string>;
  recalibrate?: Record<string, string>;
  'add-grades'?: Record<string, AddGradeSpec>;
  addGrades?: Record<string, AddGradeSpec>;
  'semantic-remap'?: Record<string, string>;
  semanticRemap?: Record<string, string>;
  wcag?: Record<string, WcagSpec>;
}

/** Couleur de teinte d'élévation, séparée light/dark — voir `_shadows.scss` upstream. */
export interface ShadowColor {
  light?: string;
  dark?: string;
}

export interface Elevation {
  'shadow-color'?: ShadowColor;
}

/** Une cible CSS dont on force le `border-radius` (et optionnellement `overflow: hidden`). */
export interface BorderRadiusTarget {
  selector: string;
  value: string;
  overflow?: boolean;
}

export interface BorderRadius {
  base?: string;
  targets?: BorderRadiusTarget[];
}

/**
 * Une entrée de `icons.add` : soit un nom Lucide brut (token = nom),
 * soit un objet qui dissocie le token CSS du nom Lucide source.
 */
export type IconAddEntry = string | { token: string; name: string } | { name: string; token?: string };

/**
 * Section `icons` du mapping :
 * - `overrides` : remplace une icône DSFR par une icône Lucide (1-1, même nom de fichier).
 * - `add` : ajoute des `.fr-icon-<token>` non présents upstream.
 */
export interface IconsConfig {
  overrides?: Record<string, string>;
  add?: IconAddEntry[];
}

/** Section `components.remove` : composants DSFR à exclure du build (ex : header, footer). */
export interface ComponentsConfig {
  remove?: string[];
}

export interface PostProcessRename {
  enabled?: boolean;
  'safety-check'?: boolean;
}

/**
 * Section `post-process` du mapping. Pour l'instant, seul `rename` existe :
 * il pilote le remplacement des préfixes (`blue-france` → `blue-ate`) sur
 * les fichiers `dist/*.css|js`.
 */
export interface PostProcess {
  rename?: PostProcessRename;
}

/**
 * Section `post-css` du mapping : pilote la pipeline PostCSS finale
 * (mqpacker + dedup + cssnano si --minify) et le banner. `enabled` à false
 * désactive complètement la pipeline.
 */
export interface PostCss {
  enabled?: boolean;
  banner?: boolean;
  'banner-text'?: string;
}

/**
 * Type racine de `mapping.yml`, ce que les utilisateurs éditent. Toutes les
 * sections sont optionnelles : un mapping vide produit un build qui ne touche
 * rien d'upstream.
 */
export interface Mapping {
  version?: number;
  dsfr?: string;
  typography?: Typography;
  colors?: Record<string, ColorFamily>;
  elevation?: Elevation;
  'border-radius'?: BorderRadius;
  'manual-overrides'?: string[];
  icons?: IconsConfig;
  components?: ComponentsConfig;
  'post-process'?: PostProcess;
  'post-css'?: PostCss;
}

/**
 * Une entrée de palette produite par `computeFamilyPalette` : un nom de grade
 * et son triplet default/hover/active (5-tuple pour le grade `main`, qui
 * porte aussi les variantes hover/active dark).
 */
export interface PaletteEntry {
  name: string;
  values: string[];
}

/**
 * Une ligne du profil LCh par défaut (`profile-lch.ts`). Chaque ligne porte
 * les deltas suffisants pour produire un triplet default/hover/active à partir
 * d'un anchor.
 */
export interface ProfileRow {
  grade: string;
  L: number;
  cFactor: number;
  dLHover: number;
  dLActive: number;
  cFactorHover: number;
  cFactorActive: number;
}

/**
 * Une entrée Sass à compiler : code source SCSS + URL canonique pour les
 * résolutions relatives + nom du fichier de sortie. Construit dans `prepare()`,
 * consommé par `compile()`.
 */
export interface CompileTarget {
  name: string;
  entrySource: string;
  entryUrl: URL;
  outName: string;
}

/**
 * Sortie de `prepare()` : tout ce qu'il faut pour lancer Sass. Le `mapping` est
 * propagé pour que les étapes ultérieures (post-process, banner) ne le relisent
 * pas du disque.
 */
export interface PrepareInput {
  targets: CompileTarget[];
  loadPaths: string[];
  distDir: string;
  workspaceDsfr: string;
  mapping: Mapping | null;
}

export interface PrepareOpts {
  projectRoot: string;
  mappingPath?: string;
  overridesIndex?: string;
  distDir?: string;
}

export interface CompileOpts {
  sourceMap?: boolean;
}

/** Config minimale pour calculer la palette d'une famille (cf. `generate/palette.ts`). */
export interface PaletteCfg {
  anchor: Hex;
  recalibrate?: Record<string, string>;
  addGrades?: Record<string, AddGradeSpec>;
  semanticRemap?: Record<string, string>;
}

/** Entrée `icons.add` après normalisation des trois formes acceptées en YAML. */
export interface IconAddNormalized {
  token: string;
  name: string;
}

/** Variante typée d'`IconAddNormalized` portée jusqu'au générateur SCSS. */
export interface IconAddEntryOutput {
  token: string;
  lucideName: string;
}

/**
 * Résultat d'une compilation Sass : CSS attendu sur disque, et
 * éventuellement variante minifiée. `outFile` est un chemin absolu déjà résolu.
 */
export interface CompileResult {
  name: string;
  outFile: string;
  css: string;
  minCss?: string | null;
}

/** Compteurs et liste exposés par `applyIconMapping` pour le reporting et la génération SCSS aval. */
export interface IconMappingResult {
  overridesApplied: number;
  addsApplied: number;
  addEntries: Array<{ token: string; lucideName: string }>;
}

/** Résultat de `generateOverrides` : ce qui a été matérialisé sur disque. */
export interface GenerateOverridesResult {
  overridesIndex: string;
  written: string[];
  fontsCopied: number;
  jsCopied: number;
  iconsCopied: IconMappingResult;
}

/**
 * Résultat de `validateMapping`. Convention : `errors` non vide = build doit
 * échouer ; `warnings` = informatif sauf en mode --strict.
 */
export interface ValidateMappingResult {
  errors: string[];
  warnings: string[];
}

/** Une divergence détectée entre l'état actuel d'un fichier DSFR et la baseline. */
export interface DriftEntry {
  file: string;
  was: string | null;
  now: string | null;
}

export type DriftStatus = 'ok' | 'no-baseline' | 'drift';

export interface DriftResult {
  status: DriftStatus;
  drifts: DriftEntry[];
}

/**
 * Une vérif WCAG individuelle. `missing: true` signale que le grade demandé
 * n'a pas pu être résolu dans la palette (mapping qui pointe vers un grade
 * inexistant) — distinct d'un échec de ratio.
 */
export interface WcagCheck {
  token: string;
  hex: string | null;
  against: Hex;
  min: number;
  ratio: number;
  ok: boolean;
  missing?: boolean;
}

export interface WcagResult {
  checks: WcagCheck[];
  fails: number;
}

/**
 * État de propreté du submodule DSFR après un build. `dirty` contient l'output
 * brut de `git status --porcelain` quand `clean` est false, pour reporting.
 */
export interface RestoreStatus {
  clean: boolean;
  dirty: string;
}

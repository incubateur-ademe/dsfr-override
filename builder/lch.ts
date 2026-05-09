// Primitives CIELAB / LCh — fonctions pures, aucune dépendance externe.
// Pipeline : sRGB → linear RGB → XYZ (D65) → Lab → LCh, avec clamp par bisection
// dans le gamut sRGB pour la conversion inverse.

export type Triplet = [number, number, number];
export type Hex = string;

const D65 = { Xn: 0.95047, Yn: 1.0, Zn: 1.08883 };

// Constantes CIE (rationnels exacts)
const LAB_EPSILON = 216 / 24389; // 0.008856
const LAB_KAPPA = 24389 / 27;    // 903.296...

// Matrices sRGB <-> linear RGB, D65, IEC 61966-2-1
const M_RGB_TO_XYZ: readonly [Triplet, Triplet, Triplet] = [
  [0.4124564, 0.3575761, 0.1804375],
  [0.2126729, 0.7151522, 0.0721750],
  [0.0193339, 0.1191920, 0.9503041]
];
const M_XYZ_TO_RGB: readonly [Triplet, Triplet, Triplet] = [
  [ 3.2404542, -1.5371385, -0.4985314],
  [-0.9692660,  1.8760108,  0.0415560],
  [ 0.0556434, -0.2040259,  1.0572252]
];

// ---------- Hex / RGB ----------

/**
 * Parse un hexa CSS (`#RRGGBB`, `#RGB`, avec ou sans `#`) vers un triplet RGB
 * normalisé sur [0, 1].
 *
 * @throws si la chaîne n'est pas un hexa de longueur 3 ou 6.
 */
export function hexToRgb(hex: Hex): Triplet {
  const h = hex.startsWith('#') ? hex.slice(1) : hex;
  if (h.length !== 6 && h.length !== 3) throw new Error(`Invalid hex: ${hex}`);
  const norm = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const n = parseInt(norm, 16);
  if (Number.isNaN(n)) throw new Error(`Invalid hex: ${hex}`);
  return [((n >> 16) & 0xff) / 255, ((n >> 8) & 0xff) / 255, (n & 0xff) / 255];
}

/**
 * Sérialise un triplet RGB normalisé sur [0, 1] en `#rrggbb`. Les valeurs
 * hors gamut sont silencieusement clampées (et arrondies au byte).
 */
export function rgbToHex([r, g, b]: Triplet): Hex {
  const clamp = (c: number) => Math.max(0, Math.min(1, c));
  const toByte = (c: number) => Math.round(clamp(c) * 255);
  const hex = [toByte(r), toByte(g), toByte(b)]
    .map(v => v.toString(16).padStart(2, '0'))
    .join('');
  return `#${hex}`;
}

// ---------- sRGB gamma ----------

/** Décompande une valeur sRGB encodée vers la lumière linéaire (IEC 61966-2-1). */
export function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** Encode une valeur linéaire en sRGB (gamma) — inverse de `srgbToLinear`. */
export function linearToSrgb(c: number): number {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

// ---------- RGB <-> XYZ ----------

export function xyzFromLinearRgb([r, g, b]: Triplet): Triplet {
  const [m0, m1, m2] = M_RGB_TO_XYZ;
  return [
    m0[0] * r + m0[1] * g + m0[2] * b,
    m1[0] * r + m1[1] * g + m1[2] * b,
    m2[0] * r + m2[1] * g + m2[2] * b
  ];
}

export function linearRgbFromXyz([x, y, z]: Triplet): Triplet {
  const [m0, m1, m2] = M_XYZ_TO_RGB;
  return [
    m0[0] * x + m0[1] * y + m0[2] * z,
    m1[0] * x + m1[1] * y + m1[2] * z,
    m2[0] * x + m2[1] * y + m2[2] * z
  ];
}

// ---------- XYZ <-> Lab ----------

function fLab(t: number): number {
  return t > LAB_EPSILON ? Math.cbrt(t) : (LAB_KAPPA * t + 16) / 116;
}
function fLabInv(t: number): number {
  const t3 = t ** 3;
  return t3 > LAB_EPSILON ? t3 : (116 * t - 16) / LAB_KAPPA;
}

export function labFromXyz([x, y, z]: Triplet): Triplet {
  const fx = fLab(x / D65.Xn);
  const fy = fLab(y / D65.Yn);
  const fz = fLab(z / D65.Zn);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

export function xyzFromLab([L, a, b]: Triplet): Triplet {
  const fy = (L + 16) / 116;
  const fx = a / 500 + fy;
  const fz = fy - b / 200;
  return [fLabInv(fx) * D65.Xn, fLabInv(fy) * D65.Yn, fLabInv(fz) * D65.Zn];
}

// ---------- Lab <-> LCh ----------

export function lchFromLab([L, a, b]: Triplet): Triplet {
  const C = Math.hypot(a, b);
  let h = Math.atan2(b, a) * 180 / Math.PI;
  if (h < 0) h += 360;
  return [L, C, h];
}

export function labFromLch([L, C, h]: Triplet): Triplet {
  const hr = h * Math.PI / 180;
  return [L, C * Math.cos(hr), C * Math.sin(hr)];
}

// ---------- High-level: hex <-> LCh ----------

/** Convertit un hexa sRGB en coordonnées LCh (L*ab cylindrique). */
export function hexToLch(hex: Hex): Triplet {
  const rgb = hexToRgb(hex);
  const lin: Triplet = [srgbToLinear(rgb[0]), srgbToLinear(rgb[1]), srgbToLinear(rgb[2])];
  const xyz = xyzFromLinearRgb(lin);
  const lab = labFromXyz(xyz);
  return lchFromLab(lab);
}

// Renvoie [r, g, b] en sRGB linéaire ; les canaux peuvent être hors [0, 1] si hors gamut.
function lchToLinearRgb(L: number, C: number, h: number): Triplet {
  const lab = labFromLch([L, C, h]);
  const xyz = xyzFromLab(lab);
  return linearRgbFromXyz(xyz);
}

function inGamut([r, g, b]: Triplet, tol = 1e-4): boolean {
  return r >= -tol && r <= 1 + tol && g >= -tol && g <= 1 + tol && b >= -tol && b <= 1 + tol;
}

/**
 * Convertit un point LCh en hexa sRGB, en clampant le chroma par bisection si
 * la couleur sort du gamut. Le hue et la luminosité sont préservés ; seul C*
 * peut être réduit — l'hypothèse derrière le profil LCh d'ADEME.
 */
export function lchToHex(L: number, C: number, h: number): Hex {
  let lin = lchToLinearRgb(L, C, h);
  if (inGamut(lin)) return rgbToHex([linearToSrgb(lin[0]), linearToSrgb(lin[1]), linearToSrgb(lin[2])]);

  let lo = 0;
  let hi = C;
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    lin = lchToLinearRgb(L, mid, h);
    if (inGamut(lin)) lo = mid;
    else hi = mid;
  }
  lin = lchToLinearRgb(L, lo, h);
  const clamp = (c: number) => Math.max(0, Math.min(1, linearToSrgb(c)));
  return rgbToHex([clamp(lin[0]), clamp(lin[1]), clamp(lin[2])]);
}

// ---------- Contraste WCAG ----------

/** Luminance relative WCAG d'une couleur sRGB (formule 2.x — Y dans CIE XYZ). */
export function relativeLuminance(hex: Hex): number {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

/** Ratio de contraste WCAG entre deux couleurs (toujours >= 1, max 21 pour noir/blanc). */
export function contrastRatio(hex1: Hex, hex2: Hex): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

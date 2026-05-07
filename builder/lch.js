// CIELAB / LCh primitives — pure functions, no external deps.
// Reference: sRGB → linear RGB → XYZ (D65) → Lab → LCh, with bisection clamp into sRGB gamut.

const D65 = { Xn: 0.95047, Yn: 1.0, Zn: 1.08883 };

// CIE constants (exact rationals)
const LAB_EPSILON = 216 / 24389; // 0.008856
const LAB_KAPPA = 24389 / 27;    // 903.296...

// sRGB <-> linear RGB matrices, D65, IEC 61966-2-1
const M_RGB_TO_XYZ = [
  [0.4124564, 0.3575761, 0.1804375],
  [0.2126729, 0.7151522, 0.0721750],
  [0.0193339, 0.1191920, 0.9503041]
];
const M_XYZ_TO_RGB = [
  [ 3.2404542, -1.5371385, -0.4985314],
  [-0.9692660,  1.8760108,  0.0415560],
  [ 0.0556434, -0.2040259,  1.0572252]
];

// ---------- Hex / RGB ----------

export function hexToRgb(hex) {
  const h = hex.startsWith('#') ? hex.slice(1) : hex;
  if (h.length !== 6 && h.length !== 3) throw new Error(`Invalid hex: ${hex}`);
  const norm = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const n = parseInt(norm, 16);
  if (Number.isNaN(n)) throw new Error(`Invalid hex: ${hex}`);
  return [((n >> 16) & 0xff) / 255, ((n >> 8) & 0xff) / 255, (n & 0xff) / 255];
}

export function rgbToHex([r, g, b]) {
  const clamp = c => Math.max(0, Math.min(1, c));
  const toByte = c => Math.round(clamp(c) * 255);
  const hex = [toByte(r), toByte(g), toByte(b)]
    .map(v => v.toString(16).padStart(2, '0'))
    .join('');
  return `#${hex}`;
}

// ---------- sRGB gamma ----------

export function srgbToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function linearToSrgb(c) {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

// ---------- RGB <-> XYZ ----------

export function xyzFromLinearRgb([r, g, b]) {
  const [m0, m1, m2] = M_RGB_TO_XYZ;
  return [
    m0[0] * r + m0[1] * g + m0[2] * b,
    m1[0] * r + m1[1] * g + m1[2] * b,
    m2[0] * r + m2[1] * g + m2[2] * b
  ];
}

export function linearRgbFromXyz([x, y, z]) {
  const [m0, m1, m2] = M_XYZ_TO_RGB;
  return [
    m0[0] * x + m0[1] * y + m0[2] * z,
    m1[0] * x + m1[1] * y + m1[2] * z,
    m2[0] * x + m2[1] * y + m2[2] * z
  ];
}

// ---------- XYZ <-> Lab ----------

function fLab(t) {
  return t > LAB_EPSILON ? Math.cbrt(t) : (LAB_KAPPA * t + 16) / 116;
}
function fLabInv(t) {
  const t3 = t ** 3;
  return t3 > LAB_EPSILON ? t3 : (116 * t - 16) / LAB_KAPPA;
}

export function labFromXyz([x, y, z]) {
  const fx = fLab(x / D65.Xn);
  const fy = fLab(y / D65.Yn);
  const fz = fLab(z / D65.Zn);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

export function xyzFromLab([L, a, b]) {
  const fy = (L + 16) / 116;
  const fx = a / 500 + fy;
  const fz = fy - b / 200;
  return [fLabInv(fx) * D65.Xn, fLabInv(fy) * D65.Yn, fLabInv(fz) * D65.Zn];
}

// ---------- Lab <-> LCh ----------

export function lchFromLab([L, a, b]) {
  const C = Math.hypot(a, b);
  let h = Math.atan2(b, a) * 180 / Math.PI;
  if (h < 0) h += 360;
  return [L, C, h];
}

export function labFromLch([L, C, h]) {
  const hr = h * Math.PI / 180;
  return [L, C * Math.cos(hr), C * Math.sin(hr)];
}

// ---------- High-level: hex <-> LCh ----------

export function hexToLch(hex) {
  const rgb = hexToRgb(hex);
  const lin = rgb.map(srgbToLinear);
  const xyz = xyzFromLinearRgb(lin);
  const lab = labFromXyz(xyz);
  return lchFromLab(lab);
}

// Returns [r, g, b] in linear sRGB, with each channel possibly out of [0, 1] if out of gamut.
function lchToLinearRgb(L, C, h) {
  const lab = labFromLch([L, C, h]);
  const xyz = xyzFromLab(lab);
  return linearRgbFromXyz(xyz);
}

function inGamut([r, g, b], tol = 1e-4) {
  return r >= -tol && r <= 1 + tol && g >= -tol && g <= 1 + tol && b >= -tol && b <= 1 + tol;
}

/**
 * Convert LCh to hex, clamping chroma by bisection if needed to stay in sRGB gamut.
 * Hue and lightness are preserved; only C* may be reduced.
 */
export function lchToHex(L, C, h) {
  let lin = lchToLinearRgb(L, C, h);
  if (inGamut(lin)) return rgbToHex(lin.map(linearToSrgb));

  let lo = 0;
  let hi = C;
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    lin = lchToLinearRgb(L, mid, h);
    if (inGamut(lin)) lo = mid;
    else hi = mid;
  }
  lin = lchToLinearRgb(L, lo, h);
  const srgb = lin.map(c => Math.max(0, Math.min(1, linearToSrgb(c))));
  return rgbToHex(srgb);
}

// ---------- WCAG contrast ----------

export function relativeLuminance(hex) {
  const [r, g, b] = hexToRgb(hex).map(srgbToLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

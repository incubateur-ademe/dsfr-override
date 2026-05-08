import test from 'node:test';
import assert from 'node:assert/strict';
import { validateWcag } from './wcag.js';

test('wcag: empty mapping → no checks', () => {
  const r = validateWcag({ mapping: {} });
  assert.equal(r.checks.length, 0);
  assert.equal(r.fails, 0);
});

test('wcag: ADEME blue-france/red-marianne mapping reproduces Phase 1 ratios', () => {
  const r = validateWcag({
    mapping: {
      colors: {
        'blue-france': {
          rename: 'blue-ate',
          generation: 'lch-remap',
          anchor: { hex: '#4950FB' },
          'recalibrate-grade': { 'main-525': 'main-444', 'sun-113': 'sun-157' },
          wcag: {
            'sun-157':  { min: 4.5, against: '#ffffff' },
            'main-444': { min: 3.0, against: '#ffffff' },
            '625':      { min: 4.5, against: '#1e1e1e' }
          }
        },
        'red-marianne': {
          rename: 'red-laura',
          generation: 'lch-remap',
          anchor: { hex: '#FF3333' },
          'add-grades': { 'sun-157': { L: 15.7, 'c-factor': 1.10 } },
          'recalibrate-grade': { 'main-472': 'main-560' },
          wcag: {
            'sun-157':  { min: 4.5, against: '#ffffff' },
            'main-560': { min: 3.0, against: '#ffffff' },
            '625':      { min: 4.5, against: '#1e1e1e' }
          }
        }
      }
    }
  });

  // All declared constraints must hold (matches Phase 1 documented values).
  assert.equal(r.fails, 0, `failed checks: ${r.checks.filter(c => !c.ok).map(c => c.token).join(', ')}`);
  // Token names should reflect the post-rename family.
  assert.ok(r.checks.some(c => c.token === 'blue-ate-sun-157'));
  assert.ok(r.checks.some(c => c.token === 'red-laura-main-560'));
});

test('wcag: a too-light grade against white is flagged ok=false', () => {
  // anchor #FF3333 with a wcag entry on grade 950 (very light) against white must fail 4.5:1.
  const r = validateWcag({
    mapping: {
      colors: {
        'red-marianne': {
          generation: 'lch-remap',
          anchor: { hex: '#FF3333' },
          wcag: { '950': { min: 4.5, against: '#ffffff' } }
        }
      }
    }
  });
  assert.equal(r.fails, 1);
  assert.equal(r.checks[0].ok, false);
});

test('wcag: missing grade in palette → ok=false with missing flag', () => {
  const r = validateWcag({
    mapping: {
      colors: {
        'blue-france': {
          generation: 'lch-remap',
          anchor: { hex: '#4950FB' },
          wcag: { 'definitely-not-a-grade': { min: 1, against: '#ffffff' } }
        }
      }
    }
  });
  assert.equal(r.fails, 1);
  assert.equal(r.checks[0].missing, true);
});

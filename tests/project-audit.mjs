import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const errors = [];
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const files = (dir) => fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap(d => d.isDirectory() ? files(path.join(dir, d.name)) : [path.join(dir, d.name)]);
const htmlFiles = files('.').filter(p => p.endsWith('.html'));
const jsFiles = [...files('js'), ...files('scripts')].filter(p => /\.(?:js|mjs)$/.test(p));

for (const file of htmlFiles) {
  const source = read(file);
  for (const match of source.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
    const ref = match[1];
    if (/^(?:https?:|data:|mailto:|tel:|#|javascript:)/i.test(ref)) continue;
    const target = path.resolve(root, path.dirname(file), ref.split(/[?#]/)[0]);
    if (!fs.existsSync(target)) errors.push(`${file}: referensi lokal tidak ditemukan: ${ref}`);
  }
  const ids = [...source.matchAll(/\bid=["']([^"']+)["']/g)].map(m => m[1]);
  for (const id of new Set(ids)) if (ids.filter(x => x === id).length > 1) errors.push(`${file}: id HTML ganda: ${id}`);
}

// Every image filename named by JS should be present in assets/images.
for (const file of jsFiles) {
  const source = read(file);
  const refs = new Set([
    ...[...source.matchAll(/(?:asset\(|image\s*:\s*)["']([^"']+\.(?:png|jpe?g|webp|gif))["']/gi)].map(m => m[1]),
    ...[...source.matchAll(/assets\/images\/([^"'`]+\.(?:png|jpe?g|webp|gif))/gi)].map(m => m[1])
  ]);
  for (const ref of refs) if (!fs.existsSync(path.join(root, 'assets/images', ref))) errors.push(`${file}: aset gambar tidak ditemukan: ${ref}`);
}

const css = read('css/style.css');
if ((css.match(/{/g) || []).length !== (css.match(/}/g) || []).length) errors.push('css/style.css: kurung blok CSS tidak seimbang');
for (const file of jsFiles) {
  if (!read(file).trim()) errors.push(`${file}: berkas JavaScript kosong`);
  const syntax = spawnSync(process.execPath, ['--check', path.join(root, file)], { encoding: 'utf8' });
  if (syntax.status !== 0) errors.push(`${file}: sintaks JavaScript tidak valid: ${(syntax.stderr || syntax.stdout).trim()}`);
}

// Check statically referenced game SVGs from the shared gameAsset helper.
for (const file of jsFiles) {
  const source = read(file);
  for (const match of source.matchAll(/gameAsset\(\s*['\"]([^'\"]+\.svg)['\"]\s*\)/g)) {
    const ref = match[1];
    if (!fs.existsSync(path.join(root, 'assets/games', ref))) errors.push(`${file}: aset gameAsset tidak ditemukan: ${ref}`);
  }
}

// Check local references embedded in SVGs, which ordinary HTML auditing cannot see.
for (const file of files('assets').filter(p => p.endsWith('.svg'))) {
  const source = read(file);
  if (!/<svg\b/i.test(source)) errors.push(`${file}: elemen root SVG tidak ditemukan`);
  for (const match of source.matchAll(/(?:href|xlink:href)=["']([^"']+)["']/g)) {
    const ref = match[1];
    if (/^(?:https?:|data:|#)/i.test(ref)) continue;
    const target = path.resolve(root, path.dirname(file), ref);
    if (!fs.existsSync(target)) errors.push(`${file}: referensi SVG lokal tidak ditemukan: ${ref}`);
  }
}

// Verify that expected mobile breakpoints and reduced-motion support are present.
if (!/@media\s*\(max-width:\s*640px\)/.test(css)) errors.push('CSS: breakpoint ponsel 640px tidak ditemukan');
if (!/@media\s*\(max-width:\s*900px\)/.test(css)) errors.push('CSS: breakpoint tablet 900px tidak ditemukan');
if (!/prefers-reduced-motion\s*:\s*reduce/.test(css)) errors.push('CSS: dukungan reduced-motion tidak ditemukan');

for (const key of ['mata', 'hati', 'tangan']) {
  const source = read(`js/stations/${key}.js`);
  if (!source.includes('localControls:true') && !source.includes('localControls: true')) errors.push(`${key}: konfigurasi kontrol lokal tidak ditemukan`);
}

// The checked-in stylesheet must work offline; Tailwind's source and compiled utility file must be present.
for (const file of htmlFiles) {
  const source = read(file);
  if (!source.includes('tailwind.css')) errors.push(`${file}: Tailwind CSS tidak ditautkan`);
  if (!source.includes('style.css')) errors.push(`${file}: stylesheet tema tidak ditautkan`);
}
if (!fs.existsSync(path.join(root, 'css/tailwind.input.css'))) errors.push('css/tailwind.input.css tidak ditemukan');
if (!fs.existsSync(path.join(root, 'css/tailwind.css'))) errors.push('css/tailwind.css hasil kompilasi tidak ditemukan');
if (!fs.existsSync(path.join(root, 'vercel.json'))) errors.push('vercel.json tidak ditemukan');

// All JavaScript imports should resolve to real modules in the static project.
for (const file of jsFiles.filter(p => p.startsWith('js/'))) {
  const source = read(file);
  for (const match of source.matchAll(/(?:from|import)\s*\(?\s*["']([^"']+\.js)["']/g)) {
    const specifier = match[1];
    if (/^(?:https?:|data:)/i.test(specifier)) continue;
    const target = path.resolve(root, path.dirname(file), specifier);
    if (!fs.existsSync(target)) errors.push(`${file}: modul impor tidak ditemukan: ${specifier}`);
  }
}

if (errors.length) {
  console.error(`Audit proyek gagal (${errors.length} temuan):`);
  for (const err of errors) console.error(`- ${err}`);
  process.exitCode = 1;
} else {
  console.log(`Audit proyek lulus: ${htmlFiles.length} halaman HTML, ${jsFiles.length} modul JavaScript (sintaks), referensi lokal/aset, ID HTML, Tailwind, struktur SVG/CSS, dan breakpoint responsif.`);
}

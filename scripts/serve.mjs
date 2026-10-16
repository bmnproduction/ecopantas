import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT || 5173);
const mime = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon'
};
const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, `http://${req.headers.host || 'localhost'}`).pathname);
    let requested = path.resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (requested !== root && !requested.startsWith(root + path.sep)) {
      res.writeHead(403); res.end('Forbidden'); return;
    }
    const stat = await fs.stat(requested).catch(() => null);
    if (stat?.isDirectory()) requested = path.join(requested, 'index.html');
    const data = await fs.readFile(requested);
    res.writeHead(200, { 'Content-Type': mime[path.extname(requested).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('Halaman atau aset tidak ditemukan.');
  }
});
server.listen(port, '0.0.0.0', () => console.log(`ECO PANTAS berjalan di http://localhost:${port}`));
zzz
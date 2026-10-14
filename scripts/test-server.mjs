// Local-only production-build harness; never bundled or deployed.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(process.env.TEST_DIST || 'dist');
const port = Number(process.env.TEST_PORT || 4173);
let mode = 'normal';
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2' };
http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/__test/mode' && req.method === 'POST') {
    mode = url.searchParams.get('value') || 'normal';
    res.end('ok'); return;
  }
  let pathname = decodeURIComponent(url.pathname).replace(/^\/TrackMyCompany(?=\/)/, '');
  if (pathname.endsWith('/')) pathname += 'index.html';
  const file = path.resolve(root, '.' + pathname);
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404); res.end('not found'); return;
  }
  const send = () => {
    let data = fs.readFileSync(file);
    if (pathname === '/sw.js' && mode.startsWith('update')) {
      data = Buffer.from(data.toString().replace("const PRECACHE_ASSETS = [", mode === 'update-broken'
        ? "const PRECACHE_ASSETS = ['./unavailable-chunk.js'," : 'const PRECACHE_ASSETS = [')
        .replace(/(__BUILD_REVISION__|[a-f0-9]{16})/, `test-${mode}`));
    }
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  };
  if (mode === 'slow' && pathname === '/index.html') setTimeout(send, 5000);
  else send();
}).listen(port, '127.0.0.1', () => console.log(`Test build: http://127.0.0.1:${port}`));

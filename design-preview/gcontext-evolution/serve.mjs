import http from 'node:http';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const page = fileURLToPath(new URL('./review.html', import.meta.url));
const port = Number(process.env.GCONTEXT_REVIEW_PORT || 50532);
const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }
  if (pathname !== '/' && pathname !== '/review.html') {
    res.writeHead(404).end('Not found');
    return;
  }
  const content = fs.readFileSync(page);
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Length': content.length,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
  });
  res.end(req.method === 'HEAD' ? undefined : content);
});
server.listen(port, '127.0.0.1', () => console.log(`gcontext story review: http://127.0.0.1:${port}/`));

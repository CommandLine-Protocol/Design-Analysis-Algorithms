const http = require('http');
const fs = require('fs');
const path = require('path');
const { handle } = require('../../algorithms');

const page = fs.readFileSync(path.join(__dirname, 'index.html'));

function send(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
}

http.createServer((req, res) => {
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(page);
  }
  if (req.method === 'POST' && req.url === '/api/run') {
    let body = '';
    req.on('data', d => { body += d; if (body.length > 1e6) req.destroy(); });
    req.on('end', () => {
      try { send(res, 200, handle(JSON.parse(body))); }
      catch (e) { send(res, 400, { error: e.message }); }
    });
    return;
  }
  res.writeHead(404); res.end('Not found');
}).listen(3000, () => console.log('Algorithm Explorer running at http://localhost:3000'));
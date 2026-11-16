const http = require('http');
const fs = require('fs');
const path = require('path');
const { handle } = require('./algorithms');

function send(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
}

http.createServer((req, res) => {
  if (req.method === 'GET') {
    const safeUrl = req.url.split('?')[0];
    const file = safeUrl === '/' ? 'index.html' : safeUrl.replace(/^\//, '');
    const filePath = path.join(__dirname, file);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      const mime = ext === '.html' ? 'text/html; charset=utf-8' :
        ext === '.js' ? 'application/javascript; charset=utf-8' :
          ext === '.css' ? 'text/css' : 'text/plain';
      res.writeHead(200, { 'Content-Type': mime });
      return res.end(fs.readFileSync(filePath));
    }
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

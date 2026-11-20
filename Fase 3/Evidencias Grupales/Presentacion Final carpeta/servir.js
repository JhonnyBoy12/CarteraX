// Servidor estático mínimo para ver la presentación: node presentacion/servir.js
const http = require('http'), fs = require('fs'), path = require('path');
const raiz = __dirname, puerto = process.env.PORT || 3300;
const tipos = { '.html':'text/html; charset=utf-8', '.png':'image/png', '.svg':'image/svg+xml', '.js':'text/javascript', '.css':'text/css' };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/index.html';
  const f = path.join(raiz, path.normalize(p));
  if (!f.startsWith(raiz)) { res.writeHead(403); return res.end(); }
  fs.readFile(f, (e, d) => { if (e) { res.writeHead(404); return res.end('No encontrado'); }
    res.writeHead(200, { 'Content-Type': tipos[path.extname(f)] || 'application/octet-stream' }); res.end(d); });
}).listen(puerto, () => console.log('Presentación en http://localhost:' + puerto));

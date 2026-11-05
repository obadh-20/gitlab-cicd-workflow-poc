const http = require('node:http');

const SERVICE = 'ai-control';
const DEFAULT_PORT = 8017;

function createServer() {
  return http.createServer((req, res) => {
    const path = new URL(req.url, 'http://localhost').pathname;
    res.setHeader('Content-Type', 'application/json');
    if (req.method !== 'GET') {
      res.writeHead(405);
      return res.end(JSON.stringify({ error: 'method not allowed' }));
    }
    if (path === '/healthz') {
      res.writeHead(200);
      return res.end(JSON.stringify({ status: 'ok', service: SERVICE }));
    }
    if (path === '/api/info') {
      res.writeHead(200);
      return res.end(JSON.stringify({ service: SERVICE, environment: process.env.APP_ENV || 'local', version: process.env.APP_VERSION || '0.0.1' }));
    }
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'not found' }));
  });
}

if (require.main === module) {
  createServer().listen(Number(process.env.PORT) || DEFAULT_PORT, '0.0.0.0', () => {
    console.log(SERVICE + " listening on port " + (process.env.PORT || DEFAULT_PORT));
  });
}

module.exports = { createServer };

const http = require('node:http');

function json(res, code, body) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

function createServer() {
  return http.createServer(async (req, res) => {
    const path = new URL(req.url, 'http://localhost').pathname;
    if (req.method !== 'GET') return json(res, 405, { error: 'method not allowed' });
    if (path === '/healthz') return json(res, 200, { status: 'ok', service: 'gateway' });
    const routes = [
      { prefix: '/api/admin', upstream: process.env.ADMINISTRATION_URL || 'http://administration:8010' },
      { prefix: '/api/ai', upstream: process.env.AI_CONTROL_PANEL_URL || 'http://ai-control:8017' }
    ];
    const route = routes.find(r => path === r.prefix || path.startsWith(r.prefix + '/'));
    if (!route) return json(res, 404, { error: 'not found', routes: routes.map(r => r.prefix) });
    const suffix = path.slice(route.prefix.length) || '/';
    try {
      const upstreamUrl = new URL(suffix + new URL(req.url, 'http://localhost').search, route.upstream);
      const upstreamResponse = await fetch(upstreamUrl, { signal: AbortSignal.timeout(3000) });
      res.writeHead(upstreamResponse.status, { 'Content-Type': upstreamResponse.headers.get('content-type') || 'application/json' });
      res.end(Buffer.from(await upstreamResponse.arrayBuffer()));
    } catch (error) {
      json(res, 502, { error: 'upstream unavailable', detail: error.message });
    }
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT) || 8000;
  createServer().listen(port, '0.0.0.0', () => console.log(`gateway listening on port ${port}`));
}

module.exports = { createServer };

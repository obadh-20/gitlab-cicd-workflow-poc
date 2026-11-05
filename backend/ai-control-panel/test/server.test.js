const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('../src/server');

test('ai-control healthcheck', async () => {
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const result = await fetch(`http://127.0.0.1:${server.address().port}/healthz`);
    assert.equal(result.status, 200);
    const body = await result.json();
    assert.equal(body.status, 'ok');
    assert.equal(body.service, 'ai-control');
  } finally {
    await new Promise((resolve, reject) => server.close(err => err ? reject(err) : resolve()));
  }
});

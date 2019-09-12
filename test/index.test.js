'use strict'
const { test } = require('tap')
const Fastify = require('fastify')
const { join } = require('path')
const { createElement } = require('react')
const mockRequire = require('mock-require')
const fastifyReact = require('..')

test('basic', async ({ is }) => {
  const fastify = Fastify()
  
  const html = (app) => `
    <!DOCTYPE html>
    <html>
    <head></head>
    <body>
      <div id="app">${app}</div>
      <script src="main.js"></script>
    </body>
    </html>
  `
  const root = join(__dirname, 'dummy.js')
  require.cache[root] = {}
  const Component = () => {
    return createElement('div', null, 'test')
  }
  mockRequire(require.resolve(root), Component)
  fastify.register(fastifyReact, { html, root })

  const res = await fastify.inject({
    url: '/',
    method: 'GET'
  })
  is(res.statusCode, 200)
  is(res.headers['content-type'], 'text/html; charset=utf-8')
  is(res.body, html('<div data-reactroot="">test</div>'))
  fastify.close()
})
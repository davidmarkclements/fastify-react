'use strict'
const { test } = require('tap')
const Fastify = require('fastify')
const { createElement } = require('react')
const { MODE = 'default' } = process.env
const fastifyReact = MODE === 'webpack'
  ? require('./fixtures/webpack-build').importFastifyReact()
  : (MODE === 'parcel' ? require('./fixtures/parcel-build') : require('..'))

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
  const Component = () => {
    return createElement('div', null, 'test')
  }
  const root = mock(Component)

  fastify.register(fastifyReact, { html, root })

  const res = await fastify.inject({
    url: '/',
    method: 'GET'
  })
  is(res.statusCode, 200)
  is(res.headers['content-type'], 'text/html; charset=utf-8')
  is(res.body, html('<div data-reactroot="">test</div>'))
  fastify.close()
  mock.undo()
})

function mock (Component) {
  // since nothing else will require this file, we use its
  // existence on the file system to house mocked Component modules
  require.cache[__filename] = { exports: Component }
  return __filename
}
mock.undo = () => { require.cache[__filename] = module }

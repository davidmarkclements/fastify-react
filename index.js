const assert = require('assert')
const fp = require('fastify-plugin')
const { createMemoryHistory } = require('history')
const plugin = fp(fastifyReact)

// circumvent webpack warnings for dynamic requires
// which do not apply to this case - since this
// code will always run in Node and never in browser
const Module = require('module')
const mod = Object.values(Module._cache).pop()
const { filename } = mod
const { webpackPolyfill } = module
const webpack = webpackPolyfill === 1
const req = Module.createRequireFromPath(filename)
module.exports = plugin
if (webpack) {
  // useful for testing without compiling tests
  Object.defineProperty(mod.exports, 'importFastifyReact', {
    value () { return module.exports }
  })
}

const defaults = {
  dev: process.env.NODE_ENV !== 'production',
  transpile: false,
  optimize: false,
  stateful: false,
  routing: true
}

async function fastifyReact (fastify, options = {}) {
  const { renderToString } = load('react-dom/server')
  const { createElement } = load('react')
  const config = { ...defaults, ...options }
  assert('html' in config, 'html option is required')
  assert('root' in config, 'root option is required')
  const { html, root } = config
  let { routing } = config

  if (routing === true) {
    routing = {
      strategy: 'default',
      mount: '/'
    }
  }

  assert(typeof root === 'string', 'root option must be a string')
  assert(typeof html === 'function', 'html option must be a function')

  const App = req(root)

  fastify.decorate('react', {
    config,
    get
  })

  if (routing) {
    const stategies = {
      'default' (request) {
        const { url } = request.req
        return { url }
      },
      'react-router' (request) {
        const history = createMemoryHistory({ initialEntries: [request.req.url] })
        return { history }
      },
      'map-props': routing.mapProps
    }
    let { mount, strategy } = routing
    if (mount.slice(-1) === '/') {
      if (mount.length > 1) mount += '/'
      else mount = ''
    }
    get(`${mount}*`, {
      mapProps: stategies[strategy || 'default']
    }, App)
  }

  function get (path, opts = {}, Component) {
    if (typeof opts === 'function') {
      Component = opts
      opts = {}
    }
    if (typeof Component === 'string') {
      // if webpack is being used without fastify-react/webpack-plugin
      // then component is loaded from node_modules (same as non-transpiled
      // or external modules setups). If webpack plugin is used the path
      // string supplied in fastify-react configuration is transformed
      // to be wrapped with require (which then becomes the webpack polyfilled require)
      Component = load(Component)
    }
    const { mapProps } = opts

    const { html } = { ...opts, html: config.html }
    assert(typeof html === 'function', 'html option must be a function')
    assert(typeof mapProps === 'function', 'mapProps option must be a function')
    fastify.get(path, async (request, reply) => {
      reply.type('text/html; charset=utf-8')
      const props = mapProps ? mapProps(request) : null
      return html(renderToString(createElement(Component), props))
    })
  }
}

function load (peer) {
  if (typeof peer !== 'string') return peer
  try {
    // explicit requires for webpacks benefit:
    if (peer === 'react') return require('react')
    if (peer === 'react-dom/server') return require('react-dom/server')
    return req(peer)
  } catch (e) {
    throw Error(`
      fastify-react depends on ${peer} as a peer dependency, 
      ensure that ${peer} is installed in your application
    `)
  }
}

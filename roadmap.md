Full options to be supported:

```js
fastify.register(fastifyReact, {
  dev: process.env.NODE_ENV !== 'production',
  html: (app) => `
    <!DOCTYPE html>
    <html>
    <head>
      <link rel="stylesheet" href="https://unpkg.com/normalize.css@8.0.1/normalize.css"/>
    </head>
    <body>
      <div id="app">${app}</div>
      <script src="${host}assets/main.js"></script>
    </body>
    </html>
  `, // may also be html: {
  //    src: String(path to file) || Buffer of file
  //    locals: {host: 'foo/bar'}
  // }
  root: 'path/to/App/component', // may also be: fastify (if fastify)
  assetPath: 'path/to/assets', // in dev, for asset serving
  transpile: false,
  optimize: false,
  routing: { // may only be set if root is a string, if root is fastify, throw
    strategy: 'react-router', // map-props
    mount: 'path/to/mount',
    // mapProps: (request) => ({url: request.req.url}) // only if strategy is mapProps
  },
  stateful: { // true is both, false is off (and default)
    hooks: true,
    staticFetchMethods: true // or 'nameOfStaticMethod', or {name: 'nameOf', api: 'callbackorpromise'}
  }
})

fastify.react.get('/route', SomeComponent)
fastify.react.get('/route', (props, render) => {
  const newProps = {a: 1, ...props}
  return render(SomeComponent, newProps)
})
fastify.react.get('/route', 'path/to/someComponent')
fastify.react.get('/route', {
  mapProps: (request) => ({url: request.req.url}),
  html: `<div>${fastify.react.root}</div>` //override
  transpile
  optimize,
  stateful,
  side: 'both' // may be 'server', 'client' or 'both', works in tandem with an export to a client side library
}, 'path/to/someComponent')

```
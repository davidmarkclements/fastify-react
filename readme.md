# fastify-react

seamlessly integrate fastify and react, for high performance SSR

## Status: WIP

## Install

```sh
npm install fastify-react
```

## Usage

```js
fastify.register(require('fastify-react'), {
  dev: process.env.NODE_ENV !== 'production',
  html: (app) => `
    <!DOCTYPE html>
    <html>
    <head></head>
    <body>
      <div id="app">${app}</div>
      <script src="main.js"></script>
    </body>
    </html>
  `,
  root: 'path/to/App/component'
})
```

## License

MIT
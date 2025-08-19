import { Elysia } from 'elysia'

const app = new Elysia().get('/', () => {
  return 'Hello world!'
})

app.listen(3333, () => {
  // biome-ignore lint/suspicious/noConsole: sho server
  console.log('HTTP server running!')
})

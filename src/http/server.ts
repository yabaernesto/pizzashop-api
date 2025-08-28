import { Elysia } from 'elysia'

import { env } from '../env'

import { authenticateFromLink } from './routes/authenticate-from-link'
import { registerRestaurant } from './routes/register-restaurant'
import { sendAuthLink } from './routes/send-auth-link'

const app = new Elysia()
  .use(registerRestaurant)
  .use(sendAuthLink)
  .use(authenticateFromLink)

app.listen(env.PORT, () => {
  // biome-ignore lint/suspicious/noConsole: sho server
  console.log('🔥 HTTP server running!')
})

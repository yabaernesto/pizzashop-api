import { Elysia } from 'elysia'

import { env } from '../env'

import { authenticateFormLink } from './routes/authenticate-form-link'
import { registerRestaurant } from './routes/register-restaurant'
import { sendAuthLink } from './routes/send-auth-link'
import { signOut } from './routes/sign-out'

const app = new Elysia()
  .use(registerRestaurant)
  .use(sendAuthLink)
  .use(authenticateFormLink)
  .use(signOut)

app.listen(env.PORT, () => {
  // biome-ignore lint/suspicious/noConsole: show server
  console.log('🔥 HTTP server running!')
})

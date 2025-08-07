import { Elysia } from 'elysia'

import { env } from '../env'

import { authenticateFromLink } from './routes/authenticate-from-link'
import { getProfile } from './routes/get-profile'
import { registerRestaurant } from './routes/register-restaurant'
import { sendAuthLink } from './routes/send-auth-link'
import { signOut } from './routes/sign-out'

const app = new Elysia()
  .use(registerRestaurant)
  .use(sendAuthLink)
  .use(authenticateFromLink)
  .use(signOut)
  .use(getProfile)

app.listen(env.PORT, () => {
  // biome-ignore lint/suspicious/noConsole: show server
  console.log('🔥 HTTP server running!')
})

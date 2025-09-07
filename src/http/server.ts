import { Elysia } from 'elysia'

import { env } from '../env'

import { authenticateFromLink } from './routes/authenticate-from-link'
import { getManagedRestaurant } from './routes/get-managed-restaurant'
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
  .use(getManagedRestaurant)
  .onError(({ code, error, set }) => {
    switch (code) {
      case 'VALIDATION': {
        set.status = error.status

        return error.toResponse()
      }
      case 'NOT_FOUND': {
        return new Response(null, { status: 404 })
      }
      default: {
        // biome-ignore lint/suspicious/noConsole: show error
        console.error(error)

        return new Response(null, { status: 500 })
      }
    }
  })

app.listen(env.PORT, () => {
  // biome-ignore lint/suspicious/noConsole: sho server
  console.log('🔥 HTTP server running!')
})

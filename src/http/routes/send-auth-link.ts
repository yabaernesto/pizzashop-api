import { createId } from '@paralleldrive/cuid2'
import { type Elysia, t } from 'elysia'

import { db } from '../../db/connection'
import { authLinks } from '../../db/schema'
import { env } from '../../env'

export const sendAuthLink = (app: Elysia) => {
  return app.post(
    '/authenticate',
    async ({ body }) => {
      const { email } = body

      const userFromEmail = await db.query.users.findFirst({
        where(fields, { eq }) {
          return eq(fields.email, email)
        },
      })

      if (!userFromEmail) {
        throw new Error('User not found.')
      }

      const authLinkCode = createId()

      await db.insert(authLinks).values({
        userId: userFromEmail.id,
        code: authLinkCode,
      })

      const authLink = new URL('/auth-links/authenticate', env.API_BASE_URL)

      authLink.searchParams.set('code', authLinkCode)
      authLink.searchParams.set('redirect', env.AUTH_REDIRECT_URL)

      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.log(authLink.toString())
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
      }),
    }
  )
}

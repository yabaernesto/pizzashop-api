import dayjs from 'dayjs'
import { eq } from 'drizzle-orm'
import { type Elysia, t } from 'elysia'

import { db } from '../../db/connection'
import { authLinks } from '../../db/schema'
import { auth } from '../auth'

export const authenticateFromLink = (app: Elysia) => {
  return app.use(auth).get(
    '/auth-links/authenticate',
    async ({ query, signUser }) => {
      const { code, redirect } = query

      const authLinkFromCode = await db.query.authLinks.findFirst({
        where(fields, { eq }) {
          return eq(fields.code, code)
        },
      })

      if (!authLinkFromCode) {
        throw new Error('Auth link not found.')
      }

      const daysSinceAuthLinkWasCreated = dayjs().diff(
        authLinkFromCode.createdAt,
        'days'
      )

      if (daysSinceAuthLinkWasCreated > 7) {
        throw new Error('Auth link expired, please generate a new one.')
      }

      const managedRestaurant = await db.query.restaurants.findFirst({
        where(fields, { eq }) {
          return eq(fields.managerId, authLinkFromCode.userId)
        },
      })

      // define o cookie de autenticação
      await signUser({
        sub: authLinkFromCode.userId,
        restaurantId: managedRestaurant?.id,
      })

      await db.delete(authLinks).where(eq(authLinks.code, code))

      // ⚡ retorno explícito com redirecionamento HTTP padrão
      return new Response(null, {
        status: 302,
        headers: {
          Location: redirect,
        },
      })
    },
    {
      query: t.Object({
        code: t.String(),
        redirect: t.String(),
      }),
    }
  )
}

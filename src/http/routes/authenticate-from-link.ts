import dayjs from 'dayjs'
import { eq } from 'drizzle-orm'
import { type Elysia, t } from 'elysia'

import { db } from '../../db/connection'
import { authLinks } from '../../db/schema'

import { auth } from '../auth'

export const authenticateFromLink = (app: Elysia) => {
  return app.use(auth).get(
    '/auth-links/authenticate',
    async ({ query, redirect: redirection, jwt: { sign }, setCookie }) => {
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

      const token = await sign({
        sub: authLinkFromCode.userId,
        restaurantId: managedRestaurant?.id,
      })

      setCookie('auth', token, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7, // 7 dias
        path: '/',
      })

      await db.delete(authLinks).where(eq(authLinks.code, code))

      return redirection(redirect)
    },
    {
      query: t.Object({
        code: t.String(),
        redirect: t.String(),
      }),
    }
  )
}

import dayjs from 'dayjs'
import { eq } from 'drizzle-orm'
import Elysia, { t } from 'elysia'

import { db } from '../../db/connection'
import { authLinks } from '../../db/schema'
import { auth } from '../auth'

export const authenticateFormLink = new Elysia().use(auth).get(
  '/auth-links/authenticate',
  async ({ query, jwt, setCookie, redirect }) => {
    const { code, redirection } = query

    const authLinkFromCode = await db.query.authLinks.findFirst({
      where(fields, { eq: eqLocal }) {
        return eqLocal(fields.code, code)
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
      where(fields, { eq: eqLocal }) {
        return eqLocal(fields.managerId, authLinkFromCode.userId)
      },
    })

    const token = await jwt.sign({
      sub: authLinkFromCode.userId,
      restaurantId: managedRestaurant?.id,
    })

    setCookie('auth', token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    await db.delete(authLinks).where(eq(authLinks.code, code))

    redirect(redirection)
  },
  {
    query: t.Object({
      code: t.String(),
      redirection: t.String(),
    }),
  }
)

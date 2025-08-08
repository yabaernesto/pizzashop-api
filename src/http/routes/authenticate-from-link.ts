import dayjs from 'dayjs'
import { eq } from 'drizzle-orm'
import Elysia, { t } from 'elysia'

import { db } from '../../db/connection'
import { authLinks } from '../../db/schema'
import { type AuthContext, auth } from '../auth'

export const authenticateFromLink = new Elysia().use(auth).get(
  '/auth-links/authenticate',
  async (
    ctx: AuthContext & {
      query: { code: string; redirect: string }
      redirect: (url: string) => void
    }
  ) => {
    const { code, redirect: redirection } = ctx.query

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

    await ctx.signUser({
      sub: authLinkFromCode.userId,
      restaurantId: managedRestaurant?.id,
    })

    await db.delete(authLinks).where(eq(authLinks.code, code))

    ctx.redirect(redirection)
  },
  {
    query: t.Object({
      code: t.String(),
      redirect: t.String(),
    }),
  }
)

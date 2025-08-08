import Elysia from 'elysia'

import { db } from '../../db/connection'
import { type AuthContext, auth } from '../auth'

export const getProfile = new Elysia()
  .use(auth)
  .get('/me', async (ctx: AuthContext) => {
    const { userId } = await ctx.getCurrentUser()

    const user = await db.query.users.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, userId)
      },
    })

    if (!user) {
      throw new Error('User not found.')
    }

    return user
  })

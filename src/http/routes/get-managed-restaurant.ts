import Elysia from 'elysia'

import { db } from '../../db/connection'
import { type AuthContext, auth } from '../auth'

export const getManagedRestaurant = new Elysia()
  .use(auth)
  .get('/managed-restaurant', async (ctx: AuthContext) => {
    const { restaurantId } = await ctx.getCurrentUser()

    if (!restaurantId) {
      throw new Error('User is not a manager.')
    }

    const managedRestaurant = await db.query.users.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, restaurantId)
      },
    })

    return managedRestaurant
  })

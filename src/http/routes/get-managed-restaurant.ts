import type Elysia from 'elysia'

import { db } from '../../db/connection'
import { auth } from '../auth'

export const getManagedRestaurant = (app: Elysia) => {
  return app
    .use(auth)
    .get('/managed-restaurant', async ({ getCurrentUser }) => {
      const { restaurantId } = await getCurrentUser()

      if (!restaurantId) {
        throw new Error('User is not a manager.')
      }

      const managedRestaurant = await db.query.restaurants.findFirst({
        where(fields, { eq }) {
          return eq(fields.id, restaurantId)
        },
      })

      return managedRestaurant
    })
}

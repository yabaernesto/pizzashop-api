import { type Elysia, t } from 'elysia'

import { db } from '../../db/connection'
import { restaurants, users } from '../../db/schema'

export const registerRestaurant = (app: Elysia) => {
  return app.post(
    '/restaurants',
    async ({ body, set }) => {
      const { restaurantName, name, email, phone } = body

      const [manager] = await db
        .insert(users)
        .values({
          name,
          email,
          phone,
          role: 'manager',
        })
        .returning({
          id: users.id,
        })

      await db.insert(restaurants).values({
        name: restaurantName,
        managerId: manager.id,
      })

      set.status = 204
    },
    {
      body: t.Object({
        restaurantName: t.String(),
        name: t.String(),
        email: t.String({ format: 'email' }),
        phone: t.String(),
      }),
    }
  )
}

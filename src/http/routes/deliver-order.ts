import { eq } from 'drizzle-orm'
import { type Elysia, t } from 'elysia'

import { db } from '../../db/connection'
import { orders } from '../../db/schema'
import { auth } from '../auth'
import { UnauthorizedError } from '../errors/unauthorized-error'

export const deliverOrder = (app: Elysia) => {
  return app.use(auth).patch(
    '/orders/:orderId/deliver',
    async ({ getCurrentUser, set, params }) => {
      const { orderId } = params
      const { restaurantId } = await getCurrentUser()

      if (!restaurantId) {
        throw new UnauthorizedError()
      }

      const order = await db.query.orders.findFirst({
        // biome-ignore lint/nursery/noShadow: imports
        where(fields, { eq, and }) {
          return and(
            eq(fields.id, orderId),
            eq(fields.restaurantId, restaurantId)
          )
        },
      })

      if (!order) {
        set.status = 400

        return { message: 'Order not found.' }
      }

      if (order.status !== 'delivering') {
        set.status = 400

        return {
          message:
            'You cannot deliver order that are not in "delivering" status.',
        }
      }

      await db
        .update(orders)
        .set({ status: 'delivered' })
        .where(eq(orders.id, orderId))
    },
    {
      params: t.Object({
        orderId: t.String(),
      }),
    }
  )
}

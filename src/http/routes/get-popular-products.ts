import { desc, eq, sum } from 'drizzle-orm'
import type Elysia from 'elysia'

import { db } from '../../db/connection'
import { orderItems, orders, products } from '../../db/schema'
import { auth } from '../auth'
import { UnauthorizedError } from '../errors/unauthorized-error'

export const getPopularProducts = (app: Elysia) => {
  return app
    .use(auth)
    .get('/metrics/popular-products', async ({ getCurrentUser }) => {
      const { restaurantId } = await getCurrentUser()

      if (!restaurantId) {
        throw new UnauthorizedError()
      }

      const popularProducts = await db
        .select({
          product: products.name,
          amount: sum(orderItems.quantity).mapWith(Number),
        })
        .from(orderItems)
        .leftJoin(orders, eq(orders.id, orderItems.orderId))
        .leftJoin(products, eq(products.id, orderItems.productId))
        .where(eq(orders.restaurantId, restaurantId))
        .groupBy(products.name)
        .orderBy((fields) => {
          return desc(fields.amount)
        })
        .limit(5)

      return popularProducts
    })
}

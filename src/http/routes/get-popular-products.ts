import { desc, eq, sum } from 'drizzle-orm'
import Elysia from 'elysia'

import { db } from '../../db/connection'
import { orderItems, orders, products } from '../../db/schema'
import { type AuthContext, auth } from '../auth'
import { UnauthorizedError } from '../errors/unauthorized-error'

export const getPopularProducts = new Elysia()
  .use(auth)
  .get('/metrics/popular-products', async (ctx: AuthContext) => {
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
      .leftJoin(orders, eq(orders.id, orderItems.id))
      .leftJoin(products, eq(products.id, orderItems.productId))
      .where(eq(orders.restaurantId, restaurantId))
      .groupBy(products.name)
      .orderBy((fields) => {
        return desc(fields.amount)
      })
      .limit(5)

    return popularProducts
  })

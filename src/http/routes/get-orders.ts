import { and, count, eq, getTableColumns, ilike } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-typebox'
import Elysia, { t } from 'elysia'

import { db } from '../../db/connection'
import { orders, users } from '../../db/schema'
import { type AuthContext, auth } from '../auth'
import { UnauthorizedError } from '../errors/unauthorized-error'

export const getOrders = new Elysia().use(auth).get(
  '/orders',
  async (ctx: AuthContext) => {
    const { restaurantId } = await ctx.getCurrentUser()
    const { customerName, orderId, status, pageIndex } = ctx.query

    if (!restaurantId) {
      throw new UnauthorizedError()
    }

    const orderTableColumns = getTableColumns(orders)

    const baseQuery = db
      .select(orderTableColumns)
      .from(orders)
      .innerJoin(users, eq(users.id, orders.customerId))
      .where(
        and(
          eq(orders.restaurantId, restaurantId),
          orderId ? ilike(orders.id, `%${orderId}%`) : undefined,
          status ? eq(orders.status, status) : undefined,
          customerName ? ilike(users.name, `%${customerName}%`) : undefined
        )
      )

    const [[{ count: amountOfOrders }], allOrders] = await Promise.all([
      db.select({ count: count() }).from(baseQuery.as('baseQuery')),
      db
        .select()
        .from(baseQuery.as('baseQuery'))
        .offset(Number(pageIndex) * 10)
        .limit(10),
    ])

    return {
      orders: allOrders,
      meta: {
        pageIndex,
        perPage: 10,
        totalCount: amountOfOrders,
      },
    }
  },
  {
    query: t.Object({
      customerName: t.Optional(t.String()),
      orderId: t.Optional(t.String()),
      status: t.Optional(createSelectSchema(orders).properties.status),
      pageIndex: t.Numeric({ minimum: 1 }),
    }),
  }
)

import dayjs from 'dayjs'
import { and, count, eq, gte, sql } from 'drizzle-orm'
import type Elysia from 'elysia'

import { db } from '../../db/connection'
import { orders } from '../../db/schema'
import { auth } from '../auth'
import { UnauthorizedError } from '../errors/unauthorized-error'

export const getMonthCanceledOrdersAmount = (app: Elysia) => {
  return app
    .use(auth)
    .get(
      '/metrics/month-canceled-orders-amount',
      async ({ getCurrentUser }) => {
        const { restaurantId } = await getCurrentUser()

        if (!restaurantId) {
          throw new UnauthorizedError()
        }

        const today = dayjs()
        const lastMoth = today.subtract(1, 'month')
        const startOfLastMoth = lastMoth.startOf('month')

        const lastMothWithYear = lastMoth.format('YYYY-MM')
        const currentMothWithYear = lastMoth.format('YYYY-MM')

        const ordersPerMonth = await db
          .select({
            monthWithYear: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`,
            amount: count(),
          })
          .from(orders)
          .where(
            and(
              eq(orders.restaurantId, restaurantId),
              eq(orders.status, 'canceled'),
              gte(orders.createdAt, startOfLastMoth.toDate())
            )
          )
          .groupBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`)

        const currentMothOrdersAmount = ordersPerMonth.find((orderPerMonth) => {
          return orderPerMonth.monthWithYear === currentMothWithYear
        })

        const lastMonthOrdersAmount = ordersPerMonth.find((orderPerMonth) => {
          return orderPerMonth.monthWithYear === lastMothWithYear
        })

        const diffFromLastMoth =
          currentMothOrdersAmount && lastMonthOrdersAmount
            ? (currentMothOrdersAmount.amount * 100) /
              lastMonthOrdersAmount.amount
            : null

        return {
          amount: currentMothOrdersAmount?.amount,
          diffFromLastMoth: diffFromLastMoth
            ? Number((diffFromLastMoth - 100).toFixed(2))
            : 0,
        }
      }
    )
}

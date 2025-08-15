import dayjs from 'dayjs'
import { and, count, eq, gte, sql } from 'drizzle-orm'
import type Elysia from 'elysia'

import { db } from '../../db/connection'
import { orders } from '../../db/schema'
import { auth } from '../auth'
import { UnauthorizedError } from '../errors/unauthorized-error'

export const getMothCanceledOrdersAmount = (app: Elysia) =>
  app
    .use(auth)
    .get(
      '/metrics/month-canceled-orders-amount',
      async ({ getCurrentUser }) => {
        const { restaurantId } = await getCurrentUser()

        if (!restaurantId) {
          throw new UnauthorizedError()
        }

        const today = dayjs()
        const lastMonth = today.subtract(1, 'month')
        const startOfLastMonth = lastMonth.startOf('month')

        const ordersPerMoth = await db
          .select({
            monthWithYear: sql<string>`TO_CHAR${orders.createdAt}, 'YYYY-MM'`,
            amount: count(),
          })
          .from(orders)
          .where(
            and(
              eq(orders.restaurantId, restaurantId),
              eq(orders.status, 'canceled'),
              gte(orders.createdAt, startOfLastMonth.toDate())
            )
          )
          .groupBy(sql`TO_CHAR${orders.createdAt}, 'YYYY-MM'`)

        const currentMonthWithYear = today.format('YYYY-MM')
        const lastMonthWithYear = lastMonth.format('YYYY-MM')

        const currentMonthOrdersAmount = ordersPerMoth.find(
          (orderPerMoth) => orderPerMoth.monthWithYear === currentMonthWithYear
        )

        const lastMonthOrdersAmount = ordersPerMoth.find(
          (orderPerMoth) => orderPerMoth.monthWithYear === lastMonthWithYear
        )

        const diffFromLastMonth =
          currentMonthOrdersAmount && lastMonthOrdersAmount
            ? (currentMonthOrdersAmount.amount * 100) /
              lastMonthOrdersAmount.amount
            : null

        return {
          amount: currentMonthOrdersAmount?.amount,
          diffFromLastMonth: diffFromLastMonth
            ? Number((diffFromLastMonth - 100).toFixed(2))
            : 0,
        }
      }
    )

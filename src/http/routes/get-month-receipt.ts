import dayjs from 'dayjs'
import { and, eq, gte, sql, sum } from 'drizzle-orm'
import type Elysia from 'elysia'

import { db } from '../../db/connection'
import { orders } from '../../db/schema'
import { auth } from '../auth'
import { UnauthorizedError } from '../errors/unauthorized-error'

export const getMonthReceipt = (app: Elysia) => {
  return app
    .use(auth)
    .get('/metrics/month-receipt', async ({ getCurrentUser }) => {
      const { restaurantId } = await getCurrentUser()

      if (!restaurantId) {
        throw new UnauthorizedError()
      }

      const today = dayjs()
      const lastMoth = today.subtract(1, 'month')
      const startOfLastMoth = lastMoth.startOf('month')

      const lastMothWithYear = lastMoth.format('YYYY-MM')
      const currentMothWithYear = lastMoth.format('YYYY-MM')

      const monthsReceipts = await db
        .select({
          monthWithYear: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`,
          receipt: sum(orders.totalInCents).mapWith(Number),
        })
        .from(orders)
        .where(
          and(
            eq(orders.restaurantId, restaurantId),
            gte(orders.createdAt, startOfLastMoth.toDate())
          )
        )
        .groupBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`)

      const currentMothReceipt = monthsReceipts.find((mothReceipt) => {
        return mothReceipt.monthWithYear === currentMothWithYear
      })

      const lastMothReceipt = monthsReceipts.find((mothReceipt) => {
        return mothReceipt.monthWithYear === lastMothWithYear
      })

      const diffFromLastMoth =
        currentMothReceipt && lastMothReceipt
          ? (currentMothReceipt.receipt * 100) / lastMothReceipt.receipt
          : null

      return {
        receipt: currentMothReceipt?.receipt,
        diffFromLastMoth: diffFromLastMoth
          ? Number((diffFromLastMoth - 100).toFixed(2))
          : 0,
      }
    })
}

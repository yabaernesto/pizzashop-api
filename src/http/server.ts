import { Elysia } from 'elysia'

import { env } from '../env'
import { auth } from './auth'
import { approveOrder } from './routes/approve-order'
import { authenticateFromLink } from './routes/authenticate-from-link'
import { cancelOrder } from './routes/cancel-order'
import { deliverOrder } from './routes/deliver-order'
import { dispatchOrder } from './routes/dispatch-order'
import { getDailyReceiptInPeriod } from './routes/get-daily-receipt-in-period'
import { getDayOrderAmount } from './routes/get-day-orders-amount'
import { getManagedRestaurant } from './routes/get-managed-restaurant'
import { getMonthReceipt } from './routes/get-month-receipt'
import { getMothCanceledOrdersAmount } from './routes/get-moth-canceled-orders-amount'
import { getMothOrdersAmount } from './routes/get-moth-orders-amount'
import { getOrderDetails } from './routes/get-order-details'
import { getOrders } from './routes/get-orders'
import { getPopularProducts } from './routes/get-popular-products'
import { getProfile } from './routes/get-profile'
import { registerRestaurant } from './routes/register-restaurant'
import { sendAuthLink } from './routes/send-auth-link'
import { signOut } from './routes/sign-out'

const app = new Elysia()
  .use(auth)
  .use(registerRestaurant)
  .use(sendAuthLink)
  .use(authenticateFromLink)
  .use(signOut)
  .use(getProfile)
  .use(getManagedRestaurant)
  .use(getOrderDetails)
  .use(approveOrder)
  .use(cancelOrder)
  .use(deliverOrder)
  .use(dispatchOrder)
  .use(getOrders)
  .use(getMonthReceipt)
  .use(getDayOrderAmount)
  .use(getMothOrdersAmount)
  .use(getMothCanceledOrdersAmount)
  .use(getPopularProducts)
  .use(getDailyReceiptInPeriod)
  .use(getDailyReceiptInPeriod)
  .onError(({ code, error, set }) => {
    switch (code) {
      case 'VALIDATION': {
        set.status = error.status

        return error.toResponse()
      }
      case 'NOT_FOUND': {
        return new Response(null, { status: 404 })
      }
      default: {
        // biome-ignore lint/suspicious/noConsole: show error
        console.error(error)

        return new Response(null, { status: 500 })
      }
    }
  })

app.listen(env.PORT, () => {
  // biome-ignore lint/suspicious/noConsole: show server
  console.log('🔥 HTTP server running!')
})

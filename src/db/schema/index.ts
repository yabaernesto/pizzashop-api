import { authLinks } from './auth-links'
import { orderItems } from './order-items'
import { orders } from './orders'
import { products } from './products'
import { restaurants } from './restaurants'
import { users } from './users'

export * from './auth-links'
export * from './order-items'
export * from './orders'
export * from './products'
export * from './restaurants'
export * from './users'

export const schema = {
  users,
  restaurants,
  authLinks,
  orders,
  products,
  orderItems,
}

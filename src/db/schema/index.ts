import * as authLinks from './auth-links'
import * as restaurants from './restaurants'
import * as users from './users'

export * from './auth-links'
export * from './restaurants'
export * from './users'

export const schema = {
  ...users,
  ...restaurants,
  ...authLinks,
}

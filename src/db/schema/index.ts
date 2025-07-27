import * as users from './users'
import * as restaurants from './restaurants'

export * from './users'
export * from './restaurants'

export const schema = {
  ...users,
  ...restaurants,
}

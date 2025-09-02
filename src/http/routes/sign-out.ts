import type Elysia from 'elysia'
import { auth } from '../auth'

export const signOut = (app: Elysia) => {
  return app.use(auth).post('/sign-out', ({ signOut: internalSignOut }) => {
    internalSignOut()
  })
}

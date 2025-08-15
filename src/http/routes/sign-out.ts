import type Elysia from 'elysia'

import type { AuthContext } from '../auth'

export const signOut = (app: Elysia) =>
  app.post('/sign-out', (ctx: AuthContext) => {
    ctx.signOut()
  })

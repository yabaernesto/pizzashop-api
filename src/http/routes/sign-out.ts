import Elysia from 'elysia'

import { type AuthContext, auth } from '../auth'

export const signOut = new Elysia()
  .use(auth)
  .post('/sign-out', (ctx: AuthContext) => {
    ctx.signOut()
  })

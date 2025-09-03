// src/hooks/restrictToOwnerOrAdmin.ts
import { Forbidden, BadRequest } from '@feathersjs/errors'
import type { HookContext } from '@feathersjs/feathers'

export const restrictToOwnerOrAdmin = async (context: HookContext) => {
  const { params, method, type } = context

  // internal: skip
  if (!params?.provider) return context

  const user = params.user
  if (!user) throw new Forbidden('Unauthenticated')
  if (user.role === 'admin') return context

  if (type === 'before' && method === 'find') {
    context.params.query = { ...(context.params.query || {}), userId: user.id }
    return context
  }

  if (type === 'after' && (method === 'get' || method === 'patch' || method === 'remove' || method === 'update')) {
    if (!context.result) throw new BadRequest('No result to authorize')
    const r: any = context.result
    if (Array.isArray(r.data)) {
      if (r.data.some((x: any) => x.userId !== user.id)) {
        throw new Forbidden('Forbidden resource')
      }
    } else if (r.userId !== user.id) {
      throw new Forbidden('Forbidden resource')
    }
    return context
  }

  return context
}
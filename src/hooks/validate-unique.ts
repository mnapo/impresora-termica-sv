import type { HookContext } from '@feathersjs/feathers'
import { Conflict } from '@feathersjs/errors'

export const validateUnique = (field: string) => {
  return async (context: HookContext) => {
    const { data, id, service, params } = context

    const userId = params.user?.id

    if (!data?.[field] || !userId) {
      return context
    }

    const query: any = {
      [field]: data[field],
      userId,
      $limit: 1
    }

    if (id) query.id = { $ne: id }

    const existing: any = await service.find({ ...params, query })
    const count = Array.isArray(existing) ? existing.length : existing.total ?? 0

    if (count > 0) {
      throw new Conflict('El código ya existe para este usuario', {
        field,
        value: data[field]
      })
    }

    return context
  }
}

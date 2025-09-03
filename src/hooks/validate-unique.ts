// src/hooks/validateUnique.ts
import { BadRequest } from '@feathersjs/errors'
import type { HookContext } from '@feathersjs/feathers'

export const validateUnique = (field: string) => {
  return async (context: HookContext) => {
    const { data, id, service, params } = context
    // patch: if no data for the field, skip
    if (!data?.[field] || !data?.userId) return context

    const query: any = {
      [field]: data[field],
      userId: data.userId,
      $limit: 1
    }

    // update/patch: exclude current record
    if (id) query.id = { $ne: id }

    const existing: any = await service.find({ ...params, query })

    const count = Array.isArray(existing) ? existing.length : existing.total ?? 0
    if (count > 0) {
      throw new BadRequest(`Error: "${field}" already exists.`)
    }

    return context
  }
}

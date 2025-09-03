import type { HookContext } from "@feathersjs/feathers";

export const validateUnique = (field: string) => {
  return async (context: HookContext) => {
    const { data, id, service } = context;

    // patch: if no data for the field, skip
    if (!data[field] || !data.userId) return context;

    const query: any = { 
      [field]: data[field], 
      userId: data.userId,
      $limit: 1 
    };

    // update/patch: exclude current record
    if (id) query.id = { $ne: id };

    const existing = await service.find({ query });

    if (existing.total > 0) {
      throw new Error(`Error: "${field}" already exists.`);
    }

    return context;
  };
};

// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { CondIvaTypesService } from './cond-iva-types.class'

// Main data model schema
export const condIvaTypesSchema = Type.Object(
  {
    id: Type.Number(),
    name: Type.String()
  },
  { $id: 'CondIvaTypes', additionalProperties: false }
)
export type CondIvaTypes = Static<typeof condIvaTypesSchema>
export const condIvaTypesValidator = getValidator(condIvaTypesSchema, dataValidator)
export const condIvaTypesResolver = resolve<CondIvaTypes, HookContext<CondIvaTypesService>>({})

export const condIvaTypesExternalResolver = resolve<CondIvaTypes, HookContext<CondIvaTypesService>>({})

// Schema for creating new entries
export const condIvaTypesDataSchema = Type.Pick(condIvaTypesSchema, ['name'], {
  $id: 'CondIvaTypesData'
})
export type CondIvaTypesData = Static<typeof condIvaTypesDataSchema>
export const condIvaTypesDataValidator = getValidator(condIvaTypesDataSchema, dataValidator)
export const condIvaTypesDataResolver = resolve<CondIvaTypes, HookContext<CondIvaTypesService>>({})

// Schema for updating existing entries
export const condIvaTypesPatchSchema = Type.Partial(condIvaTypesSchema, {
  $id: 'CondIvaTypesPatch'
})
export type CondIvaTypesPatch = Static<typeof condIvaTypesPatchSchema>
export const condIvaTypesPatchValidator = getValidator(condIvaTypesPatchSchema, dataValidator)
export const condIvaTypesPatchResolver = resolve<CondIvaTypes, HookContext<CondIvaTypesService>>({})

// Schema for allowed query properties
export const condIvaTypesQueryProperties = Type.Pick(condIvaTypesSchema, ['name'])
export const condIvaTypesQuerySchema = Type.Intersect(
  [
    querySyntax(condIvaTypesQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type CondIvaTypesQuery = Static<typeof condIvaTypesQuerySchema>
export const condIvaTypesQueryValidator = getValidator(condIvaTypesQuerySchema, queryValidator)
export const condIvaTypesQueryResolver = resolve<CondIvaTypesQuery, HookContext<CondIvaTypesService>>({})

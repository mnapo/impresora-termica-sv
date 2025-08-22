// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { ClientsService } from './clients.class'

// Main data model schema
export const clientsSchema = Type.Object(
  {
    id: Type.Number(),
    cuit: Type.Optional(Type.String()),
    companyName: Type.Optional(Type.String()),
    condIvaTypeId: Type.Optional(Type.Number()),
    address: Type.Optional(Type.String()),
    userId: Type.Number(),
    createdAt: Type.Optional(Type.String({ format: 'date-time' })),
    updatedAt: Type.Optional(Type.String({ format: 'date-time' }))
  },
  { $id: 'Clients', additionalProperties: false }
)
export type Clients = Static<typeof clientsSchema>
export const clientsValidator = getValidator(clientsSchema, dataValidator)
export const clientsResolver = resolve<Clients, HookContext<ClientsService>>({})

export const clientsExternalResolver = resolve<Clients, HookContext<ClientsService>>({})

// Schema for creating new entries
export const clientsDataSchema = Type.Pick(clientsSchema, ['cuit', 'companyName', 'condIvaTypeId', 'address'], {
  $id: 'ClientsData'
})
export type ClientsData = Static<typeof clientsDataSchema>
export const clientsDataValidator = getValidator(clientsDataSchema, dataValidator)
export const clientsDataResolver = resolve<Clients, HookContext<ClientsService>>({})

// Schema for updating existing entries
export const clientsPatchSchema = Type.Partial(clientsSchema, {
  $id: 'ClientsPatch'
})
export type ClientsPatch = Static<typeof clientsPatchSchema>
export const clientsPatchValidator = getValidator(clientsPatchSchema, dataValidator)
export const clientsPatchResolver = resolve<Clients, HookContext<ClientsService>>({})

// Schema for allowed query properties
export const clientsQueryProperties = Type.Pick(clientsSchema, ['cuit', 'companyName', 'condIvaTypeId', 'address'])
export const clientsQuerySchema = Type.Intersect(
  [
    querySyntax(clientsQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type ClientsQuery = Static<typeof clientsQuerySchema>
export const clientsQueryValidator = getValidator(clientsQuerySchema, queryValidator)
export const clientsQueryResolver = resolve<ClientsQuery, HookContext<ClientsService>>({})

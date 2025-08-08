// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { InvoicesItemsService } from './invoices-items.class'

// Main data model schema
export const invoicesItemsSchema = Type.Object(
  {
    id: Type.Number(),
    name: Type.String({ minLength: 1 }),
    price: Type.Number({ minimum: 0 }),
    userId: Type.Number(),
    invoiceId: Type.Number()
  },
  { $id: 'InvoicesItems', additionalProperties: false }
)
export type InvoicesItems = Static<typeof invoicesItemsSchema>
export const invoicesItemsValidator = getValidator(invoicesItemsSchema, dataValidator)
export const invoicesItemsResolver = resolve<InvoicesItems, HookContext<InvoicesItemsService>>({})

export const invoicesItemsExternalResolver = resolve<InvoicesItems, HookContext<InvoicesItemsService>>({})

// Schema for creating new entries
export const invoicesItemsDataSchema = Type.Pick(invoicesItemsSchema, ['name', 'price', 'userId', 'invoiceId'], {
  $id: 'InvoicesItemsData'
})
export type InvoicesItemsData = Static<typeof invoicesItemsDataSchema>
export const invoicesItemsDataValidator = getValidator(invoicesItemsDataSchema, dataValidator)
export const invoicesItemsDataResolver = resolve<InvoicesItems, HookContext<InvoicesItemsService>>({})

// Schema for updating existing entries
export const invoicesItemsPatchSchema = Type.Partial(invoicesItemsSchema, {
  $id: 'InvoicesItemsPatch'
})
export type InvoicesItemsPatch = Static<typeof invoicesItemsPatchSchema>
export const invoicesItemsPatchValidator = getValidator(invoicesItemsPatchSchema, dataValidator)
export const invoicesItemsPatchResolver = resolve<InvoicesItems, HookContext<InvoicesItemsService>>({})

// Schema for allowed query properties
export const invoicesItemsQueryProperties = Type.Pick(invoicesItemsSchema, ['name', 'price', 'userId', 'invoiceId'])
export const invoicesItemsQuerySchema = Type.Intersect(
  [
    querySyntax(invoicesItemsQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type InvoicesItemsQuery = Static<typeof invoicesItemsQuerySchema>
export const invoicesItemsQueryValidator = getValidator(invoicesItemsQuerySchema, queryValidator)
export const invoicesItemsQueryResolver = resolve<InvoicesItemsQuery, HookContext<InvoicesItemsService>>({})

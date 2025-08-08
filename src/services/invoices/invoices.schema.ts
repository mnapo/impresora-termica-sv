// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { InvoicesService } from './invoices.class'

// Main data model schema
export const invoicesSchema = Type.Object(
  {
    id: Type.Number(),
    type: Type.String(),
    subtotal: Type.Number({ minimum: 0 }),
    total: Type.Number({ minimum: 0 }),
    userId: Type.Number(),
    clientId: Type.Number(),
    createdAt: Type.Optional(Type.String({ format: 'date-time' })),
    updatedAt: Type.Optional(Type.String({ format: 'date-time' }))
  },
  { $id: 'Invoices', additionalProperties: false }
)
export type Invoices = Static<typeof invoicesSchema>
export const invoicesValidator = getValidator(invoicesSchema, dataValidator)
export const invoicesResolver = resolve<Invoices, HookContext<InvoicesService>>({})

export const invoicesExternalResolver = resolve<Invoices, HookContext<InvoicesService>>({})

// Schema for creating new entries
export const invoicesDataSchema = Type.Pick(invoicesSchema, ['type', 'subtotal', 'total', 'userId', 'clientId'], {
  $id: 'InvoicesData'
})
export type InvoicesData = Static<typeof invoicesDataSchema>
export const invoicesDataValidator = getValidator(invoicesDataSchema, dataValidator)
export const invoicesDataResolver = resolve<Invoices, HookContext<InvoicesService>>({})

// Schema for updating existing entries
export const invoicesPatchSchema = Type.Partial(invoicesSchema, {
  $id: 'InvoicesPatch'
})
export type InvoicesPatch = Static<typeof invoicesPatchSchema>
export const invoicesPatchValidator = getValidator(invoicesPatchSchema, dataValidator)
export const invoicesPatchResolver = resolve<Invoices, HookContext<InvoicesService>>({})

// Schema for allowed query properties
export const invoicesQueryProperties = Type.Pick(invoicesSchema, ['type', 'subtotal', 'total', 'userId', 'clientId'])
export const invoicesQuerySchema = Type.Intersect(
  [
    querySyntax(invoicesQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type InvoicesQuery = Static<typeof invoicesQuerySchema>
export const invoicesQueryValidator = getValidator(invoicesQuerySchema, queryValidator)
export const invoicesQueryResolver = resolve<InvoicesQuery, HookContext<InvoicesService>>({})

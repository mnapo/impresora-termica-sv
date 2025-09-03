import { resolve } from '@feathersjs/schema'
import type { HookContext } from '@feathersjs/feathers'
import type { Invoices, InvoicesService } from './invoices.class'

export const invoicesDataResolver = resolve<Invoices, HookContext<InvoicesService>>({
  userId: async (_value, _invoice, context) => context.params.user?.id
})

export const invoicesPatchResolver = resolve<Invoices, HookContext<InvoicesService>>({
  userId: async (_value, _invoice, context) => context.params.user?.id
})
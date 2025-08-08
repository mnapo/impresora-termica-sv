// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'

import type { Application } from '../../declarations'
import type { Invoices, InvoicesData, InvoicesPatch, InvoicesQuery } from './invoices.schema'

export type { Invoices, InvoicesData, InvoicesPatch, InvoicesQuery }

export interface InvoicesParams extends KnexAdapterParams<InvoicesQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class InvoicesService<ServiceParams extends Params = InvoicesParams> extends KnexService<
  Invoices,
  InvoicesData,
  InvoicesParams,
  InvoicesPatch
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('sqliteClient'),
    name: 'invoices'
  }
}

// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'

import type { Application } from '../../declarations'
import type {
  InvoicesItems,
  InvoicesItemsData,
  InvoicesItemsPatch,
  InvoicesItemsQuery
} from './invoices-items.schema'

export type { InvoicesItems, InvoicesItemsData, InvoicesItemsPatch, InvoicesItemsQuery }

export interface InvoicesItemsParams extends KnexAdapterParams<InvoicesItemsQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class InvoicesItemsService<ServiceParams extends Params = InvoicesItemsParams> extends KnexService<
  InvoicesItems,
  InvoicesItemsData,
  InvoicesItemsParams,
  InvoicesItemsPatch
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('sqliteClient'),
    name: 'invoices-items'
  }
}

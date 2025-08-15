// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'

import type { Application } from '../../declarations'
import type {
  CondIvaTypes,
  CondIvaTypesData,
  CondIvaTypesPatch,
  CondIvaTypesQuery
} from './cond-iva-types.schema'

export type { CondIvaTypes, CondIvaTypesData, CondIvaTypesPatch, CondIvaTypesQuery }

export interface CondIvaTypesParams extends KnexAdapterParams<CondIvaTypesQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class CondIvaTypesService<ServiceParams extends Params = CondIvaTypesParams> extends KnexService<
  CondIvaTypes,
  CondIvaTypesData,
  CondIvaTypesParams,
  CondIvaTypesPatch
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('sqliteClient'),
    name: 'cond-iva-types'
  }
}

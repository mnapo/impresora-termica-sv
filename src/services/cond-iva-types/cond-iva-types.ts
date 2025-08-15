// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  condIvaTypesDataValidator,
  condIvaTypesPatchValidator,
  condIvaTypesQueryValidator,
  condIvaTypesResolver,
  condIvaTypesExternalResolver,
  condIvaTypesDataResolver,
  condIvaTypesPatchResolver,
  condIvaTypesQueryResolver
} from './cond-iva-types.schema'

import type { Application } from '../../declarations'
import { CondIvaTypesService, getOptions } from './cond-iva-types.class'

export const condIvaTypesPath = 'cond-iva-types'
export const condIvaTypesMethods: Array<keyof CondIvaTypesService> = [
  'find',
  'get',
  'create',
  'patch',
  'remove'
]

export * from './cond-iva-types.class'
export * from './cond-iva-types.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const condIvaTypes = (app: Application) => {
  // Register our service on the Feathers application
  app.use(condIvaTypesPath, new CondIvaTypesService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: condIvaTypesMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(condIvaTypesPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(condIvaTypesExternalResolver),
        schemaHooks.resolveResult(condIvaTypesResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(condIvaTypesQueryValidator),
        schemaHooks.resolveQuery(condIvaTypesQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(condIvaTypesDataValidator),
        schemaHooks.resolveData(condIvaTypesDataResolver)
      ],
      patch: [
        schemaHooks.validateData(condIvaTypesPatchValidator),
        schemaHooks.resolveData(condIvaTypesPatchResolver)
      ],
      remove: []
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  })
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [condIvaTypesPath]: CondIvaTypesService
  }
}

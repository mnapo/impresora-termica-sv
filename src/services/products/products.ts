// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'
import { BadRequest } from '@feathersjs/errors'
import { restrictToOwnerOrAdmin } from '../../hooks/restrictions'

import {
  productsDataValidator,
  productsPatchValidator,
  productsQueryValidator,
  productsResolver,
  productsExternalResolver,
  productsDataResolver,
  productsPatchResolver,
  productsQueryResolver
} from './products.schema'

import type { Application } from '../../declarations'
import type { HookContext } from '@feathersjs/feathers'
import { ProductsService, getOptions } from './products.class'

export const productsPath = 'products'
export const productsMethods: Array<keyof ProductsService> = ['find', 'get', 'create', 'patch', 'remove']

export * from './products.class'
export * from './products.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const products = (app: Application) => {
  // Register our service on the Feathers application
  app.use(productsPath, new ProductsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: productsMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })

  const assignUserId = async (context: HookContext) => {
    const user = context.params.user

    if (!user?.id) {
      throw new BadRequest('Not authenticated')
    }

    // Agregamos el userId manualmente
    context.data = {
      ...context.data,
      userId: user.id
    }

    return context
  }
  
  // Initialize hooks
  app.service(productsPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(productsExternalResolver),
        schemaHooks.resolveResult(productsResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(productsQueryValidator),
        schemaHooks.resolveQuery(productsQueryResolver)
      ],
      find: [
        async (context: HookContext) => {
          const { user } = context.params
          if (user.role !== "admin") {
            context.params.query = {
              ...context.params.query,
              userId: user.id
            }
          }
          return context
        }
      ],
      get: [],
      create: [
        schemaHooks.validateData(productsDataValidator),
        assignUserId,
        schemaHooks.resolveData(productsDataResolver)
      ],
      patch: [
        schemaHooks.validateData(productsPatchValidator),
        schemaHooks.resolveData(productsPatchResolver)
      ],
      remove: []
    },
    after: {
      all: [],
      get: [
        restrictToOwnerOrAdmin
      ],
    },
    error: {
      all: []
    }
  })
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [productsPath]: ProductsService
  }
}

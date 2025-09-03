import { resolve } from '@feathersjs/schema'
import type { HookContext } from '@feathersjs/feathers'
import type { Products, ProductsService } from './products.class'

export const productsDataResolver = resolve<Products, HookContext<ProductsService>>({
  userId: async (_value, _product, context) => context.params.user?.id
})

export const productsPatchResolver = resolve<Products, HookContext<ProductsService>>({
  userId: async (_value, _product, context) => context.params.user?.id
})
import { resolve } from '@feathersjs/schema'
import type { HookContext } from '@feathersjs/feathers'
import type { Products, ProductsInput } from './products.types'
import type { ProductsService } from './products.class'

export const productsDataResolver = resolve<Products, HookContext<ProductsService>>({
  userId: async (_value, _product: Partial<ProductsInput>, context) => context.params.user?.id
})

export const productsPatchResolver = resolve<Products, HookContext<ProductsService>>({
  userId: async (_value, _product: Partial<ProductsInput>, context) => context.params.user?.id
})

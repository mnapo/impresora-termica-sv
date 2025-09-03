export interface ProductsInput {
  code: string
  name: string
  price1: number
  price2: number
  price3: number
}

export interface Products extends ProductsInput {
  id: number
  userId: number
}

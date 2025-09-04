export interface ClientsInput {
    cuit: string
    companyName: string
    condIvaTypeId: number
    address: string
}

export interface Clients extends ClientsInput {
  id: number
  userId: number
}

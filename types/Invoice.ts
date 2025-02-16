import type { Client } from "./Client"

export interface InvoiceItem {
  productId: string
  productName: string
  quantity: number
  price: number
}

export interface Invoice {
  id: string
  invoiceNumber: string
  clientId: string
  client: Client
  date: string
  items: InvoiceItem[]
  total: number
}


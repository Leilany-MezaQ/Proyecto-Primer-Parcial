// File: src/types/index.ts

export interface Role {
  _id: string;
  type: string; // Usas `type` según tu API (no `name`)
  __v?: number;
}

export interface Product {
    _id: string
    name: string
    description: string
    price: number
    stock: number
    status?: boolean    // si usas status en listado
}

export interface OrderProduct {
    _id: string
    productId: {
        _id: string
        name: string
        price: number
    }
    quantity: number
    price: number
}

export interface User {
    _id: string
    name: string
    email?: string      // si lo usas en la UI
    phone: string
    roles: Role[]
    status?: boolean
    createDate?: string // si lo usas en la UI
}

export interface Order {
    _id: string
    userId: {
        _id: string
        name: string
        email: string
    }
    products: OrderProduct[]
    totalPrice?: number
    subtotal?: number
    status: 'pending' | 'processing' | 'completed' | 'cancelled'
    orderDate: string
}

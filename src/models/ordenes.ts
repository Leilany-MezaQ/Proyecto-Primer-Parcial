import { Document, model, Schema, Types } from "mongoose";

// Interfaz para el producto dentro de una orden
export interface IOrderProduct {
  productId: Types.ObjectId;
  quantity: number;
  price: number;
}

// Interfaz de la orden
export interface IOrden extends Document {
  userId: Types.ObjectId;
  products: IOrderProduct[]; // array de productos con cantidad y precio
  totalPrice: number;
  subtotal: number;
  orderDate: Date;
  deleteDate: Date | null;
  status: "pending" | "shipped" | "delivered" | "cancelled";
}

// Subesquema para productos dentro de la orden
const orderProductSchema = new Schema<IOrderProduct>({
  productId: { type: Schema.Types.ObjectId, required: true, ref: "Productos" },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
});

// Esquema de la orden
const OrdenSchema = new Schema<IOrden>({
  userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  products: { type: [orderProductSchema], required: true }, // usamos subdocumentos
  totalPrice: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  orderDate: { type: Date, default: Date.now },
  deleteDate: { type: Date, default: null },
  status: {
    type: String,
    required: true,
    enum: ["pending", "shipped", "delivered", "cancelled"]
  }
});

// Modelo
export const Orden = model<IOrden>("Orden", OrdenSchema, "ordenes");

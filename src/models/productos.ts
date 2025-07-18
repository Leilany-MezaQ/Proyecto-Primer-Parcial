import { Document, model, Schema, Types } from "mongoose";

export interface IProductos extends Document {
    name: string;
    description: string;
    price: number;
    stock: number;
    status: boolean;
}

const ProductosSchema = new Schema<IProductos>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    status: { type: Boolean, default: true },
    }
);

export const Productos = model<IProductos>("Productos", ProductosSchema, "productos");
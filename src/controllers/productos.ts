// src/controllers/productos.ts
import { RequestHandler } from "express";
import { Types } from "mongoose";
import { Productos, IProductos } from "../models/productos";

// Interfaces para bodies y params
interface CreateProductBody {
  name: string;
  price: number;
  description?: string;
  stock: number;
}

interface UpdateProductBody {
  name?: string;
  price?: number;
  description?: string;
  stock?: number;
}

interface IdParam {
  id: string;
}

// GET /getProducts
export const getAllProducts: RequestHandler<{}, { products: IProductos[] } | { error: string }> = 
  async (_req, res, next) => {
    try {
      const products = await Productos.find();
      res.json({ products });
    } catch (err) {
      console.error("Error al obtener los productos:", err);
      res.status(500).json({ error: "Error al obtener los productos" });
    }
  };

// POST /products
export const saveProduct: RequestHandler<{}, { product: IProductos } | { error: string }, CreateProductBody> = 
  async (req, res, next) => {
    try {
      const { name, price, description, stock } = req.body;
      const newProduct = new Productos({
        name,
        price,
        description,
        stock,
        createDate: Date.now(),
        status: true,
      });
      const product = await newProduct.save();
      res.status(201).json({ product });
    } catch (err) {
      console.error("Error al guardar el producto:", err);
      res.status(500).json({ error: "Error al guardar el producto" });
    }
  };

// PUT /updateProduct/:id
export const updateProduct: RequestHandler<IdParam, { product: IProductos } | { error: string }, UpdateProductBody> = 
  async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: "ID inválido" });
        return;
      }
      const updates = req.body;
      const updatedProduct = await Productos.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
      );
      if (!updatedProduct) {
        res.status(404).json({ error: "Producto no encontrado" });
        return;
      }
      res.json({ product: updatedProduct });
    } catch (err) {
      console.error("Error al actualizar el producto:", err);
      res.status(500).json({ error: "Error al actualizar el producto" });
    }
  };

// DELETE /deleteProduct/:id
export const deleteProduct: RequestHandler<IdParam, { message: string; product?: IProductos } | { error: string }> = 
  async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: "ID inválido" });
        return;
      }
      const deletedProduct = await Productos.findByIdAndUpdate(
        id,
        { status: false },
        { new: true }
      );
      if (!deletedProduct) {
        res.status(404).json({ error: "Producto no encontrado" });
        return;
      }
      res.json({
        message: "Producto desactivado correctamente",
        product: deletedProduct,
      });
    } catch (err) {
      console.error("Error al eliminar el producto:", err);
      res.status(500).json({ error: "Error al eliminar el producto" });
    }
  };

// src/controllers/orderController.ts
import { RequestHandler } from "express";
import { Types } from "mongoose";
import { Orden, IOrden } from "../models/ordenes";
import { Productos, IProductos } from "../models/productos";

// --- Interfaces para los bodies y params ---
interface ProductoInput {
  productId: string;
  quantity: number;
}

interface CrearOrdenBody {
  userId: string;
  products: ProductoInput[];
  status?: string;
}

interface UpdateOrdenBody {
  products: (ProductoInput & { price: number })[];
  status?: string;
}

interface IdParam {
  id: string;
}

// POST /orders
export const crearOrden: RequestHandler<{}, any, CrearOrdenBody> =
  async (req, res, next) => {
    try {
      const { userId, products, status } = req.body;

      if (
        !userId ||
        !Types.ObjectId.isValid(userId) ||
        !Array.isArray(products) ||
        products.length === 0
      ) {
        res
          .status(400)
          .json({ error: "Datos incompletos: userId y products son requeridos." });
        return;
      }

      // Armamos productos con precio real y ajustamos stock
      const productosConPrecio: { productId: Types.ObjectId; quantity: number; price: number }[] =
        [];
      let subtotal = 0;

      for (const item of products) {
        const { productId, quantity } = item;

        if (!Types.ObjectId.isValid(productId)) {
          res.status(400).json({ error: `ID de producto inválido: ${productId}` });
          return;
        }

        const productoDB = await Productos.findById(productId);
        if (!productoDB || !productoDB.status) {
          res
            .status(404)
            .json({ error: `Producto no encontrado o inactivo: ${productId}` });
          return;
        }

        if (productoDB.stock < quantity) {
          res.status(400).json({
            error: `Stock insuficiente para el producto ${productoDB.name}`,
            disponible: productoDB.stock,
            solicitado: quantity,
          });
          return;
        }

        productoDB.stock -= quantity;
        await productoDB.save();

        const precioReal = productoDB.price;
        productosConPrecio.push({
          productId: new Types.ObjectId(productId),
          quantity,
          price: precioReal,
        });
        subtotal += precioReal * quantity;
      }

      const totalPrice = parseFloat((subtotal * 1.16).toFixed(2));
      const nuevaOrden = new Orden({
        userId: new Types.ObjectId(userId),
        products: productosConPrecio,
        subtotal,
        totalPrice,
        status: status ?? "pending",
      });

      const ordenGuardada = await nuevaOrden.save();
      res.status(201).json(ordenGuardada);
    } catch (err) {
      next(err);
    }
  };

// GET /orders
export const obtenerOrdenes: RequestHandler = async (_req, res, next) => {
  try {
    const ordenes = await Orden.find({ deleteDate: null })
      .populate("userId")
      .populate("products.productId");
    res.json(ordenes);
  } catch (err) {
    next(err);
  }
};

// GET /order/:id
export const obtenerOrdenPorId: RequestHandler<IdParam> =
  async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: "ID de orden inválido" });
        return;
      }

      const orden = await Orden.findById(id)
        .populate("userId")
        .populate("products.productId");
      if (!orden || orden.deleteDate) {
        res.status(404).json({ error: "Orden no encontrada" });
        return;
      }
      res.json(orden);
    } catch (err) {
      next(err);
    }
  };

// PUT /updateOrder/:id
export const actualizarOrden: RequestHandler<IdParam, any, UpdateOrdenBody> =
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { products, status } = req.body;

      if (!Array.isArray(products) || products.length === 0) {
        res
          .status(400)
          .json({ error: "El array products es obligatorio y no puede estar vacío." });
        return;
      }

      const subtotal = products.reduce(
        (sum, p) => sum + p.price * p.quantity,
        0
      );
      const totalPrice = parseFloat((subtotal * 1.16).toFixed(2));

      const ordenActualizada = await Orden.findByIdAndUpdate(
        id,
        { products, subtotal, totalPrice, status },
        { new: true }
      );
      if (!ordenActualizada) {
        res.status(404).json({ error: "Orden no encontrada" });
        return;
      }
      res.json(ordenActualizada);
    } catch (err) {
      next(err);
    }
  };

// DELETE /deleteOrder/:id  (soft delete)
export const eliminarOrden: RequestHandler<IdParam> = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ordenEliminada = await Orden.findByIdAndUpdate(
      id,
      { deleteDate: new Date() },
      { new: true }
    );
    if (!ordenEliminada) {
      res.status(404).json({ error: "Orden no encontrada" });
      return;
    }
    res.json({ mensaje: "Orden eliminada correctamente (soft delete)" });
  } catch (err) {
    next(err);
  }
};

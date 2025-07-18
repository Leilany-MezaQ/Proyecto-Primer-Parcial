// src/controllers/menuController.ts
import { RequestHandler } from "express";
import { Types } from "mongoose";
import { Menu, IMenu } from "../models/menu";
import { Roles, IRoles } from "../models/roles";

// --- Interfaces para los bodies ---
interface GetMenuByRolBody {
  roles: string[]; // los "type" de rol
}

interface CreateMenuBody {
  title: string;
  path: string;
  icon: string;
  roles: string[]; // array de Role._id como string
}

interface UpdateMenuBody extends CreateMenuBody {}

interface IdParam {
  id: string;
}

// GET /menus
export const getMenus: RequestHandler = async (req, res, next) => {
  try {
    const menus: IMenu[] = await Menu.find().populate("roles", "type");
    res.json(menus);
  } catch (err) {
    console.error("Error al obtener menús", err);
    res.status(500).json({ message: "Error al obtener menús" });
  }
};

// POST /menusbyrol
export const getMenuByRol: RequestHandler<{}, IMenu[] | { message: string }, GetMenuByRolBody> =
  async (req, res, next) => {
    const { roles } = req.body;
    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      res.status(400).json({ message: "Falta el parámetro 'roles'" });
      return;
    }

    try {
      // Buscar en coleccion Roles los tipos coincidentes
      const rolesEncontrados: IRoles[] = await Roles.find({ type: { $in: roles } });
      if (rolesEncontrados.length === 0) {
        res.status(404).json({ message: "No se encontraron roles válidos" });
        return;
      }

      const roleIds = rolesEncontrados.map(r => r._id);
      const menus: IMenu[] = await Menu.find({ roles: { $in: roleIds } }).populate("roles", "type");
      if (menus.length === 0) {
        res.status(404).json({ message: "No hay menús para los roles dados" });
        return;
      }

      res.json(menus);
    } catch (err) {
      console.error("Error al obtener menú por roles:", err);
      res.status(500).json({ message: "Error al obtener menú por roles" });
    }
  };

// POST /menus
export const createMenu: RequestHandler<{}, IMenu | { message: string }, CreateMenuBody> = async (req, res, next) => {
  const { title, path, icon, roles } = req.body;
  if (!title || !path || !icon || !Array.isArray(roles) || roles.length === 0) {
    res.status(400).json({ message: "Todos los campos son requeridos" });
    return;
  }

  try {
    // Convertir a ObjectId
    const roleObjectIds = roles.map(r => new Types.ObjectId(r));
    const newMenu = new Menu({ title, path, icon, roles: roleObjectIds });
    await newMenu.save();
    res.status(201).json(newMenu);
  } catch (err) {
    console.error("Error al crear menú", err);
    res.status(500).json({ message: "Error al crear menú" });
  }
};

// PUT /menus/:id
export const updateMenu: RequestHandler<IdParam, IMenu | { message: string }, UpdateMenuBody> =
  async (req, res, next) => {
    const { id } = req.params;
    const { title, path, icon, roles } = req.body;
    if (!title || !path || !icon || !Array.isArray(roles) || roles.length === 0) {
      res.status(400).json({ message: "Todos los campos son requeridos" });
      return;
    }

    try {
      const roleObjectIds = roles.map(r => new Types.ObjectId(r));
      const updatedMenu = await Menu.findByIdAndUpdate(
        id,
        { title, path, icon, roles: roleObjectIds },
        { new: true }
      );
      if (!updatedMenu) {
        res.status(404).json({ message: "Menú no encontrado" });
        return;
      }
      res.json(updatedMenu);
    } catch (err) {
      console.error("Error al actualizar menú", err);
      res.status(500).json({ message: "Error al actualizar menú" });
    }
  };

// DELETE /menu/:id
export const deleteMenu: RequestHandler<IdParam> = async (req, res, next) => {
  const { id } = req.params;
  try {
    const deletedMenu = await Menu.findByIdAndDelete(id);
    if (!deletedMenu) {
      res.status(404).json({ message: "Menú no encontrado" });
      return;
    }
    res.json({ message: "Menú eliminado exitosamente" });
  } catch (err) {
    console.error("Error al eliminar menú", err);
    res.status(500).json({ message: "Error al eliminar menú" });
  }
};

// src/controllers/roles.ts
import { RequestHandler } from "express";
import { Roles, IRoles } from "../models/roles";

// Interfaces para el body
interface CreateRoleBody {
  type: string;
}

// GET /roles
export const getRoles: RequestHandler<{}, any> = async (_req, res, next) => {
  try {
    const roles = await Roles.find();
    res.json(roles);
  } catch (err) {
    console.error("Error al obtener roles", err);
    res.status(500).json({ message: "Error al obtener roles" });
  }
};

// POST /roles
export const createRole: RequestHandler<{}, any, CreateRoleBody> = async (
  req,
  res,
  next
) => {
  const { type } = req.body;
  if (!type) {
    res.status(400).json({ message: "El tipo de rol es requerido" });
    return;
  }

  try {
    const newRole = new Roles({ type });
    const savedRole = await newRole.save();
    res.status(201).json(savedRole);
  } catch (err) {
    console.error("Error al crear rol", err);
    res.status(500).json({ message: "Error al crear rol" });
  }
};

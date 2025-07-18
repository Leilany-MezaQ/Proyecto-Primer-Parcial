// src/controllers/userController.ts
import { RequestHandler } from "express";
import { Types } from "mongoose";
import bcrypt from "bcryptjs";
import { User, IUser } from "../models/User";
import { Roles, IRoles } from "../models/roles";

// --- Interfaces ---
interface GetAllUsersQuery {
  userEmail?: string;
}

interface SaveUserBody {
  name: string;
  email: string;
  password: string;
  roles: string[]; // tipos de rol (type) o IDs según tu diseño
  phone: string;
}

interface IdParam {
  id: string;
}

interface UpdateUserBody {
  name?: string;
  password?: string;
  roles?: string[]; // tipos de rol
  phone?: string;
}

// GET /getUsers
export const getAllUsers: RequestHandler<{}, { userList: IUser[] } | { message: string }> = 
  async (req, res, next) => {
    try {
      const { userEmail } = req.query as GetAllUsersQuery;
      let query = { status: true } as Record<string, any>;
      if (userEmail) query.email = userEmail;
      
      const userList = await User.find(query).populate("roles");
      res.json({ userList });
    } catch (err) {
      console.error("Error al obtener los usuarios:", err);
      res.status(500).json({ message: "Error al obtener los usuarios" });
    }
  };

// POST /users
export const saveUsers: RequestHandler<{}, { user: IUser } | { message: string }, SaveUserBody> =
  async (req, res, next) => {
    try {
      const { name, email, password, roles, phone } = req.body;
      if (!name || !email || !password || !Array.isArray(roles) || roles.length === 0 || !phone) {
        res.status(400).json({ message: "Faltan datos obligatorios o roles inválidos" });
        return;
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Opcional: validar que los roles existen
      const foundRoles: IRoles[] = await Roles.find({ type: { $in: roles } });
      if (foundRoles.length !== roles.length) {
        res.status(400).json({ message: "Algún rol proporcionado no existe" });
        return;
      }

      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        roles: foundRoles.map(r => r._id),
        phone,
        createDate: Date.now(),
        status: true,
      });
      const user = await newUser.save();
      res.status(201).json({ user });
    } catch (err) {
      console.error("Error al guardar el usuario:", err);
      res.status(500).json({ message: "Error al guardar el usuario" });
    }
  };

// PUT /updateUser/:id
export const updateUser: RequestHandler<IdParam, { user: IUser } | { message: string }, UpdateUserBody> =
  async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!Types.ObjectId.isValid(id)) {
        res.status(400).json({ message: "ID inválido" });
        return;
      }

      const user = await User.findById(id);
      if (!user) {
        res.status(404).json({ message: "Usuario no encontrado" });
        return;
      }

      const { name, password, roles, phone } = req.body;
      if (name) user.name = name;
      if (phone) user.phone = phone;
      if (password) {
        const saltRounds = 10;
        user.password = await bcrypt.hash(password, saltRounds);
      }
      if (roles && roles.length > 0) {
        const foundRoles: IRoles[] = await Roles.find({ type: { $in: roles } });
        user.roles = foundRoles.map(r => r._id) as Types.ObjectId[];
      }

      const updatedUser = await user.save();
      res.json({ user: updatedUser });
    } catch (err) {
      console.error("Error al actualizar el usuario:", err);
      res.status(500).json({ message: "Error al actualizar el usuario" });
    }
  };

// DELETE /deleteU/:id
export const deleteUser: RequestHandler<IdParam> = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "ID inválido" });
      return;
    }

    const deletedUser = await User.findByIdAndUpdate(
      id,
      { status: false, deleteDate: new Date() },
      { new: true }
    );
    if (!deletedUser) {
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }
    res.json({ message: "Usuario desactivado", deletedUser });
  } catch (err) {
    console.error("Error al eliminar el usuario:", err);
    res.status(500).json({ message: "Error al eliminar el usuario" });
  }
};

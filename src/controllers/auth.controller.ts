// src/controllers/auth.controller.ts
import { RequestHandler } from "express";
import { generateAccessToken } from "../utils/generateToken";
import { cache } from "../utils/cache";
import dayjs from "dayjs";
import { User } from "../models/User";
import bcrypt from "bcryptjs";

// LOGIN
export const login: RequestHandler<{}, any, { email: string; password: string }> =
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      // Validación básica
      if (!email || !password) {
        res.status(400).json({ message: "Email y contraseña son obligatorios" });
        return;
      }

      // Buscar al usuario y poblar roles
      const user = await User.findOne({ email }).populate("roles");
      if (!user) {
        res.status(401).json({ message: "Credenciales incorrectas" });
        return;
      }

      // Comparar contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({ message: "Credenciales incorrectas" });
        return;
      }

      // Generar token y cachearlo
      const accessToken = generateAccessToken(user.id);
      cache.set(user.id, accessToken, 60 * 30);

      // Responder con datos de usuario y token
      res.json({
        accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          roles: user.roles,
        },
      });
    } catch (err) {
      next(err);
    }
  };

// OBTENER TIEMPO RESTANTE DEL TOKEN
export const getTimeToken: RequestHandler<{}, any, {}, { userId?: string }> =
  (req, res, next) => {
    const userId = req.query.userId;
    if (typeof userId !== "string") {
      res.status(400).json({ message: "Parámetro 'userId' inválido o ausente" });
      return;
    }

    const ttl = cache.getTtl(userId);
    if (!ttl) {
      res.status(404).json({ message: "Token no existe" });
      return;
    }

    const now = Date.now();
    const timeToLife = Math.floor((ttl - now) / 1000);
    const expTime = dayjs(ttl).format("HH:mm:ss");

    res.json({ timeToLife, expTime });
  };

// RENOVAR TIEMPO DEL TOKEN
export const updateToken: RequestHandler<{ userId: string }> =
  (req, res, next) => {
    const { userId } = req.params;
    const ttl = cache.getTtl(userId);
    if (!ttl) {
      res.status(404).json({ message: "Token no existe" });
      return;
    }

    // Renovar a 15 minutos
    cache.ttl(userId, 60 * 15);
    res.json({ message: "Token actualizado" });
  };

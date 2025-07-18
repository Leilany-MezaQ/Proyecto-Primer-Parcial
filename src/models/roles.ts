import { Document, model, Schema, Types } from "mongoose";

export interface IRoles extends Document {
    type: string;
}

const RolesSchema = new Schema({
  type: { type: String, required: true }
})


export const Roles = model<IRoles>("Roles", RolesSchema, "roles");
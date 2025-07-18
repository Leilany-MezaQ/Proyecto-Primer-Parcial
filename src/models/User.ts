import { Document, model, Schema, Types } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  roles: Types.ObjectId[]; // ← ahora son referencias
  _id: Types.ObjectId;
  phone: string;
  createDate: Date;
  deleteDate: Date | null;
  status: boolean;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  roles: [{ type: Schema.Types.ObjectId, ref: "Roles", required: true }], // ← referencia a Roles
  phone: { type: String, required: true },
  createDate: { type: Date, default: Date.now },
  deleteDate: { type: Date, default: null },
  status: { type: Boolean, default: true }
});


export const User = model<IUser>("User", UserSchema, "users");
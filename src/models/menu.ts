import { Document, model, Schema, Types} from "mongoose";

export interface IMenu extends Document {
    title: string;
    path: string;
    icon: string;
    roles: Types.ObjectId[]; // Referencias a roles
}

const MenuSchema = new Schema<IMenu>({
    title: { type: String, required: true },
    path: { type: String, required: true },
    icon: { type: String, required: true },
    roles: [{ type: Schema.Types.ObjectId, ref: "Roles", required: true }] // Referencia a Roles
});

export const Menu = model<IMenu>("Menu", MenuSchema, "menus");
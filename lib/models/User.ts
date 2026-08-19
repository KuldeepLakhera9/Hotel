// Mongoose is CommonJS; its named exports don't reliably map through
// Node's native ESM loader (only through bundlers like Next's Turbopack/
// webpack, which resolve them differently). Default-import + destructure
// works in both contexts — see scripts/seed.ts, which runs under plain
// Node via tsx and broke on `import { models } from "mongoose"`.
import mongoose, { type Model, type Types } from "mongoose";
const { Schema, model, models } = mongoose;
import { ROLES, type Role } from "@/lib/constants/user";

// Re-exported for server-side code that already imports these from here —
// the canonical definitions live in lib/constants/user.ts (no Mongoose
// import) so Client Components can import just the constants safely.
export { ROLES };
export type { Role };

export interface IUser {
  _id: Types.ObjectId;
  username: string;
  email: string;
  // credentials-auth users: PBKDF2 hash/salt, compatible with the legacy
  // passport-local-mongoose format so existing passwords keep working.
  // OAuth-only users (Google) have neither.
  hash?: string;
  salt?: string;
  googleId?: string;
  role: Role;
  status: "active" | "suspended" | "banned";
  wishlist: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    hash: { type: String, select: false },
    salt: { type: String, select: false },
    googleId: { type: String },
    role: { type: String, enum: ROLES, default: "USER" },
    status: {
      type: String,
      enum: ["active", "suspended", "banned"],
      default: "active",
    },
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Listing" }],
  },
  { timestamps: true }
);

export const User = (models.User as Model<IUser>) || model<IUser>("User", userSchema);

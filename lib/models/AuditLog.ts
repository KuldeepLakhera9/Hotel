import { Schema, model, models, Types, Model } from "mongoose";

export const AUDIT_TARGET_TYPES = ["Listing", "User", "Booking", "Review", "Payment", "Admin"] as const;
export type AuditTargetType = (typeof AUDIT_TARGET_TYPES)[number];

export interface IAuditLog {
  _id: Types.ObjectId;
  admin: Types.ObjectId;
  action: string;
  targetType: AuditTargetType;
  targetId: Types.ObjectId;
  details?: Record<string, unknown>;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    admin: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    targetType: { type: String, enum: AUDIT_TARGET_TYPES, required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    details: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditLogSchema.index({ admin: 1, createdAt: -1 });
auditLogSchema.index({ targetType: 1, targetId: 1 });

export const AuditLog = (models.AuditLog as Model<IAuditLog>) || model<IAuditLog>("AuditLog", auditLogSchema);

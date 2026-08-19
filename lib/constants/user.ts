// Kept Mongoose-free (see lib/constants/listing.ts for why) so Client
// Components can import ROLES directly without pulling mongoose/mongodb
// into the browser bundle.
export const ROLES = ["SUPER_ADMIN", "ADMIN", "SUPPORT_ADMIN", "HOST", "USER"] as const;
export type Role = (typeof ROLES)[number];

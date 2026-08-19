/**
 * Idempotent dev/staging seed script. Unlike the legacy init/index.js this:
 *  - connects to ATLASDB_URL (not a hardcoded local Mongo URL), and awaits
 *    the connection before running any queries (no race condition)
 *  - creates a real seed host user instead of a dangling ObjectId string,
 *    so `listing.owner` populates correctly
 *  - only deletes/replaces listings owned by that seed user, so re-running
 *    this against a database that already has real user data is safe
 *
 * Usage: npm run seed
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../lib/db";
import { User } from "../lib/models/User";
import { Listing } from "../lib/models/Listing";
import { sampleListings } from "./seed-data";

const SEED_USERNAME = "wanderlust_host";
const SEED_EMAIL = "host@wanderlust.example";
const SEED_PASSWORD = process.env.SEED_HOST_PASSWORD ?? "Wanderlust123!";

async function main() {
  await connectDB();

  let owner = await User.findOne({ username: SEED_USERNAME });
  if (!owner) {
    const hash = await bcrypt.hash(SEED_PASSWORD, 12);
    owner = await User.create({
      username: SEED_USERNAME,
      email: SEED_EMAIL,
      hash,
      role: "HOST",
    });
    console.log(`Created seed host user "${SEED_USERNAME}" (password: ${SEED_PASSWORD})`);
  } else {
    console.log(`Seed host user "${SEED_USERNAME}" already exists, reusing.`);
  }

  await Listing.deleteMany({ owner: owner._id });
  await Listing.insertMany(sampleListings.map((listing) => ({ ...listing, owner: owner._id })));
  console.log(`Seeded ${sampleListings.length} listings owned by "${SEED_USERNAME}".`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

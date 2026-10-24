import User from "../model/userModel.js";
import "../config/db.js";

/**
 * Create an admin user in the database.
 * This should be run once to set up the initial admin account.
 */
export const createAdminUser = async () => {
  const existingAdmin = await User.findOne({ role: "admin" });

  if (existingAdmin) {
    return existingAdmin;
  }

  return User.create({
    name: "Admin User",
    email: "admin@rock.com",
    password: "admin123",
    role: "admin",
  });
};

// Run this if this file is executed directly.
if (import.meta.url === `file://${process.argv[1]}`) {
  createAdminUser()
    .then(() => process.exit(0))
    .catch(() => {
      process.exit(1);
    });
}

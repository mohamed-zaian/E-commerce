import bcrypt from "bcrypt";
import User from "../model/userModel.js";

/**
 * Create an admin user in the database
 * This should be run once to set up the initial admin account
 */
export const createAdminUser = async () => {
  try {
    const existingAdmin = await User.findOne({ role: "admin" });

    if (existingAdmin) {
      console.log("Admin user already exists:", existingAdmin.email);
      return existingAdmin;
    }

    const admin = await User.create({
      name: "Admin User",
      email: "admin@rock.com",
      password: "admin123",
      role: "admin",
    });

    console.log("✅ Admin user created successfully:");
    console.log("   Email:", admin.email);
    console.log("   Password: admin123");
    console.log("   Role:", admin.role);

    return admin;
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);
    throw error;
  }
};

// Run this if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  import("../config/db.js")
    .then(() => createAdminUser())
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
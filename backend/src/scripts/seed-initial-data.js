import dotenv from "dotenv"
// REMOVED PATH: dotenv.config() will now look for .env in the current working directory
// which is CREDENTIX/backend when you run the script from there.
dotenv.config()

import mongoose from "mongoose"
import { Tenant } from "../models/Tenant.model.js"
import { Role } from "../models/Role.model.js"
import DB_NAME from "../constant.js" // This path is correct relative to src/scripts/

const seedInitialData = async () => {
  try {
    // Log the MONGO_URI to verify it's being loaded
    console.log("Attempting to connect with MONGO_URI:", process.env.MONGO_URI ? "Loaded" : "NOT LOADED")
    if (!process.env.MONGO_URI) {
      console.error("MONGO_URI is not defined. Please check your .env file.")
      return // Exit if MONGO_URI is missing
    }

    await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
    console.log("✅ MongoDB connected for seeding.")

    // --- Create Default Tenant ---
    const defaultTenantName = "Default Organization"
    const defaultTenantSlug = "default-tenant"
    let defaultTenant = await Tenant.findOne({ slug: defaultTenantSlug })

    if (!defaultTenant) {
      defaultTenant = await Tenant.create({
        name: defaultTenantName,
        slug: defaultTenantSlug,
        // createdBy: null // Can be null if no admin user exists yet
      })
      console.log(`✨ Created default tenant: ${defaultTenant.name} (${defaultTenant.slug})`)
    } else {
      console.log(`ℹ️ Default tenant already exists: ${defaultTenant.name} (${defaultTenant.slug})`)
    }

    // --- Create 'user' Role ---
    const userRoleName = "user"
    let userRole = await Role.findOne({ name: userRoleName })

    if (!userRole) {
      userRole = await Role.create({
        name: userRoleName,
        permissions: ["read:self", "update:self"], // Example permissions
      })
      console.log(`✨ Created role: ${userRole.name}`)
    } else {
      console.log(`ℹ️ Role '${userRole.name}' already exists.`)
    }

    // --- Create 'admin' Role (Optional but recommended for your backend logic) ---
    const adminRoleName = "admin"
    let adminRole = await Role.findOne({ name: adminRoleName })

    if (!adminRole) {
      adminRole = await Role.create({
        name: adminRoleName,
        permissions: [
          "create:user",
          "read:user",
          "update:user",
          "delete:user",
          "manage:roles",
          "manage:tenants",
          "manage:clients",
        ],
      })
      console.log(`✨ Created role: ${adminRole.name}`)
    } else {
      console.log(`ℹ️ Role '${adminRole.name}' already exists.`)
    }

    // You might also want to set these as environment variables in your .env
    // or use them directly in the backend code where default roles/tenants are referenced.
    console.log(`\nDefault Tenant ID: ${defaultTenant._id}`)
    console.log(`User Role ID: ${userRole._id}`)
    console.log(`Admin Role ID: ${adminRole._id}`)
  } catch (error) {
    console.error("❌ Error seeding initial data:", error)
  } finally {
    await mongoose.disconnect()
    console.log("🔌 MongoDB disconnected.")
  }
}

seedInitialData()

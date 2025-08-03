import mongoose from "mongoose"
import { Tenant } from "../models/Tenant.model.js"
import { Role } from "../models/Role.model.js"
import { User } from "../models/User.model.js"
import dotenv from "dotenv"

dotenv.config()

const setupDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(`${process.env.MONGO_URI}/credentix`)
    console.log("✅ Connected to MongoDB")

    // Create default tenant
    let tenant = await Tenant.findOne({ slug: "test-tenant" })
    if (!tenant) {
      tenant = await Tenant.create({
        name: "Test Tenant",
        slug: "test-tenant",
      })
      console.log("✅ Created test tenant:", tenant._id)
    } else {
      console.log("✅ Test tenant already exists:", tenant._id)
    }

    // Create roles
    const roles = ["admin", "user", "editor"]
    const createdRoles = {}

    for (const roleName of roles) {
      let role = await Role.findOne({ name: roleName })
      if (!role) {
        role = await Role.create({
          name: roleName,
          permissions: roleName === "admin" ? ["*"] : [`read:${roleName}`, `write:${roleName}`],
        })
        console.log(`✅ Created ${roleName} role:`, role._id)
      } else {
        console.log(`✅ ${roleName} role already exists:`, role._id)
      }
      createdRoles[roleName] = role._id
    }

    // Create admin user
    let adminUser = await User.findOne({ email: "admin@credentix.com" })
    if (!adminUser) {
      adminUser = await User.create({
        fullName: "Admin User",
        email: "admin@credentix.com",
        password: "Admin123!",
        tenant: tenant._id,
        role: createdRoles.admin,
        isVerified: true,
        status: "active",
      })
      console.log("✅ Created admin user:", adminUser._id)
    } else {
      console.log("✅ Admin user already exists:", adminUser._id)
    }

    // Update environment variables
    console.log("\n🔧 Update your .env file with these IDs:")
    console.log(`DEFAULT_TENANT_ID=${tenant._id}`)
    console.log(`DEFAULT_ROLE_ID=${createdRoles.user}`)

    console.log("\n🎉 Database setup complete!")
    console.log("\n📝 Test credentials:")
    console.log("Admin: admin@credentix.com / Admin123!")

    process.exit(0)
  } catch (error) {
    console.error("❌ Database setup failed:", error)
    process.exit(1)
  }
}

setupDatabase()

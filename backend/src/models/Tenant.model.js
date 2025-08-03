import mongoose, { Schema } from "mongoose";

const tenantSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: false, // Admin User who created the tenant
    }
}, { timestamps: true });


export const Tenant = mongoose.model("Tenant", tenantSchema);

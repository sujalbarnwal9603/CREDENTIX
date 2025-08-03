import mongoose, { Schema } from "mongoose";

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        enum: ["admin", "user", "editor"], // Extend as needed
    },
    permissions: {
        type: [String], // e.g., ["create:user", "read:tenant"]
        default: [],
    },
}, {
    timestamps: true,
});

export const Role = mongoose.model("Role", roleSchema);

const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    role_id:  {
      type: String,
      unique: true,
      required: true,
      maxlength: 5, // Ensure not more than 5 characters
    },
    name: { type: String, required: true, unique: true }, // Role name (Admin, Doctor, etc.)
    description: { type: String, default: "" },
    permissions: [{ type: String }],
    // ✅ Each role has multiple screens via screen `code` (enum-like string)
    screens: [
      {
        type: String, // e.g., "SCRN001", "SCRN002"
        ref: "Screen", // Reference to Screen model
      },
    ],
  },
  { timestamps: true }
);

// Auto-generate role_id before saving
roleSchema.pre("validate", async function (next) {
  if (this.isNew) {
    const Role = mongoose.model("Role", roleSchema);

    // Find the last created role
    const lastRole = await Role.findOne().sort({ createdAt: -1 });

    let nextNumber = 1;
    if (lastRole && lastRole.role_id) {
      const lastNum = parseInt(lastRole.role_id.replace("R", "")) || 0;
      nextNumber = lastNum + 1;
    }

    // Generate ID like R0001, R0002 (4 digits → total 5 chars)
    this.role_id = `R${String(nextNumber).padStart(4, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Role", roleSchema);

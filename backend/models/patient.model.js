const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const patientSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    phone: { type: String, default: null },
    email: { type: String, default: null },
    date_of_birth: { type: Date, default: null },
    gender: { type: String, default: null },
    blood_group: { type: String, default: null },
    address: { type: String, default: null },
    medical_history: { type: String, default: null },
    password: { type: String, default: "patient123", required: true },
  },
  { 
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "patients"   // 👈 force Mongoose to use your existing collection
  }
);

patientSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // only hash if password is new/modified

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  } 
});

patientSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};


module.exports = mongoose.model("Patients", patientSchema);

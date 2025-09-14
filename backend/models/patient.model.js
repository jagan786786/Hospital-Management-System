const mongoose = require("mongoose");
const { comparePassword } = require("../utils/hash");

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
    password: { type: String, required: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

// Hide password
patientSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});
patientSchema.set("toObject", {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

patientSchema.methods.comparePassword = function (plain) {
  return comparePassword(plain, this.password);
};

module.exports = mongoose.model("Patient", patientSchema);

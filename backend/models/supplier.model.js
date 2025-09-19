const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    supplier_name: { type: String, required: true },
    contact_person: { type: String },
    phone: { type: String },
    email: { type: String },
    license_number: { type: String },
    address: { type: String },
    gst_number: { type: String },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Supplier", supplierSchema);

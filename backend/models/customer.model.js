const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    customer_id: { type: String, required: true, unique: true }, // generated ID
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    address: { type: String },
    customer_type: { type: String, default: "customer" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("customer", customerSchema);

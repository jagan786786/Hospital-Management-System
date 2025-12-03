const mongoose = require("mongoose");

const SaleItemSchema = new mongoose.Schema({
  medicine_id: { type: String, required: true },
  name: { type: String },
  quantity: { type: Number, required: true },
  strength: { type: String },
  unit_price: { type: Number, required: true },
  total_price: { type: Number, required: true },
  created_at: { type: Date, default: Date.now },
});

const CustomerInfoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
});

const SaleSchema = new mongoose.Schema({
  customer_id: { type: String, required: true },
  subtotal: { type: Number, required: true },
  gst_enabled: { type: Boolean, default: false },
  gst_amount: { type: Number, default: 0 },
  total_amount: { type: Number, required: true },
  status: { type: String, default: "pending" },
  coupon_code: { type: String },
  discount_amount: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  customer: { type: CustomerInfoSchema, required: true },
  sale_items: [SaleItemSchema],
});

module.exports = mongoose.model("Sale", SaleSchema);

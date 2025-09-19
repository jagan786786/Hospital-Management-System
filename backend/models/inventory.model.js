const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    brand_name: { type: String, required: true },
    generic_name: { type: String, required: true },
    drug_category: { type: String },
    form: { type: String, required: true },
    strength: { type: String },
    drug_code: { type: String },

    unit_of_measure: { type: String },
    pack_size: { type: String },
    conversion_factor: { type: Number },

    batch_number: { type: String, required: true },
    lot_number: { type: String },
    manufacturing_date: { type: Date },
    expiry_date: { type: Date, required: true },
    quantity_available: { type: Number, required: true, default: 0 },
    reorder_level: { type: Number, default: 0 },
    max_stock_level: { type: Number },

    supplier: { type: String },
    purchase_date: { type: Date },
    invoice_number: { type: String },
    purchase_price: { type: Number },
    mrp: { type: Number },
    selling_price: { type: Number },
    tax_percent: { type: Number },

    storage_conditions: { type: String },
    location_code: { type: String },
    cold_chain_required: { type: Boolean, default: false },

    is_controlled_substance: { type: Boolean, default: false },
    prescription_required: { type: Boolean, default: true },
    drug_license_number: { type: String },

    // New Fields
    suppliers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Supplier" }], 
    manufacturer: { type: String },
    usage_instructions:{ type: String },
    side_effects:{ type: String },


    linked_to_billing: { type: Boolean, default: true },
    linked_to_emr: { type: Boolean, default: true },

    last_updated_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reason_for_adjustment: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inventory", inventorySchema);

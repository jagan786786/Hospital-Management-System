const Supplier = require("../models/supplier.model");

// ✅ Create Supplier
exports.createSupplier = async (req, res) => {
  try {
    const supplier = new Supplier(req.body);
    await supplier.save();
    res.status(201).json({ message: "Supplier created successfully", supplier });
  } catch (error) {
    res.status(400).json({ message: "Error creating supplier", error: error.message });
  }
};

// ✅ Get All Suppliers
exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.status(200).json(suppliers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching suppliers", error: error.message });
  }
};

// ✅ Get Single Supplier by ID
exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    res.status(200).json(supplier);
  } catch (error) {
    res.status(500).json({ message: "Error fetching supplier", error: error.message });
  }
};

// ✅ Update Supplier
exports.updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    res.status(200).json({ message: "Supplier updated successfully", supplier });
  } catch (error) {
    res.status(400).json({ message: "Error updating supplier", error: error.message });
  }
};

// ✅ Delete Supplier
exports.deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    res.status(200).json({ message: "Supplier deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting supplier", error: error.message });
  }
};

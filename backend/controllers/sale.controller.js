const Sale = require("../models/sale.model");

// Create a sale
exports.createSale = async (req, res) => {
  try {
    const sale = new Sale(req.body);
    const savedSale = await sale.save();
    res.status(201).json(savedSale);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating sale", error: err.message });
  }
};

// Get all sales
exports.getAllSales = async (req, res) => {
  try {
    const sales = await Sale.find();
    res.json(sales);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching sales", error: err.message });
  }
};

// Get a sale by ID
exports.getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).json({ message: "Sale not found" });
    res.json(sale);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching sale", error: err.message });
  }
};

// Update a sale
exports.updateSale = async (req, res) => {
  try {
    const updatedSale = await Sale.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updated_at: Date.now() },
      { new: true }
    );
    res.json(updatedSale);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating sale", error: err.message });
  }
};

// Delete a sale
exports.deleteSale = async (req, res) => {
  try {
    await Sale.findByIdAndDelete(req.params.id);
    res.json({ message: "Sale deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting sale", error: err.message });
  }
};

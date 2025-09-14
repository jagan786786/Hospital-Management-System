const Inventory = require('../models/inventory.model');

// ✅ Create Inventory Item
exports.createInventory = async (req, res) => {
  try {
    const item = new Inventory(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: "Error creating inventory item", error: error.message });
  }
};

// ✅ Get All Inventory Items
exports.getInventories = async (req, res) => {
  try {
    const items = await Inventory.find();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Error fetching inventory", error: error.message });
  }
};

// ✅ Get Inventory Item by ID
exports.getInventoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Inventory.findById(id);
    if (!item) return res.status(404).json({ message: "Inventory item not found" });
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: "Error fetching inventory", error: error.message });
  }
};

// ✅ Update Inventory Item
exports.updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedItem = await Inventory.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updatedItem) return res.status(404).json({ message: "Inventory item not found" });
    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: "Error updating inventory", error: error.message });
  }
};

// ✅ Delete Inventory Item
exports.deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await Inventory.findByIdAndDelete(id);
    if (!deletedItem) return res.status(404).json({ message: "Inventory item not found" });
    res.status(200).json({ message: "Inventory item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting inventory", error: error.message });
  }
};

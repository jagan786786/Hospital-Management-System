const Role = require("../models/role.model");

// Create Role
exports.createRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;

    const role = new Role({ name, description, permissions });
    await role.save();

    res.status(201).json({ success: true, data: role });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get All Roles
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    res.status(200).json({ success: true, data: roles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get Role by ID
exports.getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ success: false, message: "Role not found" });

    res.status(200).json({ success: true, data: role });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update Role
exports.updateRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;
    const role = await Role.findByIdAndUpdate(
      req.params.id,
      { name, description, permissions },
      { new: true }
    );

    if (!role) return res.status(404).json({ success: false, message: "Role not found" });

    res.status(200).json({ success: true, data: role });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete Role
exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id);
    if (!role) return res.status(404).json({ success: false, message: "Role not found" });

    res.status(200).json({ success: true, message: "Role deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

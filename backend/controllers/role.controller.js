const Role = require("../models/role.model");
const Screen = require("../models/screen.model");

// ✅ Create Role
exports.createRole = async (req, res) => {
  try {
    const { role_id, name, description, screens } = req.body;

    // Validate screen codes exist in Screen collection
    if (screens && screens.length > 0) {
      const validScreens = await Screen.find({ code: { $in: screens } });
      if (validScreens.length !== screens.length) {
        return res.status(400).json({
          success: false,
          message: "One or more screen codes are invalid",
        });
      }
    }

    const role = new Role({ role_id, name, description, screens });
    await role.save();

    res.status(201).json({ success: true, data: role });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ✅ Get All Roles
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    res.status(200).json({ success: true, data: roles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Get Role by ID
exports.getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role)
      return res.status(404).json({ success: false, message: "Role not found" });

    res.status(200).json({ success: true, data: role });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Update Role
exports.updateRole = async (req, res) => {
  try {
    const { name, description, screens } = req.body;

    // Validate screens if provided
    if (screens && screens.length > 0) {
      const validScreens = await Screen.find({ code: { $in: screens } });
      if (validScreens.length !== screens.length) {
        return res.status(400).json({
          success: false,
          message: "One or more screen codes are invalid",
        });
      }
    }

    const role = await Role.findByIdAndUpdate(
      req.params.id,
      { name, description, screens },
      { new: true }
    );

    if (!role)
      return res.status(404).json({ success: false, message: "Role not found" });

    res.status(200).json({ success: true, data: role });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ✅ Delete Role
exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id);
    if (!role)
      return res.status(404).json({ success: false, message: "Role not found" });

    res
      .status(200)
      .json({ success: true, message: "Role deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

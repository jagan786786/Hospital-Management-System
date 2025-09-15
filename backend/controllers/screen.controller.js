const Screen = require("../models/screen.model");

// ✅ Create new screen
exports.createScreen = async (req, res) => {
  try {
    const { name, url, icon } = req.body;

    // Avoid duplicate URLs
    const existing = await Screen.findOne({ url });
    if (existing) {
      return res.status(400).json({ message: "Screen with this URL already exists" });
    }

    const screen = new Screen({ name, url, icon });
    await screen.save();

    res.status(201).json({ message: "Screen created successfully", screen });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get all screens
exports.getAllScreens = async (req, res) => {
  try {
    const screens = await Screen.find();
    res.status(200).json(screens);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get screen by ID
exports.getScreenById = async (req, res) => {
  try {
    const screen = await Screen.findById(req.params.id);
    if (!screen) {
      return res.status(404).json({ message: "Screen not found" });
    }
    res.status(200).json(screen);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Update screen
exports.updateScreen = async (req, res) => {
  try {
    const { name, url, icon } = req.body;

    const screen = await Screen.findByIdAndUpdate(
      req.params.id,
      { name, url, icon },
      { new: true, runValidators: true }
    );

    if (!screen) {
      return res.status(404).json({ message: "Screen not found" });
    }

    res.status(200).json({ message: "Screen updated successfully", screen });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Delete screen
exports.deleteScreen = async (req, res) => {
  try {
    const screen = await Screen.findByIdAndDelete(req.params.id);

    if (!screen) {
      return res.status(404).json({ message: "Screen not found" });
    }

    res.status(200).json({ message: "Screen deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

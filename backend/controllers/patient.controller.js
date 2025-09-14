const Patient = require("../models/patient.model");
const { hashPassword } = require("../utils/hash");

exports.createPatient = async (req, res) => {
  try {
    const { first_name, last_name, password, ...rest } = req.body;

    if (!first_name || !last_name) {
      return res.status(400).json({ message: "First and last name are required" });
    }

    const plainPassword = password || "patient123";
    const hashedPassword = await hashPassword(plainPassword);

    const newPatient = await Patient.create({
      first_name,
      last_name,
      password: hashedPassword,
      ...rest,
    });

    res.status(201).json({
      message: "Patient registered successfully!",
      patient: newPatient, // password already excluded by schema transform
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to register patient", error: error.message });
  }
};

exports.getPatients = async (req, res) => {
  try {
    const [patients, totalPatients] = await Promise.all([
      Patient.find().sort({ created_at: -1 }).select("-password"),
      Patient.countDocuments(),
    ]);

    res.json({ totalPatients, patients });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch patients", error: error.message });
  }
};

exports.updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // If password is being updated, hash it
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    }

    const updatedPatient = await Patient.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedPatient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json({ message: "Patient updated successfully!", patient: updatedPatient });
  } catch (error) {
    res.status(500).json({ message: "Failed to update patient", error: error.message });
  }
};

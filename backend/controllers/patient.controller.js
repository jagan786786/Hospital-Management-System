const Patient = require("../models/patient.model");

exports.createPatient = async (req, res) => {
  try {
    const { first_name, last_name } = req.body;

    if (!first_name || !last_name) {
      return res.status(400).json({ message: "First and last name are required" });
    }

    const newPatient = await Patient.create(req.body);
    res.status(201).json({ message: "Patient registered successfully!", patient: newPatient });
  } catch (error) {
    res.status(500).json({ message: "Failed to register patient", error: error.message });
  }
};

exports.getPatients = async (req, res) => {
  try {
    const [patients, totalPatients] = await Promise.all([
      Patient.find().sort({ created_at: -1 }),
      Patient.countDocuments()
    ]);

    res.json({ totalPatients, patients });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch patients", error: error.message });
  }
};

exports.updatePatient = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedPatient = await Patient.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedPatient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json({ message: "Patient updated successfully!", patient: updatedPatient });
  } catch (error) {
    res.status(500).json({ message: "Failed to update patient", error: error.message });
  }
};
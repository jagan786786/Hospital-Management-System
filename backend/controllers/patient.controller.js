const Patient = require("../models/patient.model");

exports.regsiterPatient = async (req, res) => {
  try {
    const { first_name, last_name , phone } = req.body;

    if (!first_name || !last_name) {
      return res.status(400).json({ message: "First and last name are required" });
    }

    // Check if phone OR email already exists
    const existingPatient = await Patient.findOne({$or: [{ phone }]});

    if (existingPatient) {
      return res.status(400).json({ message: "Patient already registered with this phone number" });
    }

    const newPatient = await Patient.create(req.body);
    res.status(201).json({ message: "Patient registered successfully!", patient: newPatient });
  } catch (error) {
    res.status(500).json({ message: "Failed to register patient", error: error.message });
  }
};

exports.getPatients = async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json(patients);
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
 
// ✅ Fetch single patient by ID
exports.getPatientById = async (req, res) => {
  try {
    const { id } = req.params; // Extract patient id from URL
    const patient = await Patient.findById(id);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
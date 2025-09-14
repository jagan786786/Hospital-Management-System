const Prescription = require('../models/prescription.model');
const Patient = require('../models/patient.model');
const Employee = require('../models/employee.model');
const Appointment = require("../models/appointment.model");



// ✅ Create Prescription
exports.createPrescription = async (req, res) => {
  try {
    const { patient, doctor, appointment_id, ...otherFields } = req.body;

    // validate patient
    const existingPatient = await Patient.findById(patient);
    if (!existingPatient) return res.status(400).json({ message: "Patient not found" });

    // validate doctor
    const existingDoctor = await Employee.findById(doctor);
    if (!existingDoctor || existingDoctor.employee_type !== "Doctor") {
      return res.status(400).json({ message: "Invalid doctor" });
    }

    // save prescription
    const prescription = new Prescription({
      patient_id: patient,
      doctor_id: doctor,
      appointment_id,
      ...otherFields
    });

    await prescription.save();
    res.status(201).json(prescription);
  } catch (error) {
    res.status(500).json({ message: "Error creating prescription", error: error.message });
  }
};


// ✅ Get all prescriptions
exports.getPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find()
      .populate("patient", "first_name last_name phone")
      .populate("doctor", "first_name last_name department employee_type");
    res.status(200).json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching prescriptions", error: error.message });
  }
};

// ✅ Get prescription by ID
exports.getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const prescription = await Prescription.findById(id)
      .populate("patient_id", "first_name last_name phone")
      .populate("doctor_id", "first_name last_name department employee_type");

    if (!prescription) return res.status(404).json({ message: "Prescription not found" });

    res.status(200).json(prescription);
  } catch (error) {
    res.status(500).json({ message: "Error fetching prescription", error: error.message });
  }
};


// ✅ Update prescription

exports.updatePrescription = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedPrescription = await Prescription.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate("patient_id", "first_name last_name phone")
      .populate("doctor_id", "first_name last_name department employee_type")
      .populate("appointment_id");

    if (!updatedPrescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    res.status(200).json(updatedPrescription);
  } catch (error) {
    res.status(500).json({
      message: "Error updating prescription",
      error: error.message,
    });
  }
};


// ✅ Delete prescription
exports.deletePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPrescription = await Prescription.findByIdAndDelete(id);

    if (!deletedPrescription) return res.status(404).json({ message: "Prescription not found" });

    res.status(200).json({ message: "Prescription deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting prescription", error: error.message });
  }
};

const Prescription = require("../models/prescription.model");
const Patient = require("../models/patient.model");
const Employee = require("../models/employee.model");
const Appointment = require("../models/appointment.model");

// ✅ Create Prescription
exports.createPrescription = async (req, res) => {
  try {
    const { patient_id, doctor_id, appointment_id, ...otherFields } = req.body;

    console.log(patient_id, doctor_id, appointment_id); // ✅ Correct variables

    // validate patient
    const existingPatient = await Patient.findById(patient_id);
    if (!existingPatient) {
      return res.status(400).json({ message: "Patient not found" });
    }

    // validate doctor
    const existingDoctor = await Employee.findById(doctor_id);
    if (
      !existingDoctor ||
      existingDoctor.employee_type.primary_role_type.role_name !== "Doctor"
    ) {
      return res.status(400).json({ message: "Invalid doctor" });
    }

    // validate appointment
    const existingAppointment = await Appointment.findById(appointment_id);
    if (!existingAppointment) {
      return res.status(400).json({ message: "Appointment not found" });
    }

    // save prescription
    const prescription = new Prescription({
      patient_id,
      doctor_id,
      appointment_id,
      ...otherFields,
    });

    await prescription.save();
    res.status(201).json(prescription);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating prescription", error: error.message });
  }
};

// ✅ Get all prescriptions
exports.getPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find()
      .populate("patient_id", "first_name last_name phone")
      .populate("doctor_id", "first_name last_name department employee_type");
    res.status(200).json(prescriptions);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching prescriptions", error: error.message });
  }
};

// ✅ Get prescription by ID
exports.getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const prescription = await Prescription.findById(id)
      .populate("patient_id", "first_name last_name phone")
      .populate("doctor_id", "first_name last_name department employee_type");

    if (!prescription)
      return res.status(404).json({ message: "Prescription not found" });

    res.status(200).json(prescription);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching prescription", error: error.message });
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

    if (!deletedPrescription)
      return res.status(404).json({ message: "Prescription not found" });

    res.status(200).json({ message: "Prescription deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting prescription", error: error.message });
  }
};

exports.upsertPrescription = async (req, res) => {
  try {
    const { id } = req.params; // optional ID for update
    const data = req.body;

    let filter = {};
    if (id) {
      filter._id = id;
    } else if (data._id) {
      filter._id = data._id;
    }

    const prescription = await Prescription.findOneAndUpdate(filter, data, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });

    res.status(200).json(prescription);
  } catch (error) {
    console.error("Upsert prescription error:", error);
    res.status(500).json({
      message: "Error upserting prescription",
      error: error.message,
    });
  }
};

exports.getPrescriptionsByPatientId = async (req, res) => {
  try {
    const { patientId, appointmentId } = req.query;

    let query = {};
    if (patientId) query.patient_id = patientId;
    if (appointmentId) query.appointment_id = appointmentId;

    const prescriptions = await Prescription.find(query)
      .populate("patient_id", "first_name last_name phone")
      .populate("doctor_id", "first_name last_name department employee_type")
      .sort({ visit_date: -1 });

    res.status(200).json(prescriptions);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching prescriptions", error: error.message });
  }
};

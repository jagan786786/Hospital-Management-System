const Appointment = require('../models/appointment.model');
const Patient = require('../models/patient.model');
const Employee = require('../models/employee.model');

// ✅ Create Appointment
exports.createAppointment = async (req, res) => {
  try {
    const { patient, doctor, visit_date, visit_time, visit_type, doctor_department, additional_notes } = req.body;

    // check if patient exists
    const existingPatient = await Patient.findById(patient);
    if (!existingPatient) {
      return res.status(400).json({ message: "Patient must be onboarded before creating appointment" });
    }

    // check if doctor exists and is of type "Doctor"
    const existingDoctor = await Employee.findById(doctor);
    if (!existingDoctor || existingDoctor.employee_type !== "Doctor") {
      return res.status(400).json({ message: "Invalid doctor selected" });
    }

    const appointment = new Appointment({
      patient,
      doctor,
      visit_date,
      visit_time,
      visit_type,
      doctor_department,
      additional_notes
    });

    await appointment.save();
    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: "Error creating appointment", error: error.message });
  }
};

// ✅ Get all appointments
exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("patient", "first_name last_name phone")
      .populate("doctor", "first_name last_name department employee_type");
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching appointments", error: error.message });
  }
};

// ✅ Get single appointment
exports.getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id)
      .populate("patient", "first_name last_name phone")
      .populate("doctor", "first_name last_name department employee_type");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: "Error fetching appointment", error: error.message });
  }
};

// ✅ Update appointment
exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate("patient", "first_name last_name phone")
      .populate("doctor", "first_name last_name department employee_type");

    if (!updatedAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: "Error updating appointment", error: error.message });
  }
};

// ✅ Delete appointment
exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAppointment = await Appointment.findByIdAndDelete(id);

    if (!deletedAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting appointment", error: error.message });
  }
};

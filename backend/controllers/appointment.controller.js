const Appointment = require('../models/appointment.model');
const Patient = require('../models/patient.model');
const Employee = require('../models/employee.model');

exports.createAppointment = async (req, res) => {
  try {
    const { patient_id, doctor_id, appointment_date, appointment_time, visit_type, department, notes } = req.body;

    const existing = await Appointment.findOne({
      doctor_id,
      appointment_date,
      appointment_time, 
      status: "scheduled",
    });
    if (existing) {
      return res.status(400).json({ message: "This time slot is already booked for the doctor." });
    }

    const appointment = new Appointment({
      patient_id, doctor_id, appointment_date, appointment_time, visit_type, department, notes
    });

    await appointment.save();
    res.status(201).json({ message: "Appointment scheduled successfully", appointment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to schedule appointment", error: err.message });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patient_id', 'first_name last_name phone')
      .populate('doctor_id', 'first_name last_name specialization department')
      .sort({ appointment_date: -1, appointment_time: 1 });

    res.status(200).json(appointments);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch appointments", error: err.message });
  }
};

exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient_id', 'first_name last_name phone')
      .populate('doctor_id', 'first_name last_name specialization department');

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json(appointment);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch appointment", error: err.message });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json({ message: "Appointment updated", appointment });
  } catch (err) {
    res.status(500).json({ message: "Failed to update appointment", error: err.message });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json({ message: "Appointment deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete appointment", error: err.message });
  }
};

exports.getLastVisit = async (req, res) => {
  try {
    const { patientId } = req.params;

    const lastVisit = await Appointment.find({ patient_id: patientId, status: "completed" })
      .sort({ appointment_date: -1 })
      .limit(1);

    res.status(200).json(lastVisit[0] || null);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch last visit", error: err.message });
  }
};

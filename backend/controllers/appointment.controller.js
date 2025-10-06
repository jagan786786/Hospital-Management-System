const Appointment = require("../models/appointment.model");
const Patient = require("../models/patient.model");
const Employee = require("../models/employee.model");

// ✅ Create Appointment
exports.createAppointment = async (req, res) => {
  try {
    const {
      patient,
      doctor,
      visit_date,
      visit_time,
      visit_type,
      doctor_department,
      additional_notes,
    } = req.body;

    // check if patient exists
    const existingPatient = await Patient.findById(patient);
    if (!existingPatient) {
      return res.status(400).json({
        message: "Patient must be onboarded before creating appointment",
      });
    }

    // check if doctor exists + populate roles
    const existingDoctor = await Employee.findById(doctor);
    if (!existingDoctor) {
      return res.status(400).json({ message: "Invalid doctor selected" });
    }

    // check if any of the roles is "Doctor"
    const hasDoctorRole =
      existingDoctor.employee_type.primary_role_type?.role_name === "Doctor" ||
      existingDoctor.employee_type.secondary_role_type?.some(
        (r) => r.role_name === "Doctor"
      );
    if (!hasDoctorRole) {
      return res
        .status(400)
        .json({ message: "Selected employee does not have Doctor role" });
    }

    const appointment = new Appointment({
      patient,
      doctor,
      visit_date,
      visit_time,
      visit_type,
      doctor_department,
      additional_notes,
    });

    await appointment.save();
    res.status(201).json(appointment);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating appointment", error: error.message });
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
    res
      .status(500)
      .json({ message: "Error fetching appointments", error: error.message });
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
    res
      .status(500)
      .json({ message: "Error fetching appointment", error: error.message });
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
    res
      .status(500)
      .json({ message: "Error updating appointment", error: error.message });
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
    res
      .status(500)
      .json({ message: "Error deleting appointment", error: error.message });
  }
};

// ✅ Get All appointments for a specific doctor, optionally filtered by visit_date

exports.getAppointmentsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { visit_date } = req.query;

    if (!doctorId) {
      return res.status(400).json({ message: "doctorId is required" });
    }

    // Base filter by doctor._id
    const query = { "doctor._id": doctorId };

    // If visit_date provided, filter by day (ignore time)
    if (visit_date) {
      const startOfDay = new Date(visit_date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(visit_date);
      endOfDay.setHours(23, 59, 59, 999);

      query.visit_date = { $gte: startOfDay, $lte: endOfDay };
    }

    // Fetch with populations, so response matches your sample exactly
    const appointments = await Appointment.find(query)
      .populate("patient", "first_name last_name phone")
      .populate({
        path: "doctor",
        select: "first_name last_name department employee_type",
      });

    // Send raw appointments array (same as your sample response)
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching doctor's appointments",
      error: error.message,
    });
  }
};

exports.getAppointmentsByParams = async (req, res) => {
  try {
    const { patientId, appointmentId, appointmentDate } = req.query;

    let query = {};

    if (patientId) query.patient = patientId;
    if (appointmentId) query._id = appointmentId;
    if (appointmentDate) {
      const start = new Date(appointmentDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(appointmentDate);
      end.setHours(23, 59, 59, 999);
      query.visit_date = { $gte: start, $lte: end };
    }

    // If no date filter provided, default to today's appointments
    if (!appointmentDate && !appointmentId) {
      const today = new Date();
      const start = new Date(today.setHours(0, 0, 0, 0));
      const end = new Date(today.setHours(23, 59, 59, 999));
      query.visit_date = { $gte: start, $lte: end };
    }

    const appointments = await Appointment.find(query)
      .populate("doctor", "_id") // only need doctor_id
      .lean();

    // Map to simplified format expected by frontend
    const simplified = appointments.map((app) => ({
      id: app._id.toString(),
      doctor_id: app.doctor._id.toString(),
      appointment_time: app.visit_time,
      visit_type: app.visit_type,
      status: app.status,
    }));

    res.status(200).json(simplified);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res
      .status(500)
      .json({ message: "Error fetching appointments", error: error.message });
  }
};

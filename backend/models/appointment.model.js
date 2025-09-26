const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patients",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    }, // only employees with role "Doctor"
    visit_date: { type: Date, required: true },
    visit_time: { type: String, required: true }, // e.g. "10:30 AM"
    visit_type: {
      type: String,
      enum: [
        "Consultation",
        "Follow-up",
        "Emergency",
        "First Time Visit",
        "others",
      ],
      required: true,
    },
    doctor_department: { type: String, required: true },
    additional_notes: { type: String, default: null },
    status: {
      type: String,
      enum: ["Scheduled", "Completed", "In-Progress", "Cancelled"],
      default: "Scheduled",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);

const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    appointment_date: { type: Date, required: true },
    appointment_time: { type: String, required: true },
    visit_type: { 
      type: String, 
      enum: ["first-time-visit", "new-admission", "follow-up", "others"], 
      required: true 
    },
    department: { type: String, default: null },
    notes: { type: String, default: null },
    status: { type: String, enum: ["scheduled", "completed", "cancelled"], default: "scheduled" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = mongoose.model('Appointment', appointmentSchema);

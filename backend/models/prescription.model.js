const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema(
  {
    appointment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    patient_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patients",
      required: true,
    },
    doctor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    visit_date: { type: Date, default: Date.now },

    blood_pressure: { type: String },
    pulse: { type: String },
    height: { type: String },
    weight: { type: String },
    bmi: { type: String },
    spo2: { type: String },

    complaints: [{ type: String }],

    medicines: [
      {
        name: { type: String },
        dosage: { type: String },
        duration: { type: String },
      },
    ],

    advice: { type: String },
    tests_prescribed: { type: String },
    next_visit: { type: String },
    doctor_notes: { type: String },

    // ✅ Prescription status: Draft or Completed
    status: {
      type: String,
      enum: ["Draft", "Completed"],
      default: "Draft",
    },
  },
  { timestamps: true } // adds created_at and updated_at
);

module.exports = mongoose.model("Prescription", prescriptionSchema);

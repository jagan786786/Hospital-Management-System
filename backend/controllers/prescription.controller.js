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

// Analytics gives auto suggestions
exports.getDoctorMedicineSuggestions = async (req, res) => {
  try {
    const { doctorId, complaints } = req.query;

    if (!doctorId) {
      return res.status(400).json({ message: "doctorId is required" });
    }

    const complaintsArray = complaints
      ? Array.isArray(complaints)
        ? complaints
        : [complaints]
      : [];

    // --- NEW: tokenize helper to split compound complaint strings ---
    const tokenize = (s) =>
      (s || "")
        .toString()
        .toLowerCase()
        .split(/\s*(?:,|;|\/|\\|\||\band\b|&)\s*/) // split on commas, slashes, "and", &, etc.
        .map((t) => t.trim())
        .filter(Boolean);

    // Build unique list of input tokens (e.g. "fever and headache" -> ["fever","headache"])
    const inputTokens = [];
    complaintsArray.forEach((c) => {
      tokenize(c).forEach((tok) => {
        if (!inputTokens.includes(tok)) inputTokens.push(tok);
      });
    });

    // Fallback: if tokenization produced nothing (shouldn't usually), treat each original complaint string as one token
    const totalInputTokens =
      inputTokens.length > 0 ? inputTokens.length : complaintsArray.length;

    // Get prescriptions for this doctor in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const prescriptions = await Prescription.find({
      doctor_id: doctorId,
      visit_date: { $gte: thirtyDaysAgo },
    }).sort({ visit_date: -1 });

    // Aggregate medicines
    const medicineMap = new Map();

    prescriptions.forEach((presc) => {
      const prescComplaints = Array.isArray(presc.complaints)
        ? presc.complaints
        : [];

      const medicines = Array.isArray(presc.medicines) ? presc.medicines : [];

      // Tokenize all prescription complaints into a set
      const prescTokens = [];
      prescComplaints.forEach((pc) => {
        tokenize(pc).forEach((t) => {
          if (!prescTokens.includes(t)) prescTokens.push(t);
        });
      });

      // Find matching tokens between inputTokens and prescTokens.
      // A match is true if token equality or one contains the other (handles "feverish" vs "fever")
      const matchedTokenSet = new Set();
      inputTokens.forEach((it) => {
        prescTokens.forEach((pt) => {
          if (pt.includes(it) || it.includes(pt)) {
            matchedTokenSet.add(it); // add the input token matched
          }
        });
      });

      const matchingCount = matchedTokenSet.size;

      if (matchingCount > 0) {
        // We have a match — add medicines to aggregation
        medicines.forEach((med) => {
          const key = (med.name || "").toLowerCase();
          if (!key) return;

          if (medicineMap.has(key)) {
            const existing = medicineMap.get(key);
            existing.frequency += 1;
            // update lastPrescribed if this prescription is more recent
            existing.lastPrescribed =
              presc.visit_date > existing.lastPrescribed
                ? presc.visit_date
                : existing.lastPrescribed;
            existing.complaintsMatch += matchingCount;
            // merge relatedComplaints (keep unique)
            const merged = new Set([
              ...(existing.relatedComplaints || []),
              ...Array.from(matchedTokenSet),
            ]);
            existing.relatedComplaints = Array.from(merged);
          } else {
            // store medicine object (if mongoose doc, convert)
            const medObj =
              typeof med.toObject === "function" ? med.toObject() : { ...med };
            medicineMap.set(key, {
              ...medObj,
              frequency: 1,
              lastPrescribed: presc.visit_date,
              complaintsMatch: matchingCount,
              relatedComplaints: Array.from(matchedTokenSet),
            });
          }
        });
      }
    });

    // Convert to array and calculate confidence (use totalInputTokens for relevance)
    const suggestions = Array.from(medicineMap.values())
      .map((m) => {
        const daysSinceLast = Math.floor(
          (Date.now() - new Date(m.lastPrescribed).getTime()) /
            (1000 * 60 * 60 * 24)
        );

        const frequencyScore = Math.min(m.frequency / 5, 1);
        const recencyScore = Math.max(0, (30 - daysSinceLast) / 30);
        const relevanceScore = Math.min(
          m.complaintsMatch / Math.max(1, totalInputTokens),
          1
        );

        const confidence =
          (frequencyScore * 0.4 + recencyScore * 0.3 + relevanceScore * 0.3) *
          100;

        return {
          ...m,
          confidence: Math.round(confidence),
        };
      })
      .sort((a, b) => {
        if (b.confidence !== a.confidence) return b.confidence - a.confidence;
        return (
          new Date(b.lastPrescribed).getTime() -
          new Date(a.lastPrescribed).getTime()
        );
      })
      .slice(0, 2); // top 2 suggestions

    res.status(200).json(suggestions);
  } catch (error) {
    console.error("Error in getDoctorMedicineSuggestions:", error);
    res.status(500).json({
      message: "Error fetching medicine suggestions",
      error: error.message,
    });
  }
};

exports.getPrescriptionsByDoctor = async (req, res) => {
  try {
    const { doctorId, since } = req.query;

    if (!doctorId) {
      return res.status(400).json({ error: "doctorId is required" });
    }
    console.log(since, "Subvmmtied data ");
    const sinceDate = since
      ? new Date(since)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    console.log(sinceDate, "Altered data ");
    const prescriptions = await Prescription.find({
      doctor_id: doctorId,
      visit_date: { $gte: sinceDate },
      status: "Completed", // optional: only completed prescriptions
    })
      .select("medicines complaints visit_date -_id")
      .sort({ visit_date: -1 })
      .lean();

    return res.json(prescriptions);
  } catch (error) {
    console.error("❌ Error fetching prescriptions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

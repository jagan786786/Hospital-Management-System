const express = require("express");
const router = express.Router();
const prescriptionController = require("../controllers/prescription.controller");

// Create a new prescription
router.post(
  "/createPrescription",
  /* 
    #swagger.tags = ['Prescriptions']
    #swagger.summary = 'Create a new prescription'
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Prescription" },
          example: {
            appointment_id: "64a123456789abcdef123456",
            patient_id: "64a654321987abcdef123123",
            doctor_id: "64a789456321abcdef654321",
            visit_date: "2023-09-15",
            blood_pressure: "120/80",
            pulse: "72",
            height: "175 cm",
            weight: "70 kg",
            bmi: "22.8",
            spo2: "98%",
            complaints: "Headache and fatigue",
            medicines: [
              { name: "Paracetamol", dosage: "500mg", duration: "5 days" }
            ],
            advice: "Drink plenty of water",
            tests_prescribed: "Blood Test",
            next_visit: "2023-09-22",
            doctor_notes: "Patient advised to rest",
            status: "Draft"
          }
        }
      }
    }
    #swagger.responses[201] = { description: "Prescription created successfully" }
    #swagger.responses[400] = { description: "Validation error" }
    #swagger.responses[500] = { description: "Server error" }
  */
  prescriptionController.createPrescription
);

// Get all prescriptions
router.get(
  "/getPrescriptions",
  /* 
    #swagger.tags = ['Prescriptions']
    #swagger.summary = 'Fetch all prescriptions'
    #swagger.responses[200] = {
      description: "List of prescriptions",
      content: {
        "application/json": {
          schema: {
            type: "array",
            items: { $ref: "#/components/schemas/Prescription" }
          }
        }
      }
    }
  */
  prescriptionController.getPrescriptions
);

// Get prescription by ID
router.get(
  "/getPrescriptionById/:id",
  /* 
    #swagger.tags = ['Prescriptions']
    #swagger.summary = 'Get prescription by ID'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Prescription ID',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: "Prescription details",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Prescription" }
        }
      }
    }
    #swagger.responses[404] = { description: "Prescription not found" }
  */
  prescriptionController.getPrescriptionById
);

// Update prescription
router.put(
  "/updatePrescription/:id",
  /* 
    #swagger.tags = ['Prescriptions']
    #swagger.summary = 'Update a prescription'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Prescription ID',
      required: true,
      type: 'string'
    }
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Prescription" },
          example: { status: "Completed", doctor_notes: "Patient recovered" }
        }
      }
    }
    #swagger.responses[200] = { description: "Prescription updated successfully" }
    #swagger.responses[404] = { description: "Prescription not found" }
  */
  prescriptionController.updatePrescription
);

// Delete prescription
router.delete(
  "/deletePrescription/:id",
  /* 
    #swagger.tags = ['Prescriptions']
    #swagger.summary = 'Delete prescription'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Prescription ID',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = { description: "Prescription deleted successfully" }
    #swagger.responses[404] = { description: "Prescription not found" }
  */
  prescriptionController.deletePrescription
);

// Get prescription by ID
router.get(
  "/getPrescriptionsByPatientId/:id",
  /* 
    #swagger.tags = ['Prescriptions']
    #swagger.summary = 'Get prescription by ID'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Prescription ID',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: "Prescription details",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Prescription" }
        }
      }
    }
    #swagger.responses[404] = { description: "Prescription not found" }
  */
  prescriptionController.getPrescriptionById
);

// Get prescriptions by patient
router.get(
  "/getPrescriptionsByPatient",
  /*
    #swagger.tags = ['Prescriptions']
    #swagger.summary = 'Get prescriptions by patient ID (optional appointment filter)'
    #swagger.parameters['patientId'] = {
      in: 'query',
      description: 'ID of the patient',
      required: true,
      type: 'string'
    }
    #swagger.parameters['appointmentId'] = {
      in: 'query',
      description: 'Optional appointment ID to filter prescriptions',
      required: false,
      type: 'string'
    }
    #swagger.responses[200] = { 
      description: "List of prescriptions for the patient",
      content: {
        "application/json": {
          schema: {
            type: "array",
            items: { $ref: "#/components/schemas/Prescription" }
          },
          example: [
            {
              "_id": "68d93a037789f2d6170c3fbc",
              "appointment_id": "68d92f06a1a56a1a3f706798",
              "patient_id": {
                "_id": "68c9240bd092bc65a28ec1ef",
                "first_name": "John",
                "last_name": "Doe",
                "phone": "9876543210"
              },
              "doctor_id": {
                "employee_type": {
                  "primary_role_type": {
                    "role": "68c6fc96408320281fa3fdcd",
                    "role_name": "Doctor"
                  },
                  "secondary_role_type": []
                },
                "_id": "68d0d29d2cd8e6adc84809b6",
                "first_name": "Neha",
                "last_name": "Reddy",
                "department": "General Surgery"
              },
              "visit_date": "2025-09-28T00:00:00.000Z",
              "blood_pressure": "120/80",
              "pulse": "72",
              "height": "190",
              "weight": "95",
              "bmi": "26.3",
              "spo2": "100",
              "complaints": ["fever","vomiting"],
              "medicines": [{"name":"Paracetamol","dosage":"500mg","_id":"68d93a037789f2d6170c3fbd"}],
              "advice": "Sleep properly",
              "tests_prescribed": "Full Body checkup",
              "next_visit": "2 days",
              "status": "Draft",
              "createdAt": "2025-09-28T13:37:07.653Z",
              "updatedAt": "2025-09-28T13:37:07.653Z",
              "__v": 0
            }
          ]
        }
      }
    }
    #swagger.responses[500] = { description: "Error fetching prescriptions" }
  */
  prescriptionController.getPrescriptionsByPatientId
);
// Upsert prescription (create or update) prescription
router.post(
  "/upsertPrescription",
  /* 
    #swagger.tags = ['Prescriptions']
    #swagger.summary = 'Create or update a prescription (upsert)'
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Prescription" }
        }
      }
    }
    #swagger.responses[200] = {
      description: "Prescription created or updated successfully",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Prescription" }
        }
      }
    }
    #swagger.responses[400] = { description: "Invalid request payload" }
    #swagger.responses[500] = { description: "Server error while upserting prescription" }
  */
  prescriptionController.upsertPrescription
);

router.get(
  "/suggestions",
  /* 
    #swagger.tags = ['Prescriptions']
    #swagger.summary = 'Get top medicine suggestions for a doctor based on complaints'
    #swagger.parameters['doctorId'] = {
        in: 'query',
        description: 'ID of the doctor',
        required: true,
        type: 'string'
    }
    #swagger.parameters['complaints'] = {
        in: 'query',
        description: 'Array of complaints to match',
        required: true,
        type: 'array',
        items: { type: 'string' }
    }
    #swagger.responses[200] = {
      description: "List of top medicine suggestions",
      content: {
        "application/json": {
          schema: {
            type: "array",
            items: { $ref: "#/components/schemas/MedicineSuggestion" }
          }
        }
      }
    }
    #swagger.responses[400] = { description: "Missing doctorId or complaints" }
    #swagger.responses[500] = { description: "Server error while fetching suggestions" }
  */
  prescriptionController.getDoctorMedicineSuggestions
);

// ✅ Get all prescriptions by doctor (used by getDoctorMedicineSuggestions)
router.get(
  "/getPrescriptionsByDoctor",
  /* 
    #swagger.tags = ['Prescriptions']
    #swagger.summary = 'Get prescriptions for a doctor within a date range'
    #swagger.parameters['doctorId'] = {
        in: 'query',
        description: 'ID of the doctor',
        required: true,
        type: 'string'
    }
    #swagger.parameters['since'] = {
        in: 'query',
        description: 'ISO date string (YYYY-MM-DD). Defaults to last 30 days if not provided.',
        required: false,
        type: 'string'
    }
    #swagger.responses[200] = {
      description: "List of prescriptions for the doctor",
      content: {
        "application/json": {
          schema: {
            type: "array",
            items: {
              type: "object",
              properties: {
                medicines: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      dosage: { type: "string" },
                      duration: { type: "string" }
                    }
                  }
                },
                complaints: { type: "array", items: { type: "string" } },
                visit_date: { type: "string", format: "date-time" }
              }
            }
          }
        }
      }
    }
    #swagger.responses[400] = { description: "Missing doctorId" }
    #swagger.responses[500] = { description: "Server error while fetching prescriptions" }
  */
  prescriptionController.getPrescriptionsByDoctor
);

module.exports = router;

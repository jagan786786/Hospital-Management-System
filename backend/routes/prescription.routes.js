const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescription.controller');

// Create a new prescription
router.post(
  '/createPrescription',
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
  '/getPrescriptions',
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
  '/getPrescriptionById/:id',
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
  '/updatePrescription/:id',
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
  '/deletePrescription/:id',
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

module.exports = router;

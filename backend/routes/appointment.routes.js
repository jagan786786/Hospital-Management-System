const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointment.controller");

// CRUD APIs
router.post(
  "/createAppointment/",

  /* 
    #swagger.tags = ['Appointments']
    #swagger.summary = 'Create a new appointment'
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Appointment" },
          example: {
            patient: "64a123456789abcdef123456",
            doctor: "64a987654321abcdef987654",
            visit_date: "2023-09-15",
            visit_time: "10:30 AM",
            visit_type: "Consultation",
            doctor_department: "Cardiology",
            additional_notes: "Patient experiencing mild chest pain",
            status: "Scheduled"
          }
        }
      }
    }
    #swagger.responses[201] = { description: "Appointment created successfully" }
    #swagger.responses[400] = { description: "Validation error" }
    #swagger.responses[500] = { description: "Server error" }
  */

  appointmentController.createAppointment
);

router.get(
  "/getAppointments/",

  /* 
    #swagger.tags = ['Appointments']
    #swagger.summary = 'Fetch all appointments'
    #swagger.responses[200] = {
      description: "List of appointments",
      content: {
        "application/json": {
          schema: {
            type: "array",
            items: { $ref: "#/components/schemas/Appointment" }
          }
        }
      }
    }
  */

  appointmentController.getAppointments
);

router.get(
  "/getAppointmentById/:id",

  /* 
    #swagger.tags = ['Appointments']
    #swagger.summary = 'Get an appointment by ID'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Appointment ID',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: "Appointment details",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Appointment" }
        }
      }
    }
    #swagger.responses[404] = { description: "Appointment not found" }
  */

  appointmentController.getAppointmentById
);

router.put(
  "/updateAppointment/:id",

  /* 
    #swagger.tags = ['Appointments']
    #swagger.summary = 'Update appointment details'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Appointment ID',
      required: true,
      type: 'string'
    }
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Appointment" },
          example: { status: "Completed", additional_notes: "Consultation completed successfully" }
        }
      }
    }
    #swagger.responses[200] = { description: "Appointment updated successfully" }
    #swagger.responses[404] = { description: "Appointment not found" }
  */

  appointmentController.updateAppointment
);

router.delete(
  "/deleteAppointment/:id",

  /* 
    #swagger.tags = ['Appointments']
    #swagger.summary = 'Delete appointment by ID'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Appointment ID',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = { description: "Appointment deleted successfully" }
    #swagger.responses[404] = { description: "Appointment not found" }
  */

  appointmentController.deleteAppointment
);

// Get appointments by doctor (with optional visit_date filter)
router.get(
  "/getAppointmentsByDoctor/:doctorId",
  /*
    #swagger.tags = ['Appointments']
    #swagger.summary = 'Get all appointments of a specific doctor (optionally filter by visit date)'
    #swagger.parameters['doctorId'] = {
      in: 'query',
      description: 'Doctor ID',
      required: true,
      type: 'string'
    }
    #swagger.parameters['visit_date'] = {
      in: 'query',
      description: 'Optional visit date (YYYY-MM-DD) to filter appointments for that day',
      required: false,
      type: 'string',
      format: 'date'
    }
    #swagger.responses[200] = {
      description: "List of appointments for the specified doctor",
      content: {
        "application/json": {
          schema: {
            type: "array",
            items: { $ref: "#/components/schemas/Appointment" }
          }
        }
      }
    }
    #swagger.responses[400] = { description: "doctorId is required" }
    #swagger.responses[500] = { description: "Error fetching doctor's appointments" }
  */
  appointmentController.getAppointmentsByDoctor
);

// GET /getAppointments?patientId=...&appointmentId=...&appointmentDate=YYYY-MM-DD
router.get(
  "/getAppointmentsByParams",
  /*
    #swagger.tags = ['Appointments']
    #swagger.summary = 'Fetch appointments by optional filters (defaults to today)'
    #swagger.description = `Query params:
      - patientId — filter by patient ObjectId
      - appointmentId — filter by appointment ObjectId
      - appointmentDate — filter by date (YYYY-MM-DD). If omitted (and appointmentId omitted), defaults to today's appointments.
    `
    #swagger.parameters['patientId'] = {
      in: 'query',
      description: 'Filter by patient ObjectId',
      required: false,
      type: 'string',
      example: '64f1a7b2e3d1c2f001234567'
    }
    #swagger.parameters['appointmentId'] = {
      in: 'query',
      description: 'Filter by appointment ObjectId',
      required: false,
      type: 'string',
      example: '64f1a7b2e3d1c2f001234890'
    }
    #swagger.parameters['appointmentDate'] = {
      in: 'query',
      description: 'Filter by visit date (YYYY-MM-DD). If omitted returns today\'s appointments (unless appointmentId provided).',
      required: false,
      type: 'string',
      format: 'date',
      example: '2023-09-11'
    }
    #swagger.responses[200] = {
      description: "Array of simplified appointment objects",
      content: {
        "application/json": {
          schema: {
            type: "array",
            items: { $ref: "#/components/schemas/AppointmentSummary" }
          },
          example: [
            {
              id: "64f1a7b2e3d1c2f001234567",
              doctor_id: "64f1a7b2e3d1c2f001234890",
              appointment_time: "10:30 AM",
              visit_type: "Consultation",
              status: "Scheduled"
            }
          ]
        }
      }
    }
    #swagger.responses[500] = { description: "Server error while fetching appointments" }
  */
  appointmentController.getAppointmentsByParams
);

module.exports = router;

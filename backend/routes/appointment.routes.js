const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');

// CRUD APIs
router.post('/createAppointment/',
  
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
  
  
  appointmentController.createAppointment);
router.get('/getAppointments/', 
  
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
  
  
  appointmentController.getAppointments);
router.get('/getAppointmentById/:id', 
  
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
  
  
  appointmentController.getAppointmentById);
router.put('/updateAppointment/:id', 
  
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
  
  appointmentController.updateAppointment);
router.delete('/deleteAppointment/:id',
  
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
 
  appointmentController.deleteAppointment);

module.exports = router;

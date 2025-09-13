const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');

router.post('/createAppointment', appointmentController.createAppointment);
router.get('/getAppointments', appointmentController.getAppointments);
router.get('/getAppointmentById/:id', appointmentController.getAppointmentById);
router.put('/updateAppointment/:id', appointmentController.updateAppointment);
router.delete('/deleteAppointment/:id', appointmentController.deleteAppointment);
router.get('/last-visit/:patientId', appointmentController.getLastVisit);

module.exports = router;

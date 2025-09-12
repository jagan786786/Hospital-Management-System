const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');

const allowedTypes = ["Nurse", "Receptionist", "Doctor", "Admin", "Accountant", "House Help", "Floor Warden"];

router.post(
  '/createEmployee',
  [
    body('first_name').isString().isLength({ min: 2 }),
    body('last_name').isString().isLength({ min: 2 }),
    body('email').isEmail(),
    body('phone').isString().isLength({ min: 10 }),
    body('employee_type').isIn(allowedTypes),
    body('department').optional().isString(),
    body('salary').optional().isNumeric(),
    body('address').optional().isString(),
    body('emergency_contact_name').optional().isString(),
    body('emergency_contact_phone').optional().isString(),
    body('date_of_joining').optional().isISO8601(),
  ],
  employeeController.createEmployee
);

router.get('/getEmployees', employeeController.getEmployees);
router.put('/updateEmployee/:employeeId', employeeController.updateEmployee);
router.delete('/deleteEmployee/:employeeId', employeeController.deleteEmployee);

module.exports = router;

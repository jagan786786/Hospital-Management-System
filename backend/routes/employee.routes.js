const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');

const allowedTypes = ["Nurse", "Receptionist", "Doctor", "Admin", "Accountant", "House Help", "Floor Warden"];

router.post(
  '/',
  [
    body('first_name').isString().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
    body('last_name').isString().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
    body('email').isEmail().withMessage('Invalid email'),
    body('phone').isString().isLength({ min: 10 }).withMessage('Phone must be at least 10 characters'),
    body('employee_type').isIn(allowedTypes).withMessage('Invalid employee type'),
    body('department').optional().isString(),
    body('salary').optional().isNumeric().withMessage('Salary must be numeric'),
    body('address').optional().isString(),
    body('emergency_contact_name').optional().isString(),
    body('emergency_contact_phone').optional().isString(),
    body('date_of_joining').optional().isISO8601().withMessage('date_of_joining must be an ISO date (YYYY-MM-DD)'),
  ],
  employeeController.createEmployee
);

router.get('/', employeeController.getEmployees);
router.get('/:employeeId', employeeController.getEmployee);

module.exports = router;

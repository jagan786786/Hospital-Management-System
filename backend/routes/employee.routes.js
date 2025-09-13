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

/* 
    #swagger.tags = ['Employees']
    #swagger.summary = 'Register a new employee'
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["first_name", "last_name", "email", "phone", "employee_type"],
            properties: {
              first_name: { type: "string" },
              last_name: { type: "string" },
              email: { type: "string", format: "email" },
              phone: { type: "string" },
              employee_type: { type: "string", enum: ["Nurse", "Receptionist", "Doctor", "Admin", "Accountant", "House Help", "Floor Warden"] },
              department: { type: "string" },
              salary: { type: "number" },
              address: { type: "string" },
              emergency_contact_name: { type: "string" },
              emergency_contact_phone: { type: "string" },
              date_of_joining: { type: "string", format: "date" }
            }
          },
          example: {
            first_name: "Jane",
            last_name: "Smith",
            email: "jane.smith@example.com",
            phone: "9876543210",
            employee_type: "Doctor",
            department: "Cardiology",
            salary: 50000,
            address: "123 Hospital Road",
            emergency_contact_name: "John Smith",
            emergency_contact_phone: "9876501234",
            date_of_joining: "2023-05-12"
          }
        }
      }
    }
    #swagger.responses[201] = { description: "Employee created successfully" }
    #swagger.responses[400] = { description: "Validation error" }
    #swagger.responses[500] = { description: "Server error" }
  */

  employeeController.createEmployee
);

router.put('/updateEmployee/:employeeId', employeeController.updateEmployee);
router.delete('/deleteEmployee/:employeeId', employeeController.deleteEmployee);
router.get('/',  
  
  /* 
    #swagger.tags = ['Employees']
    #swagger.summary = 'Fetch all employees'
    #swagger.responses[200] = {
      description: "List of employees",
      content: {
        "application/json": {
          schema: {
            type: "array",
            items: { $ref: "#/components/schemas/Employee" }
          }
        }
      }
    }
  */ employeeController.getEmployees);
router.get('/:employeeId',
   /* 
    #swagger.tags = ['Employees']
    #swagger.summary = 'Get employee by ID'
    #swagger.parameters['employeeId'] = {
      in: 'path',
      description: 'Employee ID',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: "Employee details",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Employee" }
        }
      }
    }
    #swagger.responses[404] = { description: "Employee not found" }
  */
  employeeController.getEmployees);

module.exports = router;

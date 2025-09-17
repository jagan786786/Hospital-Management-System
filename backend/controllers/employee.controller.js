const { validationResult } = require('express-validator');
const Employee = require('../models/employee.model');
const { generateEmployeeId } = require('../services/idService.service');
const { hashPassword } = require('../utils/hash');
const Role = require("../models/role.model"); // ✅ import Role model

const DEFAULT_PASSWORD = process.env.DEFAULT_PASSWORD || 'Employee@123';
const EMPLOYEE_ID_PREFIX = process.env.EMPLOYEE_ID_PREFIX || 'EMP';
const EMPLOYEE_ID_PADDING = parseInt(process.env.EMPLOYEE_ID_PADDING || '6', 10);

exports.createEmployee = async (req, res) => {
  // validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const {
    first_name,
    last_name,
    email,
    phone,
    employee_type,
    department,
    salary,
    address,
    emergency_contact_name,
    emergency_contact_phone,
    date_of_joining
  } = req.body;

  try {
    // duplicate check
    const existing = await Employee.findOne({
      $or: [{ email }, { phone }]
    }).lean();

    if (existing) {
      if (existing.email === email) {
        return res.status(409).json({ message: 'An employee with this email already exists' });
      }
      if (existing.phone === phone) {
        return res.status(409).json({ message: 'An employee with this phone number already exists' });
      }
      return res.status(409).json({ message: 'Duplicate employee' });
    }

      // ✅ Validate roles
    let validRoles = [];

    if (Array.isArray(employee_type) && employee_type.length > 0) {
      validRoles = await Role.find({ role_id: { $in: employee_type } }).select("role_id");
      if (validRoles.length !== employee_type.length) {
        return res.status(400).json({ message: "One or more provided roles are invalid" });
      }
    }
    
     // Generate employeeId
    const employeeId = await generateEmployeeId(EMPLOYEE_ID_PREFIX, EMPLOYEE_ID_PADDING);
     // Hash default password
    const passwordHash = await hashPassword(DEFAULT_PASSWORD);

    const employee = new Employee({
      employee_id: employeeId,
      first_name,
      last_name,
      email,
      phone,
      employee_type: validRoles.map((r) => r._id), // ✅ ensure only valid role IDs
      department: department || null,
      salary: salary !== undefined && salary !== '' ? parseFloat(salary) : null,
      address: address || null,
      emergency_contact_name: emergency_contact_name || null,
      emergency_contact_phone: emergency_contact_phone || null,
      date_of_joining: date_of_joining ? new Date(date_of_joining) : new Date(),
      status: 'active',
      password_hash: passwordHash
    });

    await employee.save();

    // NOTE: For security, we don't return the plain password.
    // If you want to email the default password to the user, integrate an email-sending service here.
    return res.status(201).json({
      message: 'Employee created',
      employee_id: employee.employee_id,
      note: 'Default password has been set and stored hashed. Send password to employee via secure channel (email/portal).'
    });

  } catch (err) {
    console.error('Error creating employee:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getEmployees = async (req, res) => {
  try {
    const list = await Employee.find().select('-password_hash').lean();
    return res.json(list);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getEmployee = async (req, res) => {
  try {
    const emp = await Employee.findOne({ employee_id: req.params.employeeId }).select('-password_hash').lean();
    if (!emp) return res.status(404).json({ message: 'Not found' });
    return res.json(emp);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


// ✅ Update employee by ID
exports.updateEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const updatedEmployee = await Employee.findByIdAndUpdate(
      employeeId,
      { ...req.body, updated_at: new Date() },  // ensure updated_at changes
      { new: true, runValidators: true }
    );

    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json(updatedEmployee);
  } catch (error) {
    res.status(400).json({ message: "Error updating employee", error: error.message });
  }
};

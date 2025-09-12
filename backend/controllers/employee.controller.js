const { validationResult } = require('express-validator');
const Employee = require('../models/employee.model');
const { hashPassword } = require('../utils/hash');

const DEFAULT_PASSWORD = process.env.DEFAULT_PASSWORD || 'Employee@123';
const EMPLOYEE_ID_PREFIX = process.env.EMPLOYEE_ID_PREFIX || 'EMP';
const EMPLOYEE_ID_PADDING = parseInt(process.env.EMPLOYEE_ID_PADDING || '6', 10);

const generateEmployeeId = async () => {
  const lastEmployee = await Employee.findOne().sort({ created_at: -1 }).lean();
  let lastNumber = 0;
  if (lastEmployee && lastEmployee.employee_id) {
    const match = lastEmployee.employee_id.match(/\d+$/);
    if (match) lastNumber = parseInt(match[0], 10);
  }
  const nextNumber = (lastNumber + 1).toString().padStart(EMPLOYEE_ID_PADDING, '0');
  return `${EMPLOYEE_ID_PREFIX}${nextNumber}`;
};

exports.createEmployee = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  try {
    const { first_name, last_name, email, phone, employee_type, department, salary,
            address, emergency_contact_name, emergency_contact_phone, date_of_joining } = req.body;

    // duplicate check
    const existing = await Employee.findOne({ $or: [{ email }, { phone }] }).lean();
    if (existing) {
      if (existing.email === email) return res.status(409).json({ message: 'Email already exists' });
      if (existing.phone === phone) return res.status(409).json({ message: 'Phone already exists' });
      return res.status(409).json({ message: 'Duplicate employee' });
    }

    const employeeId = await generateEmployeeId();
    const passwordHash = await hashPassword(DEFAULT_PASSWORD);

    const employee = new Employee({
      employee_id: employeeId,
      first_name,
      last_name,
      email,
      phone,
      employee_type,
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
    return res.status(201).json({ message: 'Employee created', employee_id: employee.employee_id });

  } catch (err) {
    console.error('Error creating employee:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().select('-password_hash').lean();
    const count = await Employee.countDocuments();
    return res.json({ count, employees });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const updated = await Employee.findOneAndUpdate(
      { employee_id: req.params.employeeId },
      { ...req.body, updated_at: new Date() },
      { new: true, runValidators: true }
    ).select('-password_hash').lean();

    if (!updated) return res.status(404).json({ message: 'Employee not found' });
    return res.json({ message: 'Employee updated', employee: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const deleted = await Employee.findOneAndDelete({ employee_id: req.params.employeeId }).lean();
    if (!deleted) return res.status(404).json({ message: 'Employee not found' });
    return res.json({ message: 'Employee deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

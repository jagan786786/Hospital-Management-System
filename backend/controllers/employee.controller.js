const { validationResult } = require("express-validator");
const Employee = require("../models/employee.model");
const { generateEmployeeId } = require("../services/idService.service");
const { hashPassword } = require("../utils/hash");
const Role = require("../models/role.model"); // ✅ import Role model
const { sendEmail } = require("../controllers/email.controller");
const mongoose = require("mongoose");

const DEFAULT_PASSWORD = process.env.DEFAULT_PASSWORD || "Employee@123";
const EMPLOYEE_ID_PREFIX = process.env.EMPLOYEE_ID_PREFIX || "EMP";
const EMPLOYEE_ID_PADDING = parseInt(
  process.env.EMPLOYEE_ID_PADDING || "6",
  10
);
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const ONBOARDING_TEMPLATE_ID = process.env.ONBOARDING_TEMPLATE_ID;

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
    availability,
    price,
    department,
    salary,
    address,
    emergency_contact_name,
    emergency_contact_phone,
    date_of_joining,
  
  } = req.body;

  try {
    // duplicate check
    const existing = await Employee.findOne({
      $or: [{ email }, { phone }],
    }).lean();

    if (existing) {
      if (existing.email === email) {
        return res
          .status(409)
          .json({ message: "An employee with this email already exists" });
      }
      if (existing.phone === phone) {
        return res.status(409).json({
          message: "An employee with this phone number already exists",
        });
      }
      return res.status(409).json({ message: "Duplicate employee" });
    }

    // ✅ Validate roles
    let validRoles = [];

    if (Array.isArray(employee_type) && employee_type.length > 0) {
      validRoles = await Role.find({ role_id: { $in: employee_type } }).select(
        "role_id"
      );
      if (validRoles.length !== employee_type.length) {
        return res
          .status(400)
          .json({ message: "One or more provided roles are invalid" });
      }
    }

    // 🔎 Validate primary role
    let primaryRoleDoc = null;
    if (employee_type?.primary_role_type?.role) {
      primaryRoleDoc = await Role.findById(
        employee_type.primary_role_type.role
      ).lean();
      if (!primaryRoleDoc) {
        return res.status(400).json({ message: "Invalid primary role ID" });
      }
    } else {
      return res.status(400).json({ message: "Primary role is required" });
    }

    // 🔎 Validate secondary roles
    let secondaryRoles = [];
    if (Array.isArray(employee_type?.secondary_role_type)) {
      const roleIds = employee_type.secondary_role_type.map((r) => r.role);
      const validSecondaryDocs = await Role.find({
        _id: { $in: roleIds },
      }).lean();

      secondaryRoles = validSecondaryDocs.map((r) => ({
        role: r._id,
        role_name: r.name,
      }));
    }

    // Generate employeeId
    const employeeId = await generateEmployeeId(
      EMPLOYEE_ID_PREFIX,
      EMPLOYEE_ID_PADDING
    );
    // Hash default password
    const passwordHash = await hashPassword(DEFAULT_PASSWORD);

    const employee = new Employee({
      employee_id: employeeId,
      first_name,
      last_name,
      email,
      phone,
      employee_type: {
        primary_role_type: {
          role: primaryRoleDoc._id,
          role_name: primaryRoleDoc.name,
        },
        secondary_role_type: secondaryRoles,
      },
      availability: availability,
      price:price,
      department: department || null,
      salary: salary !== undefined && salary !== "" ? parseFloat(salary) : null,
      address: address || null,
      emergency_contact_name: emergency_contact_name || null,
      emergency_contact_phone: emergency_contact_phone || null,
      date_of_joining: date_of_joining ? new Date(date_of_joining) : new Date(),
      status: "active",
      password_hash: passwordHash,
    });

    const employeeRegistered = await employee.save();

    if (employeeRegistered) {
      res.status(201).json({
        message: "Employee created",
        name: employee.first_name,
        mongo_id: employee._id,
        employee_id: employee.employee_id,
        note: "Default password has been set and stored hashed. Send password to employee via secure channel (email/portal).",
      });

      const resetLink = `${FRONTEND_URL}/reset-password/${employee._id.toString()}`;

      try {
        if (ONBOARDING_TEMPLATE_ID) {
          await sendEmail(ONBOARDING_TEMPLATE_ID, {
            first_name: employee.first_name,
            last_name: employee.last_name,
            email: employee.email,
            employee_id: employee.employee_id,
            reset_link: resetLink,
          });
          emailSent = true;
        }
      } catch (emailError) {
        console.error("Error sending onboarding email:", emailError);
      }
    }
  } catch (err) {
    console.error("Error creating employee:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getEmployees = async (req, res) => {
  try {
    const list = await Employee.find().select("-password_hash").lean();
    return res.json(list);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Check if the parameter is a valid MongoDB ObjectId
    const isObjectId = mongoose.Types.ObjectId.isValid(employeeId);

    // Build query: either match employee_id or _id
    const query = isObjectId
      ? { $or: [{ employee_id: employeeId }, { _id: employeeId }] }
      : { employee_id: employeeId };

    const emp = await Employee.findOne(query).select("-password_hash").lean();

    if (!emp) return res.status(404).json({ message: "Not found" });

    return res.json(emp);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// exports.getEmployee = async (req, res) => {
//   try {
//     const emp = await Employee.findOne({ employee_id: req.params.employeeId })
//       .select("-password_hash")
//       .lean();
//     if (!emp) return res.status(404).json({ message: "Not found" });
//     return res.json(emp);
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

// ✅ Update employee by ID
exports.updateEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const updates = { ...req.body, updated_at: new Date() };

    // ✅ Handle password update properly
    if (updates.password) {
      const hashed = await hashPassword(updates.password);
      updates.password_hash = hashed;
      delete updates.password; // remove plain password
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      employeeId,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json(updatedEmployee);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating employee", error: error.message });
  }
};

const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employee_id: { type: String, required: true, unique: true },
  first_name: { type: String, required: true, minlength: 2 },
  last_name: { type: String, required: true, minlength: 2 },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  employee_type:[
      {
          type: String,
          required: false, // now not mandatory
        }
      ],
  department: { type: String, default: null },
  salary: { type: Number, default: null },
  address: { type: String, default: null },
  emergency_contact_name: { type: String, default: null },
  emergency_contact_phone: { type: String, default: null },
  date_of_joining: { type: Date, default: Date.now },
  status: { type: String, default: 'active' },
  license_number: { type: String, default: null },
  specialization: { type: String, default: null },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },

  password_hash: { type: String, required: true }
});

employeeSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

module.exports = mongoose.model('Employee', employeeSchema);

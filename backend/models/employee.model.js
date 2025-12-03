const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  employee_id: { type: String, required: true, unique: true },
  first_name: { type: String, required: true, minlength: 2 },
  last_name: { type: String, required: true, minlength: 2 },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },

  // Updated employee_type field
  employee_type: {
    primary_role_type: {
      role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
        required: true,
      },
      role_name: { type: String, required: true },
    },
    secondary_role_type: [
      {
        role: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Role",
        },
        role_name: { type: String },
      },
    ],
  },

  availability: [
    {
      days: {
        type: [String],
        required: true,
        validate: {
          validator: function (v) {
            return v.every((day) =>
              [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ].includes(day)
            );
          },
          message: (props) => `${props.value} contains invalid day(s)`,
        },
      },
      time: {
        in_time: {
          type: Number,
          required: true,
          validate: {
            validator: function (v) {
              return Number.isInteger(v) && v >= 0 && v <= 23;
            },
            message: (props) =>
              `${props.value} must be a valid 24-hour time (0–23)`,
          },
        },
        out_time: {
          type: Number,
          required: true,
          validate: {
            validator: function (v) {
              if (!Number.isInteger(v) || v < 0 || v > 23) return false;
              return v > this.time.in_time;
            },
            message: (props) =>
              `out_time (${props.value}) must be greater than in_time (${this.time.in_time}) and within 0–23 range`,
          },
        },
      },
    },
  ],

  price:{type:Number,required:true},
  department: { type: String, default: null },
  salary: { type: Number, default: null },
  address: { type: String, default: null },
  emergency_contact_name: { type: String, default: null },
  emergency_contact_phone: { type: String, default: null },
  date_of_joining: { type: Date, default: Date.now },
  status: { type: String, default: "active" },
  license_number: { type: String, default: null },
  specialization: { type: String, default: null },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },

  password_hash: { type: String, required: true },
});

employeeSchema.pre("save", function (next) {
  this.updated_at = new Date();
  next();
});

module.exports = mongoose.model("Employee", employeeSchema);

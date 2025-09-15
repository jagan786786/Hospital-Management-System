const swaggerAutogen = require('swagger-autogen')({ openapi: '3.0.0' });

const doc = {
  info: {
    title: "Hospital Management API",
    description: "API documentation for Patient Management"
  },
  servers: [
    {
      url: "http://localhost:4000", // ✅ Replace with your actual base URL if different
      description: "Local server"
    }
  ],
  components: {
    schemas: {
      Patient: {
        type: "object",
        properties: {
          first_name: { type: "string" },
          last_name: { type: "string" },
          phone: { type: "string" },
          email: { type: "string" },
          date_of_birth: { type: "string", format: "date" },
          gender: { type: "string", enum: ["Male", "Female", "Other"] },
          blood_group: { type: "string" },
          address: { type: "string" },
          medical_history: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        },
        required: ["first_name", "last_name"]
      },
      Employee: {
        type: "object",
        properties: {
          _id: { type: "string" },
          first_name: { type: "string" },
          last_name: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          employee_type: { type: "string" },
          department: { type: "string" },
          salary: { type: "number" },
          address: { type: "string" },
          emergency_contact_name: { type: "string" },
          emergency_contact_phone: { type: "string" },
          date_of_joining: { type: "string", format: "date" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        },
        required: ["first_name", "last_name", "email", "phone", "employee_type"]
      }
    }
  }
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./app.js"];

swaggerAutogen(outputFile, endpointsFiles, doc);

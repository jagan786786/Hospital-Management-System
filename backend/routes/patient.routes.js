////


const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patient.controller");

/* #swagger.tags = ['Patients'] */
router.post("/", 
   /* 
    #swagger.tags = ['Patients']
    #swagger.summary = 'Register a new patient'
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Patient" },
          example: {
            first_name: "John",
            last_name: "Doe",
            phone: "9876543210",
            email: "john@example.com",
            date_of_birth: "1990-01-01",
            gender: "Male",
            blood_group: "O+",
            address: "123 Main Street",
            medical_history: "No prior history",
            password: "patient123"
          }
        }
      }
    }
  */
  patientController.createPatient
);

/* #swagger.tags = ['Patients'] */
router.get("/stats", 
  /* 
     #swagger.summary = 'Get total patient statistics'
     #swagger.responses[200] = { description: "Returns total patient count" }
  */
  patientController.getPatientStats
);

/* #swagger.tags = ['Patients'] */
router.get("/", 
  /* #swagger.summary = 'Get all patients'
     #swagger.responses[200] = { description: "Returns list of patients" }
  */
  patientController.getPatients
);

/* #swagger.tags = ['Patients'] */
router.put("/:id", 
   /* 
    #swagger.tags = ['Patients']
    #swagger.summary = 'Update patient details'
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Patient" },
          example: {
            first_name: "John",
            last_name: "Doe",
            phone: "9876543210",
            email: "john@example.com",
            date_of_birth: "1990-01-01",
            gender: "Male",
            blood_group: "O+",
            address: "123 Main Street",
            medical_history: "No prior history",
            password: "patient123"
          }
        }
      }
    }
  */
  patientController.updatePatient
);

module.exports = router;

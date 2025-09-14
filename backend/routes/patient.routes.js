const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patient.controller");
const authenticate = require('../middleware/auth.middleware'); 

// router.post("/createPatient", patientController.createPatient);
// router.get("/getPatients", patientController.getPatients);
// router.put("/updatePatient/:id", patientController.updatePatient);
/* #swagger.tags = ['Patients'] */
router.post("/createPatient",authenticate,
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
router.get("/getPatients",authenticate,
  /* #swagger.summary = 'Get all patients'
     #swagger.responses[200] = { description: "Returns list of patients" }
  */
  patientController.getPatients
);

/* #swagger.tags = ['Patients'] */
router.put("/updatePatient/:id",authenticate,
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

const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patient.controller");

router.post("/createPatient", patientController.createPatient);
router.get("/getPatients", patientController.getPatients);
router.put("/updatePatient/:id", patientController.updatePatient);

module.exports = router;

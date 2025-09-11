const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patient.controller");

router.post("/", patientController.createPatient);
router.get("/", patientController.getPatients);
router.put("/:id", patientController.updatePatient);

module.exports = router;

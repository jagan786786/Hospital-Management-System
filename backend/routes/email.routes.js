const express = require("express");
const router = express.Router();
const emailController = require("../controllers/email.controller");

// Routes
router.post("/createTemplate", emailController.createTemplate);
router.get("/getAllTemplates", emailController.getAllTemplates);
router.get("/getTemplateById/:id", emailController.getTemplateById);
router.put("/updateTemplate/:id", emailController.updateTemplate);
router.delete("/deleteTemplate/:id", emailController.deleteTemplate);

//To send the email
router.post("/send", emailController.sendEmail);

module.exports = router;

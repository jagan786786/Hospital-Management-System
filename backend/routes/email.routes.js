const express = require("express");
const router = express.Router();
const emailController = require("../controllers/email.controller");

// Create Template
router.post(
  "/createTemplate",
  /* 
    #swagger.tags = ['EmailTemplates']
    #swagger.summary = 'Create a new email template'
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/EmailTemplate" },
          example: {
            from: "noreply@hospital.com",
            to: "{{email}}",
            subject: "Welcome Email",
            body: "Hello {{name}}, welcome to the Hospital Management System!"
          }
        }
      }
    }
    #swagger.responses[201] = { description: "Email template created successfully" }
    #swagger.responses[400] = { description: "Validation error" }
  */
  emailController.createTemplate
);


// Get All Templates
router.get(
  "/getAllTemplates",
  /* 
    #swagger.tags = ['EmailTemplates']
    #swagger.summary = 'Get all email templates'
    #swagger.responses[200] = {
      description: "Returns list of email templates",
      content: {
        "application/json": {
          schema: { type: "array", items: { $ref: "#/components/schemas/EmailTemplate" } }
        }
      }
    }
  */
  emailController.getAllTemplates
);


// Get Template by ID
router.get(
  "/getTemplateById/:id",
  /* 
    #swagger.tags = ['EmailTemplates']
    #swagger.summary = 'Get an email template by ID'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Template ID',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = { description: "Template details" }
    #swagger.responses[404] = { description: "Template not found" }
  */
  emailController.getTemplateById
);


// Update Template
router.put(
  "/updateTemplate/:id",
  /* 
    #swagger.tags = ['EmailTemplates']
    #swagger.summary = 'Update an email template'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Template ID',
      required: true,
      type: 'string'
    }
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/EmailTemplate" },
          example: {
            subject: "Updated Subject",
            body: "Hello {{name}}, this is the updated email body."
          }
        }
      }
    }
    #swagger.responses[200] = { description: "Template updated successfully" }
    #swagger.responses[404] = { description: "Template not found" }
  */
  emailController.updateTemplate
);


// Delete Template
router.delete(
  "/deleteTemplate/:id",
  /* 
    #swagger.tags = ['EmailTemplates']
    #swagger.summary = 'Delete an email template'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Template ID',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = { description: "Template deleted successfully" }
    #swagger.responses[404] = { description: "Template not found" }
  */
  emailController.deleteTemplate
);


// Send Email using a Template
router.post(
  "/send",
  /* 
    #swagger.tags = ['EmailTemplates']
    #swagger.summary = 'Send an email using a template'
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              templateId: { type: "string", example: "64df8a7d1f2b2c0012a34567" },
              to: { type: "string", example: "patient@example.com" },
              variables: {
                type: "object",
                example: { name: "John Doe", appointment_date: "2023-10-15" }
              }
            },
            required: ["templateId", "to"]
          }
        }
      }
    }
    #swagger.responses[200] = { description: "Email sent successfully" }
    #swagger.responses[400] = { description: "Validation error" }
    #swagger.responses[500] = { description: "Email sending failed" }
  */
  emailController.sendEmail
);

module.exports = router;

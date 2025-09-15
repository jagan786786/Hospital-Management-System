const express = require("express");
const router = express.Router();
const screenController = require("../controllers/screen.controller");

// Create new screen
router.post(
  "/createScreen",
  /* 
    #swagger.tags = ['Screens']
    #swagger.summary = 'Create a new screen'
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Screen" },
          example: {
            code: "SCR01",
            name: "Dashboard",
            url: "/dashboard",
            icon: "dashboard-icon"
          }
        }
      }
    }
    #swagger.responses[201] = { description: "Screen created successfully" }
    #swagger.responses[400] = { description: "Validation error" }
  */
  screenController.createScreen
);

// Get all screens
router.get(
  "/getAllScreens",
  /* 
    #swagger.tags = ['Screens']
    #swagger.summary = 'Fetch all screens'
    #swagger.responses[200] = {
      description: "List of screens",
      content: {
        "application/json": {
          schema: {
            type: "array",
            items: { $ref: "#/components/schemas/Screen" }
          }
        }
      }
    }
  */
  screenController.getAllScreens
);

// Get screen by ID
router.get(
  "/getScreenById/:id",
  /* 
    #swagger.tags = ['Screens']
    #swagger.summary = 'Get screen by ID'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Screen ID',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: "Screen details",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Screen" }
        }
      }
    }
    #swagger.responses[404] = { description: "Screen not found" }
  */
  screenController.getScreenById
);

// Update screen
router.put(
  "/updateScreen/:id",
  /* 
    #swagger.tags = ['Screens']
    #swagger.summary = 'Update a screen'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Screen ID',
      required: true,
      type: 'string'
    }
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Screen" },
          example: { name: "Reports", url: "/reports", icon: "report-icon" }
        }
      }
    }
    #swagger.responses[200] = { description: "Screen updated successfully" }
    #swagger.responses[404] = { description: "Screen not found" }
  */
  screenController.updateScreen
);

// Delete screen
router.delete(
  "/deleteScreen/:id",
  /* 
    #swagger.tags = ['Screens']
    #swagger.summary = 'Delete a screen'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Screen ID',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = { description: "Screen deleted successfully" }
    #swagger.responses[404] = { description: "Screen not found" }
  */
  screenController.deleteScreen
);

module.exports = router;

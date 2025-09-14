const express = require("express");
const router = express.Router();
const roleController = require("../controllers/role.controller");

// Create role
router.post(
  "/createRole",
  /* 
    #swagger.tags = ['Roles']
    #swagger.summary = 'Create a new role'
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Role" },
          example: {
            role_id: "R001",
            name: "Doctor",
            description: "Responsible for patient treatment",
            permissions: ["create_appointment", "update_prescription", "view_patients"]
          }
        }
      }
    }
    #swagger.responses[201] = { description: "Role created successfully" }
    #swagger.responses[400] = { description: "Validation error" }
  */
  roleController.createRole
);

// Get all roles
router.get(
  "/getRoles",
  /* 
    #swagger.tags = ['Roles']
    #swagger.summary = 'Fetch all roles'
    #swagger.responses[200] = {
      description: "List of roles",
      content: {
        "application/json": {
          schema: {
            type: "array",
            items: { $ref: "#/components/schemas/Role" }
          }
        }
      }
    }
  */
  roleController.getRoles
);

// Get role by ID
router.get(
  "/getRoleById/:id",
  /* 
    #swagger.tags = ['Roles']
    #swagger.summary = 'Get role by ID'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Role ID',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: "Role details",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Role" }
        }
      }
    }
    #swagger.responses[404] = { description: "Role not found" }
  */
  roleController.getRoleById
);

// Update role
router.put(
  "/updateRole/:id",
  /* 
    #swagger.tags = ['Roles']
    #swagger.summary = 'Update a role'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Role ID',
      required: true,
      type: 'string'
    }
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Role" },
          example: {
            description: "Updated description",
            permissions: ["view_patients", "manage_inventory"]
          }
        }
      }
    }
    #swagger.responses[200] = { description: "Role updated successfully" }
    #swagger.responses[404] = { description: "Role not found" }
  */
  roleController.updateRole
);

// Delete role
router.delete(
  "/deleteRole/:id",
  /* 
    #swagger.tags = ['Roles']
    #swagger.summary = 'Delete a role'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Role ID',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = { description: "Role deleted successfully" }
    #swagger.responses[404] = { description: "Role not found" }
  */
  roleController.deleteRole
);

module.exports = router;

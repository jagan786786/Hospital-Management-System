const express = require("express");
const router = express.Router();
const supplierController = require("../controllers/supplier.controller");

// Create Supplier
router.post(
  "/createSupplier",
  /* 
    #swagger.tags = ['Suppliers']
    #swagger.summary = 'Create a new supplier'
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Supplier" },
          example: {
            supplier_name: "MediCare Distributors",
            contact_person: "John Doe",
            phone: "9876543210",
            email: "contact@medicare.com",
            license_number: "LIC123456",
            address: "123 Pharma Street, City",
            gst_number: "29ABCDE1234F1Z5",
            is_active: true
          }
        }
      }
    }
    #swagger.responses[201] = { description: "Supplier created successfully" }
    #swagger.responses[400] = { description: "Validation error" }
  */
  supplierController.createSupplier
);


// Get All Suppliers
router.get(
  "/getSuppliers",
  /* 
    #swagger.tags = ['Suppliers']
    #swagger.summary = 'Get all suppliers'
    #swagger.responses[200] = {
      description: "Returns a list of suppliers",
      content: {
        "application/json": {
          schema: { type: "array", items: { $ref: "#/components/schemas/Supplier" } }
        }
      }
    }
  */
  supplierController.getSuppliers
);


// Get Supplier by ID
router.get(
  "/getSupplierById/:id",
  /* 
    #swagger.tags = ['Suppliers']
    #swagger.summary = 'Get a supplier by ID'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Supplier ID',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = { description: "Supplier details returned" }
    #swagger.responses[404] = { description: "Supplier not found" }
  */
  supplierController.getSupplierById
);


// Update Supplier
router.put(
  "/updateSupplier/:id",
  /* 
    #swagger.tags = ['Suppliers']
    #swagger.summary = 'Update a supplier'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Supplier ID',
      required: true,
      type: 'string'
    }
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Supplier" },
          example: {
            phone: "9123456789",
            address: "New Pharma Market, Block 5"
          }
        }
      }
    }
    #swagger.responses[200] = { description: "Supplier updated successfully" }
    #swagger.responses[404] = { description: "Supplier not found" }
  */
  supplierController.updateSupplier
);


// Delete Supplier
router.delete(
  "/deleteSupplier/:id",
  /* 
    #swagger.tags = ['Suppliers']
    #swagger.summary = 'Delete a supplier'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Supplier ID',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = { description: "Supplier deleted successfully" }
    #swagger.responses[404] = { description: "Supplier not found" }
  */
  supplierController.deleteSupplier
);



module.exports = router;

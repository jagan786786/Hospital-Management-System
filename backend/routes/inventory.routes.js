const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');

// Create inventory
router.post(
  '/createInventory',
  /* 
    #swagger.tags = ['Inventory']
    #swagger.summary = 'Create a new inventory item'
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Inventory" },
          example: {
            brand_name: "Paracetamol",
            generic_name: "Acetaminophen",
            drug_category: "Analgesic",
            form: "Tablet",
            strength: "500mg",
            batch_number: "BATCH123",
            expiry_date: "2025-12-31",
            quantity_available: 100,
            reorder_level: 20,
            supplier: "MediCorp Pvt Ltd",
            purchase_date: "2023-09-01",
            purchase_price: 2.5,
            mrp: 5,
            selling_price: 4.5,
            tax_percent: 5,
            storage_conditions: "Store in a cool and dry place",
            cold_chain_required: false,
            prescription_required: true
          }
        }
      }
    }
    #swagger.responses[201] = { description: "Inventory item created successfully" }
    #swagger.responses[400] = { description: "Validation error" }
  */
  inventoryController.createInventory
);

// Get all inventories
router.get(
  '/getInventories',
  /* 
    #swagger.tags = ['Inventory']
    #swagger.summary = 'Fetch all inventory items'
    #swagger.responses[200] = {
      description: "List of inventory items",
      content: {
        "application/json": {
          schema: {
            type: "array",
            items: { $ref: "#/components/schemas/Inventory" }
          }
        }
      }
    }
  */
  inventoryController.getInventories
);

// Get inventory by ID
router.get(
  '/getInventoryById/:id',
  /* 
    #swagger.tags = ['Inventory']
    #swagger.summary = 'Get inventory item by ID'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Inventory ID',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: "Inventory details",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Inventory" }
        }
      }
    }
    #swagger.responses[404] = { description: "Inventory not found" }
  */
  inventoryController.getInventoryById
);

// Update inventory
router.put(
  '/updateInventory/:id',
  /* 
    #swagger.tags = ['Inventory']
    #swagger.summary = 'Update an inventory item'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Inventory ID',
      required: true,
      type: 'string'
    }
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Inventory" },
          example: { quantity_available: 80, reason_for_adjustment: "Dispensed to patients" }
        }
      }
    }
    #swagger.responses[200] = { description: "Inventory item updated successfully" }
    #swagger.responses[404] = { description: "Inventory not found" }
  */
  inventoryController.updateInventory
);

// Delete inventory
router.delete(
  '/deleteInventory/:id',
  /* 
    #swagger.tags = ['Inventory']
    #swagger.summary = 'Delete an inventory item'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Inventory ID',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = { description: "Inventory item deleted successfully" }
    #swagger.responses[404] = { description: "Inventory not found" }
  */
  inventoryController.deleteInventory
);

module.exports = router;

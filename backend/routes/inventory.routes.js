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
              "brand_name": "Crocin",
              "generic_name": "Paracetamol",
              "drug_category": "Analgesic",
              "form": "Tablet",
              "strength": "500mg",
              "drug_code": "DRG1001",

              "unit_of_measure": "Box",
              "pack_size": "10x10",
              "conversion_factor": 1,

              "batch_number": "B12345",
              "lot_number": "L67890",
              "manufacturing_date": "2024-06-01",
              "expiry_date": "2026-05-31",
              "quantity_available": 500,
              "reorder_level": 100,
              "max_stock_level": 2000,

              "supplier": "MediCare Distributors",
              "purchase_date": "2024-07-01",
              "invoice_number": "INV-78945",
              "purchase_price": 15.0,
              "mrp": 20.0,
              "selling_price": 18.0,
              "tax_percent": 5,

              "storage_conditions": "Room temperature",
              "location_code": "RACK-01-A",
              "cold_chain_required": false,

              "is_controlled_substance": false,
              "prescription_required": true,
              "drug_license_number": "LIC123456",

              "suppliers": ["68cd0b241433a82bd0c7ec37"],
              "manufacturer": "GlaxoSmithKline",

              "linked_to_billing": true,
              "linked_to_emr": true,

              "last_updated_by": "64c9f3d1a2b3c4d5e6f7a8b9",
              "reason_for_adjustment": "Initial stock entry"
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
          example: {
              "brand_name": "Crocin",
              "generic_name": "Paracetamol",
              "drug_category": "Analgesic",
              "form": "Tablet",
              "strength": "500mg",
              "drug_code": "DRG1001",

              "unit_of_measure": "Box",
              "pack_size": "10x10",
              "conversion_factor": 1,

              "batch_number": "B12345",
              "lot_number": "L67890",
              "manufacturing_date": "2024-06-01",
              "expiry_date": "2026-05-31",
              "quantity_available": 500,
              "reorder_level": 100,
              "max_stock_level": 2000,

              "supplier": "MediCare Distributors",
              "purchase_date": "2024-07-01",
              "invoice_number": "INV-78945",
              "purchase_price": 15.0,
              "mrp": 20.0,
              "selling_price": 18.0,
              "tax_percent": 5,

              "storage_conditions": "Room temperature",
              "location_code": "RACK-01-A",
              "cold_chain_required": false,

              "is_controlled_substance": false,
              "prescription_required": true,
              "drug_license_number": "LIC123456",

              "suppliers": ["68cd0b241433a82bd0c7ec37"],
              "manufacturer": "GlaxoSmithKline",

              "linked_to_billing": true,
              "linked_to_emr": true,

              "last_updated_by": "64c9f3d1a2b3c4d5e6f7a8b9",
              "reason_for_adjustment": "Initial stock entry"
            }

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

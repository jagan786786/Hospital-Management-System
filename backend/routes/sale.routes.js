const express = require("express");
const router = express.Router();
const saleController = require("../controllers/sale.controller");

/**
 * @swagger
 * tags:
 *   name: Sales
 *   description: API for managing sales
 */

// Create a new sale
router.post(
  "/createSale",
  /*
    #swagger.tags = ['Sales']
    #swagger.summary = 'Create a new sale'
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Sale" },
          example: {
            sale_date: "2025-10-18T11:30:00Z",
            subtotal: 500,
            gst_enabled: true,
            gst_amount: 90,
            total_amount: 590,
            status: "completed",
            coupon_code: "FLAT10",
            discount_amount: 50,
            sale_items: [
              {
                medicine_id: "med001",
                name: "Medicine Name 1",
                quantity: 2,
                unit_price: 100,
                total_price: 200
              },
              {
                medicine_id: "med002",
                name: "Medicine Name 2",
                quantity: 3,
                unit_price: 100,
                total_price: 300
              }
            ]
          }
        }
      }
    }
    #swagger.responses[201] = { description: "Sale created successfully" }
    #swagger.responses[400] = { description: "Validation error" }
  */
  saleController.createSale
);

// Get all sales
router.get(
  "/getSales",
  /*
    #swagger.tags = ['Sales']
    #swagger.summary = 'Get all sales'
    #swagger.responses[200] = { description: "List of all sales" }
    #swagger.responses[500] = { description: "Server error" }
  */
  saleController.getAllSales
);

// Get a sale by ID
router.get(
  "/:id",
  /*
    #swagger.tags = ['Sales']
    #swagger.summary = 'Get a sale by ID'
    #swagger.parameters['id'] = { description: 'Sale ID' }
    #swagger.responses[200] = { description: "Sale found" }
    #swagger.responses[404] = { description: "Sale not found" }
  */
  saleController.getSaleById
);

// Update a sale
router.put(
  "/updateSale/:id",
  /*
    #swagger.tags = ['Sales']
    #swagger.summary = 'Update a sale by ID'
    #swagger.parameters['id'] = { description: 'Sale ID' }
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Sale" },
          example: {
            status: "completed",
            total_amount: 600
          }
        }
      }
    }
    #swagger.responses[200] = { description: "Sale updated successfully" }
    #swagger.responses[400] = { description: "Validation error" }
    #swagger.responses[404] = { description: "Sale not found" }
  */
  saleController.updateSale
);

// Delete a sale
router.delete(
  "deleteSale/:id",
  /*
    #swagger.tags = ['Sales']
    #swagger.summary = 'Delete a sale by ID'
    #swagger.parameters['id'] = { description: 'Sale ID' }
    #swagger.responses[200] = { description: "Sale deleted successfully" }
    #swagger.responses[404] = { description: "Sale not found" }
  */
  saleController.deleteSale
);

module.exports = router;

const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customer.controller");

// 📋 Get All Customers
router.get(
  "/getCustomers",
  /*
    #swagger.tags = ['Customers']
    #swagger.summary = 'Fetch all customers'
    #swagger.description = 'Retrieves a list of all customers sorted alphabetically by name.'
    #swagger.responses[200] = {
      description: "List of customers retrieved successfully",
      content: {
        "application/json": {
          schema: { type: "array", items: { $ref: "#/components/schemas/Customer" } },
          example: [
            {
              _id: "670f56b7c12f3d882b41ef90",
              name: "Rahul Verma",
              email: "rahul@example.com",
              phone: "9876501234",
              address: "Sector 22, Chandigarh",
              customer_type: "customer"
            },
            {
              _id: "670f572ac12f3d882b41efa3",
              name: "Aditi Singh",
              email: "aditi@example.com",
              phone: "9823456789",
              address: "Bandra West, Mumbai",
              customer_type: "customer"
            }
          ]
        }
      }
    }
    #swagger.responses[500] = { description: "Error fetching customers" }
  */
  customerController.getCustomers
);

// ➕ Create Customer
router.post(
  "/createCustomer",
  /*
    #swagger.tags = ['Customers']
    #swagger.summary = 'Create a new customer'
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Customer" },
          example: {
            name: "Rahul Verma",
            email: "rahul@example.com",
            phone: "9876501234",
            address: "Sector 22, Chandigarh"
          }
        }
      }
    }
    #swagger.responses[201] = { description: "Customer created successfully" }
    #swagger.responses[400] = { description: "Validation error - missing name or invalid data" }
    #swagger.responses[500] = { description: "Error creating customer" }
  */
  customerController.createCustomer
);

// ✏️ Update Customer
router.put(
  "/updateCustomer/:id",
  /*
    #swagger.tags = ['Customers']
    #swagger.summary = 'Update existing customer details'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Customer ID to update',
      required: true,
      schema: { type: 'string', example: '670f56b7c12f3d882b41ef90' }
    }
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Customer" },
          example: {
            name: "Rahul Verma",
            email: "rahulv@example.com",
            phone: "9876501234",
            address: "Sector 17, Chandigarh"
          }
        }
      }
    }
    #swagger.responses[200] = { description: "Customer updated successfully" }
    #swagger.responses[404] = { description: "Customer not found" }
    #swagger.responses[500] = { description: "Error updating customer" }
  */
  customerController.updateCustomer
);

module.exports = router;

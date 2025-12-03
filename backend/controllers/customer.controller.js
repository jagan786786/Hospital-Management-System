const Customer = require("../models/customer.model");

const generateId = () => {
  const timestamp = Date.now(); // ✅ define it
  const timestampPart = timestamp.toString(36).slice(-2).toUpperCase(); // last 2 chars
  const randomPart = Math.random().toString(36).substring(2, 4).toUpperCase(); // 2 random chars
  return `CUST${timestampPart}${randomPart}`; // total length = 7
};

// ✅ GET: Fetch all customers
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ name: 1 });
    res.status(200).json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res
      .status(500)
      .json({ message: "Error fetching customers", error: error.message });
  }
};

// ✅ POST: Create new customer
exports.createCustomer = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    if (!name) return res.status(400).json({ message: "Name is required" });

    // Generate unique customer_id
    const customer_id = generateId();

    const newCustomer = new Customer({
      customer_id, // assign generated ID
      name,
      email,
      phone,
      address,
    });

    await newCustomer.save();

    res.status(201).json({
      message: "Customer created successfully",
      customer: newCustomer,
    });
  } catch (error) {
    console.error("Error creating customer:", error);
    res.status(500).json({
      message: "Error creating customer",
      error: error.message,
    });
  }
};

// ✅ PUT: Update existing customer
exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address } = req.body;

    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      { name, email, phone, address },
      { new: true }
    );

    if (!updatedCustomer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({
      message: "Customer updated successfully",
      customer: updatedCustomer,
    });
  } catch (error) {
    console.error("Error updating customer:", error);
    res
      .status(500)
      .json({ message: "Error updating customer", error: error.message });
  }
};

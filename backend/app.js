const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const app = express();
const cookieParser = require("cookie-parser");
const connectToDb = require("./db/db");

// Routes
const patientRoutes = require("./routes/patient.routes");
const employeeRoutes = require("./routes/employee.routes");
const appointmentRoutes = require("./routes/appointment.routes");
const inventoryRoutes = require("./routes/inventory.routes");
const authRoutes = require("./routes/auth.routes");
const prescriptionRoutes = require("./routes/prescription.routes");
const roleRoutes = require("./routes/role.routes");
const screenRoutes = require("./routes/screen.routes");
const emailRoutes = require("./routes/email.routes");
const supplierRoutes = require("./routes/supplier.routes");

// Swagger docs
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger-output.json"); // generated file

// Connect DB
connectToDb();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to the Hospital Management System API ✅");
});

// API docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

// API routes
app.use("/api/patients", patientRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/screen", screenRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/supplier", supplierRoutes);

module.exports = app;

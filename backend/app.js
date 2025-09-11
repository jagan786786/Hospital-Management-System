const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const app = express();
const cookieParser = require('cookie-parser');
const connectToDb = require('./db/db');
const patientRoutes = require("./routes/patient.routes");
const employeeRoutes = require('./routes/employee.routes');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger-output.json'); // generated file


connectToDb();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('Welcome to the Hopital Management System API');
});

// serve docs at /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.use("/api/patients", patientRoutes);
app.use('/api/employees', employeeRoutes);

module.exports = app;


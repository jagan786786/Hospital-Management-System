const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const app = express();
const cookieParser = require('cookie-parser');
const connectToDb = require('./db/db');
const patientRoutes = require("./routes/patient.routes");
const employeeRoutes = require('./routes/employee.routes');
const authRoutes = require('./routes/auth.routes');

connectToDb();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.use("/api/patients", patientRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/auth', authRoutes);

module.exports = app;


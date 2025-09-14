const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Employee = require("../models/employee.model");
const Patient = require("../models/patient.model");
const RefreshToken = require("../models/refreshToken.model");
const { comparePassword } = require("../utils/hash");

const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
  });
};

const generateRefreshToken = async (payload) => {
  const token = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  });

  // calculate exact expiry date
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days, same as REFRESH_TOKEN_EXPIRES_IN

  await RefreshToken.create({
    userId: payload.id,
    userType: payload.type, // employee / patient
    token,
    expiresAt,
  });

  return token;
};

// LOGIN (email or phone)
exports.login = async (req, res) => {
  const { identifier, password } = req.body; 
  // `identifier` can be email or phone

  try {
    let user, role, userType;

    // First try Employee (check email or phone)
    user = await Employee.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });

    if (user) {
      const valid = await comparePassword(password, user.password_hash);
      if (!valid)
        return res.status(401).json({ message: "Invalid credentials" });

      role = user.employee_type;
      userType = "employee";
    } else {
      // Try Patient (check email or phone)
      user = await Patient.findOne({
        $or: [{ email: identifier }, { phone: identifier }],
      });

      if (!user)
        return res.status(401).json({ message: "Invalid credentials" });

      const valid = await user.comparePassword(password);
      if (!valid)
        return res.status(401).json({ message: "Invalid credentials" });

      role = "Patient";
      userType = "patient";
    }

    // Generate tokens
    const payload = { id: user._id, role, type: userType };
    const accessToken = generateAccessToken(payload);
    const refreshToken = await generateRefreshToken(payload);

    res.json({ accessToken, refreshToken, role });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// REFRESH TOKEN
exports.refresh = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.sendStatus(401);

  try {
    const stored = await RefreshToken.findOne({ token });
    if (!stored) return res.sendStatus(403);

    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const accessToken = generateAccessToken({
      id: payload.id,
      role: payload.role,
      type: payload.type,
    });

    res.json({ accessToken });
  } catch (err) {
    res.status(403).json({ message: "Invalid refresh token" });
  }
};

// LOGOUT
exports.logout = async (req, res) => {
  const { token } = req.body;
  await RefreshToken.findOneAndDelete({ token });
  res.json({ message: "Logged out successfully" });
};

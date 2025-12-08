// SMTP
// const nodemailer = require("nodemailer");
// require("dotenv").config(); // Load env variables
// import { google } from "googleapis";

// // Configure Nodemailer transporter
// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: process.env.SMTP_PORT,
//   secure: process.env.SMTP_SECURE === "true",
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });

// module.exports = transporter;

// HTTPS Email Transporter using Gmail API OAuth2

/**
 * Gmail API OAuth2 Transporter (Drop-in replacement)
 */

const nodemailer = require("nodemailer");
const { google } = require("googleapis");
require("dotenv").config();

const OAuth2 = google.auth.OAuth2;

// OAuth2 Client Setup
const oauth2Client = new OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground" // redirect URI
);

// Set the refresh token
oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});

// Create transporter using Gmail API (NO SMTP!)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.GMAIL_EMAIL,
    clientId: process.env.GMAIL_CLIENT_ID,
    clientSecret: process.env.GMAIL_CLIENT_SECRET,
    refreshToken: process.env.GMAIL_REFRESH_TOKEN,
    accessToken: async () => {
      const token = await oauth2Client.getAccessToken();
      return token.token;
    },
  },
});

// Verify (optional but useful for debugging)
transporter.verify((err, success) => {
  if (err) {
    console.error("Gmail API Transporter Error:", err);
  } else {
    console.log("Gmail API Transporter Ready");
  }
});

module.exports = transporter;

// services/mailer.service.js
/**
 * Gmail REST-based mailer that mimics a nodemailer transporter interface.
 * - Exports an object with sendMail(mailOptions) and verify() methods
 * - Uses googleapis (no SMTP) so it works on PaaS like Render
 *
 * Required env vars:
 *   GMAIL_CLIENT_ID
 *   GMAIL_CLIENT_SECRET
 *   GMAIL_REFRESH_TOKEN
 *   GMAIL_EMAIL          (default sender)
 * Optional:
 *   GMAIL_SEND_TIMEOUT_MS (ms, default 15000)
 */

const { google } = require("googleapis");
require("dotenv").config();

const TIMEOUT_MS = process.env.GMAIL_SEND_TIMEOUT_MS
  ? parseInt(process.env.GMAIL_SEND_TIMEOUT_MS, 10)
  : 15000;

const {
  GMAIL_CLIENT_ID,
  GMAIL_CLIENT_SECRET,
  GMAIL_REFRESH_TOKEN,
  GMAIL_EMAIL,
} = process.env;

// Basic checks (non-fatal, runtime errors if missing)
if (
  !GMAIL_CLIENT_ID ||
  !GMAIL_CLIENT_SECRET ||
  !GMAIL_REFRESH_TOKEN ||
  !GMAIL_EMAIL
) {
  console.warn(
    "mailer.service: missing one of GMAIL_CLIENT_ID/SECRET/REFRESH_TOKEN/EMAIL in env"
  );
}

// OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  GMAIL_CLIENT_ID,
  GMAIL_CLIENT_SECRET
);
oauth2Client.setCredentials({ refresh_token: GMAIL_REFRESH_TOKEN });

// helper: promise with timeout
function promiseWithTimeout(promise, ms, errMsg = "Operation timed out") {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(errMsg)), ms);
    }),
  ]).finally(() => clearTimeout(timer));
}

// build raw RFC2822 message and base64url encode (Gmail API requires base64url)
function makeRawMessage({ from, to, subject, text, html }) {
  const lines = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=UTF-8",
    "",
    html || text || "",
  ];
  const message = lines.join("\r\n");
  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Convert errors to readable messages
function normalizeError(err) {
  if (!err) return new Error("Unknown error");
  if (err instanceof Error) return err;
  try {
    return new Error(JSON.stringify(err));
  } catch (e) {
    return new Error(String(err));
  }
}

// The transporter-like object we export
const transporter = {
  /**
   * sendMail(mailOptions)
   * - mailOptions: { from, to, subject, text?, html? }
   * - returns a Promise resolving to an info object similar to nodemailer:
   *   { accepted: [to], messageId: '<gmailId>', raw: '<base64raw>' }
   */
  async sendMail(mailOptions = {}) {
    if (!mailOptions || !mailOptions.to || !mailOptions.subject) {
      throw new Error('mailOptions must include "to" and "subject"');
    }

    const from = mailOptions.from || GMAIL_EMAIL;
    if (!from) throw new Error("Sender not configured (GMAIL_EMAIL)");

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    const raw = makeRawMessage({
      from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      text: mailOptions.text,
      html: mailOptions.html,
    });

    // Debug log (safe to keep; redact in production if needed)
    console.log(
      `[mailer] send start -> to=${mailOptions.to} subject=${
        mailOptions.subject
      } time=${new Date().toISOString()}`
    );

    try {
      const res = await promiseWithTimeout(
        gmail.users.messages.send({
          userId: "me",
          requestBody: { raw },
        }),
        TIMEOUT_MS,
        "Gmail API send timed out"
      );

      const id = res && res.data && res.data.id;
      console.log(`[mailer] send success -> id=${id} to=${mailOptions.to}`);

      // Return nodemailer-like info for compatibility
      return {
        accepted: [mailOptions.to],
        rejected: [],
        messageId: id || null,
        raw,
        providerResponse: res && res.data,
      };
    } catch (err) {
      console.error(
        `[mailer] send error -> to=${mailOptions.to} err=${err && err.message}`
      );
      const e = normalizeError(err);
      e.message = `Gmail send error: ${e.message}`;
      e.original = err;
      throw e;
    }
  },

  /**
   * verify() - mimic nodemailer.verify()
   * Attempts to obtain an access token (quick health check).
   * resolves true on success, rejects on error.
   */
  async verify() {
    try {
      const token = await promiseWithTimeout(
        oauth2Client.getAccessToken(),
        8000,
        "OAuth token fetch timed out"
      );
      // token may be an object or string; treat absence as error
      if (!token) throw new Error("No access token returned");
      return true;
    } catch (err) {
      console.error("[mailer] verify failed:", err && err.message);
      throw normalizeError(err);
    }
  },
};

module.exports = transporter;

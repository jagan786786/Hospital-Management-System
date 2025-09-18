const mongoose = require("mongoose");

const emailTemplateSchema = new mongoose.Schema(
  {
    from: { type: String, required: true },
    to: { type: String, required: true }, // can include placeholders like {{email}}
    subject: { type: String, required: true },
    body: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmailTemplate", emailTemplateSchema);

const EmailTemplate = require("../models/emailTemplate.model");
const transporter = require("../services/mailer.service");

// Helper: Replace placeholders in template body
function applyTemplate(body, params) {
  let result = body;
  for (const key in params) {
    const regex = new RegExp(`{{${key}}}`, "g");
    result = result.replace(regex, params[key]);
  }
  return result;
}

// ✅ Create email template
exports.createTemplate = async (req, res) => {
  try {
    const { from, to, subject, body } = req.body;

    if (!from || !to || !subject || !body) {
      return res.status(400).json({
        error: "All fields (from, to, subject, body) are required.",
      });
    }

    const template = await EmailTemplate.create({ from, to, subject, body });
    res.json({ message: "Template created successfully", id: template._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get all templates
exports.getAllTemplates = async (req, res) => {
  try {
    const templates = await EmailTemplate.find().lean();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get template by ID
exports.getTemplateById = async (req, res) => {
  try {
    const template = await EmailTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update template
exports.updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { from, to, subject, body } = req.body;

    const template = await EmailTemplate.findById(id);
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    template.from = from || template.from;
    template.to = to || template.to;
    template.subject = subject || template.subject;
    template.body = body || template.body;

    await template.save();
    res.json({ message: "Template updated successfully", template });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Delete template
exports.deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await EmailTemplate.findByIdAndDelete(id);

    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    res.json({ message: "Template deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * ✅ Send email using template
 * - Can be called internally: sendEmail(id, params)
 * - Or as API: POST /email/send { id, params }
 */
async function sendEmail(id, params) {
  const template = await EmailTemplate.findById(id);
  if (!template) throw new Error("Template not found");

  const parsedBody = applyTemplate(template.body, params || {});
  const parsedSubject = applyTemplate(template.subject, params || {});
  const parsedTo = applyTemplate(template.to, params || {});

  const htmlBody = `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
        </style>
      </head>
      <body>
        ${parsedBody}
      </body>
    </html>`;

  return transporter.sendMail({
    from: template.from,
    to: parsedTo,
    subject: parsedSubject,
    html: htmlBody,
  });
}

// ✅ Expose function for internal usage
exports.sendEmail = sendEmail;

// ✅ API endpoint wrapper
exports.sendEmailApi = async (req, res) => {
  try {
    const { id, params } = req.body;
    const info = await sendEmail(id, params);
    res.json({ message: "Email sent successfully", info });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

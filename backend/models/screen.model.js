const mongoose = require("mongoose");

const screenSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Auto-generate unique code like SCRN001, SCRN002...
screenSchema.pre("save", async function (next) {
  if (this.code) return next();

  const Screen = mongoose.model("Screen", screenSchema);

  const lastScreen = await Screen.findOne().sort({ createdAt: -1 });

  let newCode = "SCRN001";
  if (lastScreen && lastScreen.code) {
    const lastNum = parseInt(lastScreen.code.replace("SCRN", ""), 10);
    newCode = `SCRN${String(lastNum + 1).padStart(3, "0")}`;
  }

  this.code = newCode;
  next();
});

module.exports = mongoose.model("Screen", screenSchema);

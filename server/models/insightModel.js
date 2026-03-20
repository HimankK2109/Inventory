import mongoose from "mongoose";

const insightSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    default: "ALL",
  },

  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },

  generatedAt: {
    type: Date,
    default: Date.now,
  },

  // 🔥 ADD THIS
  urgentCount: {
    type: Number,
    default: 0,
  }

}, {
  versionKey: false
});

const Insight = mongoose.model("Insight", insightSchema);

export default Insight;
import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  threshold: { type: Number, default: 5 },

  totalUsed: { type: Number, default: 0 },

  usageHistory: [
    {
      date: { type: Date, default: Date.now },
      amount: Number,
    },
  ],

  rushAlert: {
    message: String,
    severity: {
      type: String,
      enum: ["CRITICAL", "HIGH", "MEDIUM", "OK"],
    },
    lastUpdated: Date,
  }
}, { timestamps: true });

export default mongoose.model("Item", itemSchema);
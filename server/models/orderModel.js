import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  items: [
    {
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
      },
      name: String,
      quantity: Number,
    },
  ],

  totalPrice: Number,
  customerName: String,

}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
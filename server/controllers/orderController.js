import mongoose from "mongoose";
import Item from "../models/itemModel.js";
import Order from "../models/orderModel.js";
import recipes from "../config/recipes.js";
import { evaluateCritical } from "../services/aiService.js";

export const addOrder = async (req, res) => {
  let session;
  try {
    const { product, quantity, price, customer } = req.body;
    
    if (!product || !quantity || !price || !customer) {
      return res.status(400).json({ message: "Missing fields" });
    }
    
    if (!recipes[product]) {
      return res.status(400).json({ message: "Unknown product" });
    }

    session = await mongoose.startSession();
    session.startTransaction();
    
    const recipe = recipes[product];
    const affectedItems = [];

    // Deduct inventory
    for (let ingredient of recipe) {
      const item = await Item.findOne({ name: ingredient.name }).session(session);

      if (!item) throw new Error(`${ingredient.name} not found`);

      const usedQty = ingredient.qty * quantity;

      if (item.quantity < usedQty) {
        throw new Error(`Not enough ${ingredient.name}`);
      }

      // update stock
      item.quantity = Number((item.quantity - usedQty).toFixed(3));
      item.totalUsed = (item.totalUsed || 0) + usedQty;

      item.usageHistory = item.usageHistory || [];
      item.usageHistory.push({
        amount: usedQty,
        date: new Date(),
      });

      await item.save({ session });

      affectedItems.push(item); // store for later processing
    }

    // ✅ Save order
    const totalPrice = price * quantity;

    const order = await Order.create(
      [
        {
          items: [{ name: product, quantity }],
          totalPrice,
          customerName: customer,
        },
      ],
      { session }
    );

    // Commit transaction FIRST (important)
    await session.commitTransaction();
    session.endSession();

    // AFTER COMMIT → run AI + alert logic (NO SESSION)
    for (let item of affectedItems) {
      try {
        const alert = evaluateCritical(item);

        if (alert && ["HIGH", "CRITICAL"].includes(alert.severity)) {
          item.rushAlert = {
            message: alert.message,
            severity: alert.severity,
            suggestedQty: alert.suggestedQty,
            lastUpdated: new Date(),
          };
        } else {
          item.rushAlert = {
            message: "Stock is sufficient",
            severity: "OK",
            lastUpdated: new Date(),
          };
        }

        await item.save();

      } catch (err) {
        console.error("Critical logic error:", item.name, err.message);
      }
    }

    res.json({
      message: "Order placed successfully",
      order: order[0],
    });

  } catch (err) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }

    res.status(500).json({ error: err.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    const formatted = orders.map(o => ({
      id: o._id,
      customer: o.customerName,
      totalPrice: o.totalPrice,
      date: o.createdAt,

      items: o.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
      })),
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
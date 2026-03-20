import mongoose from "mongoose";
import dotenv from "dotenv";
import Item from "./models/itemModel.js";
import Order from "./models/orderModel.js";
import Insight from "./models/insightModel.js";
import recipes from "./config/recipes.js";

dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);

// Clear DB
await Item.deleteMany();
await Order.deleteMany();
await Insight.deleteMany();

// Helper
const getPastDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
};

// REALISTIC CURRENT STOCK (not warehouse)
let itemsMap = {
  "Milk": { name: "Milk", quantity: 80, unit: "L", threshold: 10, totalUsed: 0, usageHistory: [] },
  "Coffee Beans": { name: "Coffee Beans", quantity: 20, unit: "Kg", threshold: 5, totalUsed: 0, usageHistory: [] },
  "Tea Leaves": { name: "Tea Leaves", quantity: 25, unit: "Kg", threshold: 5, totalUsed: 0, usageHistory: [] },
  "Sugar": { name: "Sugar", quantity: 40, unit: "Kg", threshold: 10, totalUsed: 0, usageHistory: [] },
  "Bread": { name: "Bread", quantity: 60, unit: "pcs", threshold: 10, totalUsed: 0, usageHistory: [] },
  "Butter": { name: "Butter", quantity: 15, unit: "Kg", threshold: 5, totalUsed: 0, usageHistory: [] },
  "Cheese": { name: "Cheese", quantity: 20, unit: "Kg", threshold: 5, totalUsed: 0, usageHistory: [] },
  "Chocolate Syrup": { name: "Chocolate Syrup", quantity: 10, unit: "L", threshold: 3, totalUsed: 0, usageHistory: [] },
};

// Products
const products = Object.keys(recipes);
const orders = [];

// Generate 30 days realistic usage
for (let i = 30; i >= 1; i--) {
  const date = getPastDate(i);

  // Weekends more busy
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  const ordersPerDay = isWeekend ? 20 : 10;

  for (let j = 0; j < ordersPerDay; j++) {
    const product = products[Math.floor(Math.random() * products.length)];
    const quantity = Math.random() < 0.7 ? 1 : 2;

    orders.push({
      items: [{ name: product, quantity }],
      customerName: ["John", "Alice", "Bob"][Math.floor(Math.random() * 3)],
      createdAt: date,
    });

    // Apply recipe usage
    const recipe = recipes[product];

    for (let ing of recipe) {
      const used = ing.qty * quantity;

      itemsMap[ing.name].totalUsed += used;

      itemsMap[ing.name].usageHistory.push({
        date,
        amount: Number(used.toFixed(2)),
      });
    }
  }
}

// Add SMALL recent spike (not crazy)
const today = new Date();

[
  { name: "Milk", amount: 10 },
  { name: "Bread", amount: 20 },
  { name: "Coffee Beans", amount: 2 },
].forEach((item) => {
  itemsMap[item.name].usageHistory.push({
    date: today,
    amount: item.amount,
  });

  itemsMap[item.name].totalUsed += item.amount;
});

// Save
await Item.insertMany(Object.values(itemsMap));
await Order.insertMany(orders);

process.exit();
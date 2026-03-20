import Item from "../models/itemModel.js";

const formatName = (name) =>
  name.trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

export const getInventory = async (req, res) => {
  try {
    const items = await Item.find();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const result = items.map(item => {
      const usedThisMonth = item.usageHistory
        .filter(u => new Date(u.date) >= startOfMonth)
        .reduce((sum, u) => sum + u.amount, 0);

      const obj = item.toObject();

      return {
        ...obj,
        usedThisMonth,
        status: item.rushAlert?.severity || "OK", // unified logic
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addInventory = async (req, res) => {
  try {
    let { name, quantity, unit } = req.body;

    if (!name || !quantity || !unit) {
      return res.status(400).json({ message: "Missing fields" });
    }

    if (quantity <= 0) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    // normalize name
    name = formatName(name);

    // 🔍 Check if item exists
    let item = await Item.findOne({ name });

    if (item) {
      // Optional: unit validation
      if (item.unit !== unit) {
        return res.status(400).json({
          message: `Unit mismatch. Expected ${item.unit}`,
        });
      }

      // Update quantity
      item.quantity += quantity;

      await item.save();

      return res.json({
        message: "Stock updated",
        item,
      });
    }

    // Create new item
    const newItem = await Item.create({
      name,
      quantity,
      unit,
      threshold: 5, // default
    });

    res.json({
      message: "Item created",
      item: newItem,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
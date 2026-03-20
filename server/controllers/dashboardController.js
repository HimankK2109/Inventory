import Item from "../models/itemModel.js";
import Insight from "../models/insightModel.js";
import { evaluateCritical } from "../services/aiService.js";

export const getDashboardData = async (req, res) => {
  try {
    const items = await Item.find();
    const insight = await Insight.findOne({ key: "ALL" });

    const updatedItems = items.map(item => {
      const alert = evaluateCritical(item);

      return {
        ...item.toObject(),
        rushAlert: alert || {
          message: "Stock is stable",
          severity: "OK"
        }
      };
    });

    const totalItems = updatedItems.length;

    const lowStock = updatedItems.filter(item =>
      item.quantity <= item.threshold ||
      ["HIGH", "CRITICAL"].includes(item.rushAlert?.severity)
    ).length;

    const wasteReduced = insight?.data?.length
      ? Math.round(
          insight.data.reduce((sum, i) => sum + (i.wasteReduced || 0), 0) /
          insight.data.length
        )
      : null;

    const priority = { CRITICAL: 3, HIGH: 2, MEDIUM: 1, OK: 0 };

    const topItems = [...updatedItems]
      .sort((a, b) =>
        (priority[b.rushAlert?.severity] || 0) -
        (priority[a.rushAlert?.severity] || 0) ||
        (b.totalUsed || 0) - (a.totalUsed || 0)
      )
      .slice(0, 3)
      .map(i => ({
        name: i.name,
        quantity: i.quantity,
        rushAlert: i.rushAlert
      }));

    // 📊 Graph data
    const selectedItems = ["Milk", "Coffee Beans", "Sugar"];

    const today = new Date();
    const last5Days = [];

    for (let i = 4; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);

      last5Days.push({
        key: d.toISOString().slice(0, 10), // for matching
        label: `${d.getDate()}/${d.getMonth() + 1}` // for frontend
      });
    }

    const graphData = last5Days.map(day => {
    const obj = { date: day.label };

    selectedItems.forEach(name => {
      const item = items.find(i => i.name === name);

      if (!item) {
        obj[name] = 0;
        return;
      }

      const total = (item.usageHistory || [])
        .filter(u => new Date(u.date).toISOString().slice(0, 10) === day.key)
        .reduce((sum, u) => sum + u.amount, 0);

      obj[name] = total;
    });

    return obj;
  });

    // FINAL RESPONSE
    res.json({
      totalItems,
      lowStock,
      wasteReduced,
      topItems,
      allItems: updatedItems,
      graphData
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
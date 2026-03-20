import Item from "../models/itemModel.js";
import Insight from "../models/insightModel.js";
import { generateAIInsights } from "../services/aiService.js";

const FOUR_HOURS = 4 * 60 * 60 * 1000;
const MAX_URGENT = 2;

const formatItems = (items) => {
  return items.map(item => {
    const dailyUsageMap = {};

    item.usageHistory.forEach(u => {
      const day = new Date(u.date).toISOString().split("T")[0];

      if (!dailyUsageMap[day]) {
        dailyUsageMap[day] = 0;
      }

      dailyUsageMap[day] += u.amount;
    });

    const dailyUsageArray = Object.values(dailyUsageMap);

    return {
      name: item.name,
      quantity: item.quantity,
      usage: dailyUsageArray.length ? dailyUsageArray : [0],
    };
  });
};

export const getAllInsights = async (req, res) => {
  try {
    const force = req.query.force === "true";
    const now = new Date();

    let existing = await Insight.findOne({ key: "ALL" });

    const items = await Item.find();
    const formattedData = formatItems(items);

    // FIRST TIME
    if (!existing) {
      const aiResponse = await generateAIInsights(formattedData);

      await Insight.findOneAndUpdate(
        { key: "ALL" },
        {
          key: "ALL",
          data: aiResponse,
          generatedAt: now,
          urgentCount: 0,
        },
        { upsert: true, new: true }
      );

      return res.json({
        insights: aiResponse,
        refreshLeft: MAX_URGENT,
      });
    }

    const timeDiff = now - new Date(existing.generatedAt);

    // AUTO REFRESH
    if (timeDiff > FOUR_HOURS) {
      const aiResponse = await generateAIInsights(formattedData);

      existing.data = aiResponse;
      existing.generatedAt = now;

      await existing.save();

      return res.json({
        insights: aiResponse,
        refreshLeft: MAX_URGENT - (existing.urgentCount || 0),
      });
    }

    // URGENT REFRESH
    if (force) {
      if ((existing.urgentCount || 0) >= MAX_URGENT) {
        return res.status(429).json({
          message: "Urgent refresh limit reached",
          refreshLeft: 0,
        });
      }

      const aiResponse = await generateAIInsights(formattedData);

      existing.data = aiResponse;
      existing.generatedAt = now;
      existing.urgentCount += 1;

      await existing.save();

      return res.json({
        insights: aiResponse,
        refreshLeft: MAX_URGENT - existing.urgentCount,
      });
    }

    // RETURN CACHE
    return res.json({
      insights: existing.data,
      refreshLeft: MAX_URGENT - (existing.urgentCount || 0),
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
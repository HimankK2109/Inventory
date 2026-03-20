import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

const model = genAI.getGenerativeModel({
  model: "models/gemini-2.5-flash"
});

const cleanJSON = (text) => {
  // remove markdown blocks
  text = text.replace(/```json/g, "").replace(/```/g, "").trim();

  // detect array first
  const arrayStart = text.indexOf("[");
  const arrayEnd = text.lastIndexOf("]");

  if (arrayStart !== -1 && arrayEnd !== -1) {
    return text.substring(arrayStart, arrayEnd + 1);
  }

  throw new Error("Invalid JSON from AI");
};

// FALLBACK LOGIC (INSIGHTS)
const fallbackInsights = (item) => {
  const usage = item.usage || [];

  if (!usage.length) {
    return {
      itemName: item.name,
      prediction: { daysLeft: 0, reorderInDays: 0, probability: 100 },
      consumption: { dailyAvg: 0, trend: "stable" },
      sustainability: { wasteRisk: "LOW", ecoScore: 50 },
      suggestions: ["No usage data available"],
      wasteReduced: 0,
      error: "AI failed → fallback used",
    };
  }

  // avg usage
  const totalUsed = usage.reduce((s, val) => s + val, 0);
  const avgUsage = totalUsed / usage.length;

  // days left (CLAMPED)
  let daysLeft = item.quantity / (avgUsage || 1);
  daysLeft = Math.min(30, Math.max(0, daysLeft));

  // trend detection
  const mid = Math.floor(usage.length / 2);

  const firstHalf = usage.slice(0, mid).reduce((s, v) => s + v, 0);
  const secondHalf = usage.slice(mid).reduce((s, v) => s + v, 0);

  let trend = "stable";
  if (secondHalf > firstHalf * 1.2) trend = "increasing";
  else if (secondHalf < firstHalf * 0.8) trend = "decreasing";

  // probability
  let probability = 0;
  if (daysLeft <= 1) probability = 95;
  else if (daysLeft <= 3) probability = 80;
  else if (daysLeft <= 7) probability = 50;
  else probability = 10;

  return {
    itemName: item.name,

    prediction: {
      daysLeft: Math.ceil(daysLeft),
      reorderInDays: Math.max(0, Math.ceil(daysLeft - 2)),
      probability,
    },

    consumption: {
      dailyAvg: Number(avgUsage.toFixed(2)),
      trend,
    },

    sustainability: {
      wasteRisk:
        daysLeft > 15 ? "HIGH" :
        daysLeft > 7 ? "MEDIUM" :
        "LOW",
      ecoScore: Math.max(50, 100 - daysLeft * 2),
    },

    suggestions: [
      daysLeft <= 2
        ? "Reorder immediately to avoid stockout"
        : trend === "increasing"
        ? "Demand rising, consider increasing stock"
        : "Stock level is stable",
    ],

    wasteReduced: Math.max(0, 100 - probability),

    error: "AI failed → fallback used",
  };
};

export const generateAIInsights = async (items) => {
  try{
  const prompt = `
You are an intelligent inventory analyst.

Items:
${items.map(i => `
Item: ${i.name}
Current Stock: ${i.quantity}
Usage History (last 30 days): ${i.usage.join(", ")}
`).join("\n")}

Tasks for each item:
1. Predict how many days stock will last
2. Suggest when to reorder
3. Give probability (0-100%) of stockout soon
4. Analyze consumption trend
5. Assess waste risk
6. Provide 2 short actionable suggestions

7. VERY IMPORTANT:
Calculate wasteReduced (%) using this STRICT LOGIC:

- If daysLeft > 20 → wasteReduced = 80-95 (high waste reduction potential)
- If daysLeft between 10-20 → wasteReduced = 50-80
- If daysLeft between 3-10 → wasteReduced = 20-50
- If daysLeft <= 2 → wasteReduced = 0-20

Also:
- Higher daysLeft = higher waste risk
- Increasing trend = reduce wasteReduced slightly

IMPORTANT:
- DO NOT give random numbers
- FOLLOW the logic strictly
- Return ONLY JSON array

Format:
[
  {
    "itemName": "Milk",
    "prediction": {
      "daysLeft": number,
      "reorderInDays": number,
      "probability": number
    },
    "consumption": {
      "dailyAvg": number,
      "trend": "increasing | decreasing | stable"
    },
    "sustainability": {
      "wasteRisk": "LOW | MEDIUM | HIGH",
      "ecoScore": number
    },
    "suggestions": [string],
    "wasteReduced": number
  }
]
`;
    const result = await model.generateContent(prompt);
    const text = result.response.text?.() || "";

    const cleaned = cleanJSON(text); // ADD THIS

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      throw new Error("Invalid JSON parse");
    }

    // safety check (VERY IMPORTANT)
    if (!Array.isArray(parsed)) {
      throw new Error("AI did not return array");
    }

    return parsed;

  } catch (err) {
    console.error("AI Insights Error:", err.message);

    // fallback
    return items.map(item => fallbackInsights(item));
  }
};

export const evaluateCritical = (item) => {
  const logs = item.usageHistory;

  if (!logs.length) return null;

  const now = new Date();

  const FIVE_HOURS = 5 * 60 * 60 * 1000;
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

  // 🔥 Recent: last 5 hours
  const recentLogs = logs.filter(l =>
    (now - new Date(l.date)) <= FIVE_HOURS
  );

  // 🔥 Older: between 5h and 24h
  const olderLogs = logs.filter(l => {
    const diff = now - new Date(l.date);
    return diff > FIVE_HOURS && diff <= TWENTY_FOUR_HOURS;
  });

  if (!recentLogs.length) return null;

  const recentUsage = recentLogs.reduce((s, l) => s + l.amount, 0);
  const avgRecent = recentUsage / 5; // per hour

  const olderUsage = olderLogs.reduce((s, l) => s + l.amount, 0);
  const avgOld = olderLogs.length
    ? olderUsage / 24
    : avgRecent;

  // 📊 spike detection
  let spike = "NORMAL";

  if (avgRecent > avgOld * 2) spike = "HIGH";
  else if (avgRecent > avgOld * 1.3) spike = "MEDIUM";

  // 📉 days left
  const daysLeft = item.quantity / (avgRecent || 1);

  // 🚨 generate alert
  if (daysLeft <= 1) {
    return {
      message: `🚨 ${item.name} will run out today`,
      severity: "CRITICAL",
      suggestedQty: Math.ceil(avgRecent * 3),
    };
  }

  if (item.quantity <= item.threshold) {
    return {
      message: `⚠️ ${item.name} is below threshold`,
      severity: "HIGH",
      suggestedQty: Math.max(
        Math.ceil(avgRecent * 2 - item.quantity),
        0
      ),
    };
  }

  if (spike === "HIGH") {
    return {
      message: `🔥 Sudden surge in ${item.name}, reorder immediately`,
      severity: "HIGH",
      suggestedQty: Math.ceil(avgRecent * 3),
    };
  }

  if (spike === "MEDIUM") {
    return {
      message: `⚠️ Usage increasing for ${item.name}`,
      severity: "MEDIUM",
      suggestedQty: Math.ceil(avgRecent * 2),
    };
  }

  return null;
};
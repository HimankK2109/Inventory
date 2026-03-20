# 🌱 Green-Tech Inventory Assistant

An AI-powered inventory management system designed to help small businesses, cafes, and organizations reduce waste and optimize stock levels using intelligent insights.

---

## 🚀 Overview

Managing inventory manually often leads to overstocking, stockouts, and unnecessary waste.  
This project solves that problem by using AI to analyze usage patterns and provide predictive insights.

---

## 🎯 Problem Statement

Small businesses and organizations struggle with:
- Manual inventory tracking
- Overstocking and waste
- Lack of predictive insights
- Expensive enterprise tools

---

## 💡 Solution

This system provides:
- 📊 Real-time inventory tracking  
- 🤖 AI-powered usage predictions  
- ⚡ Smart reorder suggestions  
- 🌱 Sustainability insights (waste reduction)

---

## 🧠 Key Features

- Predict how long stock will last  
- Suggest reorder timing  
- Detect consumption trends  
- Waste risk analysis  
- Sustainability scoring  
- AI fallback logic (if AI fails)  
- Caching system (4-hour refresh)  
- Urgent refresh limit system  

---

## 🏗️ Tech Stack

| Layer       | Technology |
|------------|-----------|
| Frontend   | React, Tailwind CSS |
| Backend    | Node.js, Express |
| Database   | MongoDB |
| AI         | Google Gemini API |
| HTTP       | Axios |

---

## ⚙️ System Architecture

Client (React UI) → Backend (Express API) → MongoDB  
                                 ↓  
                             Gemini AI  

---

## 📦 API Endpoints

- `GET /api/items` → Fetch inventory  
- `POST /api/orders` → Add order  
- `GET /api/ai/insights` → Get AI insights  
- `GET /api/ai/insights?force=true` → Force refresh  

---

## 🤖 AI Logic

Input:
- Current stock  
- Usage history  

Output:
- Days left  
- Reorder time  
- Stockout probability  
- Consumption trend  
- Waste risk  
- Sustainability score  

Includes fallback logic if AI fails.

---

## 📊 Sample Dataset

Located in:
data/sampleData.json

## 🧪 How to Run

### Backend

cd server
npm install
npm run dev


### Frontend

cd client
npm install
npm run dev


---

## 🎥 Demo Video

👉 Add your video link here:

https://your-video-link


---

## 🌱 Sustainability Impact

- Reduces overstocking  
- Minimizes expired inventory  
- Encourages efficient resource usage  

---

## ⚠️ Challenges & Solutions

| Challenge | Solution |
|----------|---------|
| AI inconsistent output | Added fallback logic |
| Unrealistic predictions | Daily aggregation |
| Duplicate DB entries | Used unique key |
| High API usage | Implemented caching |

---

## 🚀 Future Improvements

- Image-based inventory detection  
- Real-time alerts  
- Carbon footprint tracking  
- Supplier recommendations  

---

## 📌 Conclusion

This project demonstrates how AI can be used to build a simple, scalable, and sustainable inventory management system that reduces waste and improves efficiency.

---

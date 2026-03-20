import express from "express";
import { getInventory, addInventory } from "./controllers/inventoryController.js"
import { getOrders, addOrder } from "./controllers/orderController.js"
import { getAllInsights } from "./controllers/insightController.js"
import { getDashboardData } from "./controllers/dashboardController.js";

const router = express.Router();

router.get("/listInventory", getInventory);
router.post("/addInventory", addInventory);
router.get("/listOrders", getOrders);
router.post("/addOrder", addOrder);
router.get("/ai/insights", getAllInsights);
router.get("/dashboard", getDashboardData);

export default router;
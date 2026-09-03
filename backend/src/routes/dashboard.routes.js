import express from "express";

import { getEmployeeDashboard } from "../controllers/dashboard.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/employee", protect, getEmployeeDashboard);

export default router;
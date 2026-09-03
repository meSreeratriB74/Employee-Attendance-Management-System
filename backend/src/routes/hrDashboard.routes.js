import express from "express";

import { getHRDashboard } from "../controllers/hrDashboard.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/", protect, authorize("hr"), getHRDashboard);

export default router;
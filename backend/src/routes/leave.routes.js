import express from "express";

import {
    applyLeave,
    getLeaveHistory,
    cancelLeave,
    getAllLeaves,
    approveLeave,
    rejectLeave,
    getLeaveDashboard,
    getMyLeaveSummary
} from "../controllers/leave.controller.js";

import {
    protect,
    activeEmployee
} from "../middleware/auth.middleware.js";

import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/", protect, activeEmployee, applyLeave);

router.get("/", protect, activeEmployee, getLeaveHistory);

router.patch("/:id/cancel", protect, activeEmployee, cancelLeave);

router.get("/all", protect, authorize("hr"), getAllLeaves);

router.patch("/:id/approve", protect, authorize("hr"), approveLeave);

router.patch("/:id/reject", protect, authorize("hr"), rejectLeave);

router.get("/dashboard", protect, authorize("hr"), getLeaveDashboard);

router.get("/summary", protect, activeEmployee, getMyLeaveSummary);

export default router;
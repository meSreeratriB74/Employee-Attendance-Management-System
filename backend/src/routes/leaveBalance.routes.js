import express from "express";

import {
    getMyLeaveBalance,
    getEmployeeLeaveBalance,
    updateEmployeeLeaveBalance
} from "../controllers/leaveBalance.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/my", protect, getMyLeaveBalance);

router.get(
    "/employee/:id",
    protect,
    authorize("hr"),
    getEmployeeLeaveBalance
);
router.patch(
    "/employee/:id",
    protect,
    authorize("hr"),
    updateEmployeeLeaveBalance
);

export default router;
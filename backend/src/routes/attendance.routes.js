import express from "express";

import {
    checkIn,
    checkOut,
    getTodayAttendance,
    getAttendanceHistory,
    getAllAttendance,
    updateAttendance,
    getAttendanceSummary,
    getMyAttendanceSummary,
    getEmployeeAttendanceReport,
    processDailyAttendance,
    getAttendanceReport
} from "../controllers/attendance.controller.js";

import {
    protect,
    activeEmployee
} from "../middleware/auth.middleware.js";

import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.post(
    "/check-in",
    protect,
    activeEmployee,
    checkIn
);

router.post(
    "/check-out",
    protect,
    activeEmployee,
    checkOut
);

router.get(
    "/today",
    protect,
    activeEmployee,
    getTodayAttendance
);

router.get(
    "/history",
    protect,
    activeEmployee,
    getAttendanceHistory
);

router.get(
    "/my-summary",
    protect,
    activeEmployee,
    getMyAttendanceSummary
);

router.get(
    "/all",
    protect,
    authorize("hr"),
    getAllAttendance
);

router.get(
    "/summary",
    protect,
    authorize("hr"),
    getAttendanceSummary
);

router.get(
    "/report",
    protect,
    authorize("hr"),
    getAttendanceReport
);

router.get(
    "/employee/:id/report",
    protect,
    authorize("hr"),
    getEmployeeAttendanceReport
);

router.post(
    "/process-daily",
    protect,
    authorize("hr"),
    processDailyAttendance
);

router.patch(
    "/:id",
    protect,
    authorize("hr"),
    updateAttendance
);

export default router;
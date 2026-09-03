import express from "express";

import {
    createPayroll,
    getMyPayroll,
    getAllPayroll,
    updatePayroll,
    processPayroll,
    markPayrollPaid,
    getPayrollSummary,
    getPayrollById,
    deletePayroll,
    getSalarySlip,
    getEmployeePayroll,
    getMonthlyPayrollReport,
    getEmployeePayrollSummary
} from "../controllers/payroll.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/", protect, authorize("hr"), createPayroll);
router.get("/my", protect, getMyPayroll);
router.get("/all", protect, authorize("hr"), getAllPayroll);
router.patch("/:id", protect, authorize("hr"), updatePayroll);
router.patch("/:id/process", protect, authorize("hr"), processPayroll);
router.patch("/:id/pay", protect, authorize("hr"), markPayrollPaid);
router.get("/summary", protect, authorize("hr"), getPayrollSummary);
router.get(
    "/employee/:id",
    protect,
    authorize("hr"),
    getEmployeePayroll
);
router.get(
    "/monthly-report",
    protect,
    authorize("hr"),
    getMonthlyPayrollReport
);
router.get(
    "/employee/:id/summary",
    protect,
    authorize("hr"),
    getEmployeePayrollSummary
);
router.get("/:id", protect, getPayrollById);
router.delete("/:id", protect, authorize("hr"), deletePayroll);
router.get("/:id/salary-slip", protect, getSalarySlip);
export default router;
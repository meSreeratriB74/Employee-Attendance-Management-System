import express from "express";

import {
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    updateEmployeeStatus
} from "../controllers/employee.controller.js";

import { protect } from "../middleware/auth.middleware.js";

import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/", protect, authorize("hr"), getAllEmployees);
router.get("/:id", protect, authorize("hr"), getEmployeeById);
router.patch("/:id", protect, authorize("hr"), updateEmployee);
router.patch("/:id/status", protect, authorize("hr"), updateEmployeeStatus);

export default router;
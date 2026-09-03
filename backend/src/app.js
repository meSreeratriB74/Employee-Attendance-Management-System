import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import leaveRoutes from "./routes/leave.routes.js";
import leaveBalanceRoutes from "./routes/leaveBalance.routes.js";
import employeeRoutes from "./routes/employee.routes.js";
import hrDashboardRoutes from "./routes/hrDashboard.routes.js";
import payrollRoutes from "./routes/payroll.routes.js";

import {
    notFound,
    errorHandler
} from "./middleware/error.middleware.js";

const app = express();

app.use(helmet());

app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true
    })
);

app.use(express.json({ limit: "10kb" }));

app.use(
    express.urlencoded({
        extended: true,
        limit: "10kb"
    })
);

app.use(cookieParser());

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Please try again later."
    }
});

app.use("/api", apiLimiter);

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Employee Attendance Management System API is running",
        timestamp: new Date().toISOString()
    });
});

app.use("/api/auth", authRoutes);

app.use("/api/attendance", attendanceRoutes);

app.use("/api/leave", leaveRoutes);

app.use("/api/leave-balance", leaveBalanceRoutes);

app.use("/api/employees", employeeRoutes);

app.use("/api/hr-dashboard", hrDashboardRoutes);

app.use("/api/payroll", payrollRoutes);

app.use(notFound);

app.use(errorHandler);

export default app;
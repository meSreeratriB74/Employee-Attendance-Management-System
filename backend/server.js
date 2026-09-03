import dotenv from "dotenv";
import app from "./src/app.js";
import connectDatabase from "./src/config/database.js";
import dashboardRoutes from "./src/routes/dashboard.routes.js";
import hrDashboardRoutes from "./src/routes/hrDashboard.routes.js";
import employeeRoutes from "./src/routes/employee.routes.js";
import payrollRoutes from "./src/routes/payroll.routes.js";
import leaveBalanceRoutes from "./src/routes/leaveBalance.routes.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDatabase();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/hr-dashboard", hrDashboardRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/leave-balance", leaveBalanceRoutes);

startServer();
import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import Leave from "../models/Leave.js";
import Payroll from "../models/Payroll.js";

export const getHRDashboard = async (req, res, next) => {
    try {
        const totalEmployees = await User.countDocuments({
            role: "employee"
        });

        const activeEmployees = await User.countDocuments({
            role: "employee",
            status: "active"
        });

        const inactiveEmployees = await User.countDocuments({
            role: "employee",
            status: "inactive"
        });

        const totalAttendance = await Attendance.countDocuments();

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const presentToday = await Attendance.countDocuments({
            status: "present",
            date: {
                $gte: todayStart,
                $lte: todayEnd
            }
        });

        const pendingLeaves = await Leave.countDocuments({
            status: "pending"
        });

        const approvedLeaves = await Leave.countDocuments({
            status: "approved"
        });

        const rejectedLeaves = await Leave.countDocuments({
            status: "rejected"
        });

        const pendingPayrolls = await Payroll.countDocuments({
            status: "pending"
        });

        const processedPayrolls = await Payroll.countDocuments({
            status: "processed"
        });

        const paidPayrolls = await Payroll.countDocuments({
            status: "paid"
        });

        const payrollRecords = await Payroll.find().select(
            "netSalary"
        );

        const totalPayrollAmount = payrollRecords.reduce(
            (sum, payroll) => sum + payroll.netSalary,
            0
        );

        res.status(200).json({
            success: true,
            data: {
                employees: {
                    total: totalEmployees,
                    active: activeEmployees,
                    inactive: inactiveEmployees
                },
                attendance: {
                    total: totalAttendance,
                    presentToday
                },
                leaves: {
                    pending: pendingLeaves,
                    approved: approvedLeaves,
                    rejected: rejectedLeaves
                },
                payroll: {
                    pending: pendingPayrolls,
                    processed: processedPayrolls,
                    paid: paidPayrolls,
                    totalAmount: totalPayrollAmount
                }
            }
        });
    } catch (error) {
        next(error);
    }
};
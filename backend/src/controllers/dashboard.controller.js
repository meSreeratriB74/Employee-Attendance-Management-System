import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import Leave from "../models/Leave.js";

export const getEmployeeDashboard = async (req, res, next) => {
    try {
        const employeeId = req.user._id;

        const user = await User.findById(employeeId).select(
            "employeeId name email department designation joiningDate salary status"
        );

        const attendance = await Attendance.countDocuments({
            employee: employeeId
        });

        const present = await Attendance.countDocuments({
            employee: employeeId,
            status: "present"
        });

        const absent = await Attendance.countDocuments({
            employee: employeeId,
            status: "absent"
        });

        const leaves = await Leave.countDocuments({
            employee: employeeId
        });

        const approvedLeaves = await Leave.countDocuments({
            employee: employeeId,
            status: "approved"
        });

        const pendingLeaves = await Leave.countDocuments({
            employee: employeeId,
            status: "pending"
        });

        res.status(200).json({
            success: true,
            data: {
                employee: user,
                attendance: {
                    total: attendance,
                    present,
                    absent
                },
                leaves: {
                    total: leaves,
                    approved: approvedLeaves,
                    pending: pendingLeaves
                }
            }
        });
    } catch (error) {
        next(error);
    }
};
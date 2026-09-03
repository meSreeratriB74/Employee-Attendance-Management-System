
import mongoose from "mongoose";
import Leave from "../models/Leave.js";
import LeaveBalance from "../models/LeaveBalance.js";

const getLeaveDaysByYear = (startDate, endDate) => {
    const daysByYear = {};

    const current = new Date(startDate);
    current.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    while (current <= end) {
        const year = current.getFullYear();

        if (!daysByYear[year]) {
            daysByYear[year] = 0;
        }

        daysByYear[year]++;

        current.setDate(current.getDate() + 1);
    }

    return daysByYear;
};

const getOrCreateLeaveBalance = async (employeeId, year) => {
    let balance = await LeaveBalance.findOne({
        employee: employeeId,
        year
    });

    if (!balance) {
        balance = await LeaveBalance.create({
            employee: employeeId,
            year
        });
    }

    return balance;
};

export const applyLeave = async (req, res, next) => {
    try {
        const employeeId = req.user._id;
        const { leaveType, startDate, endDate, reason } = req.body;

        if (
            !["casual", "sick", "earned", "unpaid"].includes(leaveType)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid leave type"
            });
        }

        if (!reason || reason.trim().length < 5) {
            return res.status(400).json({
                success: false,
                message: "Leave reason must be at least 5 characters"
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid leave dates"
            });
        }

        if (start > end) {
            return res.status(400).json({
                success: false,
                message: "Start date cannot be greater than end date"
            });
        }

        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        const totalDays =
            Math.floor(
                (end.getTime() - start.getTime()) /
                    (1000 * 60 * 60 * 24)
            ) + 1;

        const overlappingLeave = await Leave.findOne({
            employee: employeeId,
            status: { $in: ["pending", "approved"] },
            startDate: { $lte: end },
            endDate: { $gte: start }
        });

        if (overlappingLeave) {
            return res.status(409).json({
                success: false,
                message: "You already have a leave application for these dates"
            });
        }

        if (leaveType !== "unpaid") {
            const daysByYear = getLeaveDaysByYear(start, end);

            for (const [year, days] of Object.entries(daysByYear)) {
                const balance = await getOrCreateLeaveBalance(
                    employeeId,
                    Number(year)
                );

                if (balance[leaveType] < days) {
                    return res.status(400).json({
                        success: false,
                        message: `Insufficient ${leaveType} leave balance for ${year}`
                    });
                }
            }
        }

        const leave = await Leave.create({
            employee: employeeId,
            leaveType,
            startDate: start,
            endDate: end,
            totalDays,
            reason: reason.trim()
        });

        res.status(201).json({
            success: true,
            message: "Leave application submitted successfully",
            data: {
                leave
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getLeaveHistory = async (req, res, next) => {
    try {
        const leaves = await Leave.find({
            employee: req.user._id
        }).sort({
            startDate: -1
        });

        res.status(200).json({
            success: true,
            data: {
                leaves
            }
        });
    } catch (error) {
        next(error);
    }
};

export const cancelLeave = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid leave ID"
            });
        }

        const leave = await Leave.findOne({
            _id: req.params.id,
            employee: req.user._id
        });

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: "Leave application not found"
            });
        }

        if (!["pending", "approved"].includes(leave.status)) {
            return res.status(400).json({
                success: false,
                message: "Only pending or approved leaves can be cancelled"
            });
        }

        if (
            leave.status === "approved" &&
            leave.leaveType !== "unpaid"
        ) {
            const daysByYear = getLeaveDaysByYear(
                leave.startDate,
                leave.endDate
            );

            for (const [year, days] of Object.entries(daysByYear)) {
                const balance = await LeaveBalance.findOne({
                    employee: leave.employee,
                    year: Number(year)
                });

                if (balance) {
                    balance[leave.leaveType] += days;
                    await balance.save();
                }
            }
        }

        leave.status = "cancelled";

        await leave.save();

        res.status(200).json({
            success: true,
            message: "Leave application cancelled successfully",
            data: {
                leave
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getAllLeaves = async (req, res, next) => {
    try {
        const leaves = await Leave.find()
            .populate(
                "employee",
                "employeeId name email department designation"
            )
            .sort({
                startDate: -1
            });

        res.status(200).json({
            success: true,
            data: {
                leaves
            }
        });
    } catch (error) {
        next(error);
    }
};

export const approveLeave = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid leave ID"
            });
        }

        const leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: "Leave application not found"
            });
        }

        if (leave.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Only pending leaves can be approved"
            });
        }

        if (leave.leaveType !== "unpaid") {
            const daysByYear = getLeaveDaysByYear(
                leave.startDate,
                leave.endDate
            );

            const balances = [];

            for (const [year, days] of Object.entries(daysByYear)) {
                const balance = await LeaveBalance.findOne({
                    employee: leave.employee,
                    year: Number(year)
                });

                if (
                    !balance ||
                    balance[leave.leaveType] < days
                ) {
                    return res.status(400).json({
                        success: false,
                        message: `Insufficient ${leave.leaveType} leave balance for ${year}`
                    });
                }

                balances.push({
                    balance,
                    days
                });
            }

            for (const item of balances) {
                item.balance[leave.leaveType] -= item.days;
                await item.balance.save();
            }
        }

        leave.status = "approved";
        leave.approvedBy = req.user._id;
        leave.approvedAt = new Date();

        await leave.save();

        res.status(200).json({
            success: true,
            message: "Leave approved successfully",
            data: {
                leave
            }
        });
    } catch (error) {
        next(error);
    }
};

export const rejectLeave = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid leave ID"
            });
        }

        const leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: "Leave application not found"
            });
        }

        if (leave.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Only pending leaves can be rejected"
            });
        }

        const { rejectionReason } = req.body;

        if (
            !rejectionReason ||
            rejectionReason.trim().length < 5
        ) {
            return res.status(400).json({
                success: false,
                message: "Rejection reason must be at least 5 characters"
            });
        }

        leave.status = "rejected";
        leave.rejectionReason = rejectionReason.trim();

        await leave.save();

        res.status(200).json({
            success: true,
            message: "Leave rejected successfully",
            data: {
                leave
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getLeaveDashboard = async (req, res, next) => {
    try {
        const total = await Leave.countDocuments();

        const pending = await Leave.countDocuments({
            status: "pending"
        });

        const approved = await Leave.countDocuments({
            status: "approved"
        });

        const rejected = await Leave.countDocuments({
            status: "rejected"
        });

        const cancelled = await Leave.countDocuments({
            status: "cancelled"
        });

        res.status(200).json({
            success: true,
            data: {
                total,
                pending,
                approved,
                rejected,
                cancelled
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getMyLeaveSummary = async (req, res, next) => {
    try {
        const employeeId = req.user._id;

        const total = await Leave.countDocuments({
            employee: employeeId
        });

        const pending = await Leave.countDocuments({
            employee: employeeId,
            status: "pending"
        });

        const approved = await Leave.countDocuments({
            employee: employeeId,
            status: "approved"
        });

        const rejected = await Leave.countDocuments({
            employee: employeeId,
            status: "rejected"
        });

        const cancelled = await Leave.countDocuments({
            employee: employeeId,
            status: "cancelled"
        });

        const approvedLeaves = await Leave.find({
            employee: employeeId,
            status: "approved"
        }).select("totalDays");

        const totalApprovedDays = approvedLeaves.reduce(
            (total, leave) => total + leave.totalDays,
            0
        );

        res.status(200).json({
            success: true,
            data: {
                total,
                pending,
                approved,
                rejected,
                cancelled,
                totalApprovedDays
            }
        });
    } catch (error) {
        next(error);
    }
};


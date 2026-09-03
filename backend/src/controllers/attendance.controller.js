import mongoose from "mongoose";
import Attendance from "../models/Attendance.js";
import User from "../models/User.js";
import Leave from "../models/Leave.js";

const getStartOfDay = (date = new Date()) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start;
};

const getEndOfDay = (date = new Date()) => {
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return end;
};

export const checkIn = async (req, res, next) => {
    try {
        const employeeId = req.user._id;
        const today = new Date();

        const existingAttendance = await Attendance.findOne({
            employee: employeeId,
            date: {
                $gte: getStartOfDay(today),
                $lte: getEndOfDay(today)
            }
        });

        if (existingAttendance?.checkIn) {
            return res.status(409).json({
                success: false,
                message: "You have already checked in today"
            });
        }

        const attendance = existingAttendance
            ? existingAttendance
            : new Attendance({
                  employee: employeeId,
                  date: getStartOfDay(today)
              });

        attendance.checkIn = new Date();
        attendance.status = "working";

        await attendance.save();

        res.status(200).json({
            success: true,
            message: "Check-in successful",
            data: {
                attendance
            }
        });
    } catch (error) {
        next(error);
    }
};

export const checkOut = async (req, res, next) => {
    try {
        const employeeId = req.user._id;
        const today = new Date();

        const attendance = await Attendance.findOne({
            employee: employeeId,
            date: {
                $gte: getStartOfDay(today),
                $lte: getEndOfDay(today)
            }
        });

        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: "Please check in before checking out"
            });
        }

        if (!attendance.checkIn) {
            return res.status(400).json({
                success: false,
                message: "Check-in record not found"
            });
        }

        if (attendance.checkOut) {
            return res.status(409).json({
                success: false,
                message: "You have already checked out today"
            });
        }

        const checkOutTime = new Date();

        const workingMilliseconds =
            checkOutTime.getTime() -
            attendance.checkIn.getTime();

        const workingMinutes = Math.max(
            0,
            Math.floor(workingMilliseconds / 60000)
        );

        attendance.checkOut = checkOutTime;
        attendance.workingMinutes = workingMinutes;
        attendance.status = "present";

        await attendance.save();

        res.status(200).json({
            success: true,
            message: "Check-out successful",
            data: {
                attendance
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getTodayAttendance = async (req, res, next) => {
    try {
        const today = new Date();

        const attendance = await Attendance.findOne({
            employee: req.user._id,
            date: {
                $gte: getStartOfDay(today),
                $lte: getEndOfDay(today)
            }
        });

        res.status(200).json({
            success: true,
            data: {
                attendance
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getAttendanceHistory = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;

        if (startDate && isNaN(new Date(startDate).getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid startDate"
            });
        }

        if (endDate && isNaN(new Date(endDate).getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid endDate"
            });
        }

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);

            if (start > end) {
                return res.status(400).json({
                    success: false,
                    message: "startDate cannot be greater than endDate"
                });
            }
        }

        const filter = {
            employee: req.user._id
        };

        if (startDate || endDate) {
            filter.date = {};

            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                filter.date.$gte = start;
            }

            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                filter.date.$lte = end;
            }
        }

        const attendance = await Attendance.find(filter).sort({
            date: -1
        });

        res.status(200).json({
            success: true,
            data: {
                attendance
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getAllAttendance = async (req, res, next) => {
    try {
        const { startDate, endDate, employeeId } = req.query;

        const filter = {};

        if (employeeId) {
            filter.employee = employeeId;
        }

        if (startDate || endDate) {
            filter.date = {};

            if (startDate) {
                const start = new Date(startDate);

                if (isNaN(start.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid startDate"
                    });
                }

                start.setHours(0, 0, 0, 0);
                filter.date.$gte = start;
            }

            if (endDate) {
                const end = new Date(endDate);

                if (isNaN(end.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid endDate"
                    });
                }

                end.setHours(23, 59, 59, 999);
                filter.date.$lte = end;
            }
        }

        const attendance = await Attendance.find(filter)
            .populate(
                "employee",
                "employeeId name email department designation"
            )
            .sort({
                date: -1
            });

        res.status(200).json({
            success: true,
            data: {
                attendance
            }
        });
    } catch (error) {
        next(error);
    }
};

export const updateAttendance = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid attendance ID"
            });
        }

        const { status, checkIn, checkOut, workingMinutes, remarks } =
            req.body;

        const attendance = await Attendance.findById(req.params.id);

        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: "Attendance record not found"
            });
        }

        if (status !== undefined) {
            const allowedStatuses = [
                "present",
                "late",
                "half_day",
                "absent",
                "leave",
                "working"
            ];

            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid attendance status"
                });
            }

            attendance.status = status;
        }

        if (checkIn !== undefined) {
    const parsedCheckIn = new Date(checkIn);

    if (isNaN(parsedCheckIn.getTime())) {
        return res.status(400).json({
            success: false,
            message: "Invalid check-in time"
        });
    }

    if (
        attendance.checkOut &&
        parsedCheckIn > attendance.checkOut
    ) {
        return res.status(400).json({
            success: false,
            message: "Check-in time cannot be later than check-out time"
        });
    }

    attendance.checkIn = parsedCheckIn;
}

        if (checkOut !== undefined) {
    const parsedCheckOut = new Date(checkOut);

    if (isNaN(parsedCheckOut.getTime())) {
        return res.status(400).json({
            success: false,
            message: "Invalid check-out time"
        });
    }

    attendance.checkOut = parsedCheckOut;
}

        if (workingMinutes !== undefined) {
            if (workingMinutes < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Working minutes cannot be negative"
                });
            }

            attendance.workingMinutes = workingMinutes;
        }

        if (remarks !== undefined) {
            attendance.remarks = remarks;
        }

        await attendance.save();

        res.status(200).json({
            success: true,
            message: "Attendance updated successfully",
            data: {
                attendance
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getAttendanceSummary = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;

        const filter = {};

        if (startDate || endDate) {
            filter.date = {};

            if (startDate) {
                const start = new Date(startDate);

                if (isNaN(start.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid startDate"
                    });
                }

                start.setHours(0, 0, 0, 0);
                filter.date.$gte = start;
            }

            if (endDate) {
                const end = new Date(endDate);

                if (isNaN(end.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid endDate"
                    });
                }

                end.setHours(23, 59, 59, 999);
                filter.date.$lte = end;
            }
        }

        const total = await Attendance.countDocuments(filter);

        const present = await Attendance.countDocuments({
            ...filter,
            status: "present"
        });

        const late = await Attendance.countDocuments({
            ...filter,
            status: "late"
        });

        const halfDay = await Attendance.countDocuments({
            ...filter,
            status: "half_day"
        });

        const absent = await Attendance.countDocuments({
            ...filter,
            status: "absent"
        });

        const leave = await Attendance.countDocuments({
            ...filter,
            status: "leave"
        });

        const working = await Attendance.countDocuments({
            ...filter,
            status: "working"
        });

        res.status(200).json({
            success: true,
            data: {
                total,
                present,
                late,
                halfDay,
                absent,
                leave,
                working
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getMyAttendanceSummary = async (req, res, next) => {
    try {
        const employeeId = req.user._id;

        const total = await Attendance.countDocuments({
            employee: employeeId
        });

        const present = await Attendance.countDocuments({
            employee: employeeId,
            status: "present"
        });

        const late = await Attendance.countDocuments({
            employee: employeeId,
            status: "late"
        });

        const halfDay = await Attendance.countDocuments({
            employee: employeeId,
            status: "half_day"
        });

        const absent = await Attendance.countDocuments({
            employee: employeeId,
            status: "absent"
        });

        const leave = await Attendance.countDocuments({
            employee: employeeId,
            status: "leave"
        });

        const working = await Attendance.countDocuments({
            employee: employeeId,
            status: "working"
        });

        const attendancePercentage =
            total > 0
                ? Number(((present / total) * 100).toFixed(2))
                : 0;

        res.status(200).json({
            success: true,
            data: {
                total,
                present,
                late,
                halfDay,
                absent,
                leave,
                working,
                attendancePercentage
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getEmployeeAttendanceReport = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid employee ID"
            });
        }

        const { startDate, endDate } = req.query;

        const employee = await User.findOne({
            _id: req.params.id,
            role: "employee"
        }).select(
            "employeeId name email department designation"
        );

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        const filter = {
            employee: employee._id
        };

        if (startDate || endDate) {
            filter.date = {};

            if (startDate) {
                const start = new Date(startDate);

                if (isNaN(start.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid startDate"
                    });
                }

                start.setHours(0, 0, 0, 0);
                filter.date.$gte = start;
            }

            if (endDate) {
                const end = new Date(endDate);

                if (isNaN(end.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid endDate"
                    });
                }

                end.setHours(23, 59, 59, 999);
                filter.date.$lte = end;
            }
        }

        const attendance = await Attendance.find(filter)
            .sort({
                date: -1
            });

        res.status(200).json({
            success: true,
            data: {
                employee,
                attendance
            }
        });
    } catch (error) {
        next(error);
    }
};

export const processDailyAttendance = async (req, res, next) => {
    try {
        const today = new Date();

        const startOfDay = getStartOfDay(today);
        const endOfDay = getEndOfDay(today);

        const employees = await User.find({
            role: "employee",
            status: "active"
        }).select("_id");

        let processed = 0;
        let markedAbsent = 0;
        let markedLeave = 0;

        for (const employee of employees) {
            const existingAttendance = await Attendance.findOne({
                employee: employee._id,
                date: {
                    $gte: startOfDay,
                    $lte: endOfDay
                }
            });

            if (existingAttendance) {
                processed++;
                continue;
            }

            const approvedLeave = await Leave.findOne({
                employee: employee._id,
                status: "approved",
                startDate: { $lte: endOfDay },
                endDate: { $gte: startOfDay }
            });

            if (approvedLeave) {
                await Attendance.create({
                    employee: employee._id,
                    date: startOfDay,
                    status: "leave",
                    remarks: "Automatically marked as leave"
                });

                markedLeave++;
            } else {
                await Attendance.create({
                    employee: employee._id,
                    date: startOfDay,
                    status: "absent",
                    remarks: "Automatically marked as absent"
                });

                markedAbsent++;
            }

            processed++;
        }

        res.status(200).json({
            success: true,
            message: "Daily attendance processed successfully",
            data: {
                totalEmployees: employees.length,
                processed,
                markedAbsent,
                markedLeave
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getAttendanceReport = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;

        const filter = {};

        if (startDate || endDate) {
            filter.date = {};

            if (startDate) {
                const start = new Date(startDate);

                if (isNaN(start.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid startDate"
                    });
                }

                start.setHours(0, 0, 0, 0);
                filter.date.$gte = start;
            }

            if (endDate) {
                const end = new Date(endDate);

                if (isNaN(end.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid endDate"
                    });
                }

                end.setHours(23, 59, 59, 999);
                filter.date.$lte = end;
            }
        }

        const attendance = await Attendance.find(filter)
            .populate(
                "employee",
                "employeeId name email department designation"
            )
            .sort({
                date: -1
            });

        const summary = {
            total: attendance.length,
            present: attendance.filter(
                item => item.status === "present"
            ).length,
            late: attendance.filter(
                item => item.status === "late"
            ).length,
            halfDay: attendance.filter(
                item => item.status === "half_day"
            ).length,
            absent: attendance.filter(
                item => item.status === "absent"
            ).length,
            leave: attendance.filter(
                item => item.status === "leave"
            ).length
        };

        res.status(200).json({
            success: true,
            data: {
                summary,
                attendance
            }
        });
    } catch (error) {
        next(error);
    }
};
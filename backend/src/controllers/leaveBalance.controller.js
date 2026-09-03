import mongoose from "mongoose";
import LeaveBalance from "../models/LeaveBalance.js";
import User from "../models/User.js";

export const getEmployeeLeaveBalance = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid employee ID"
            });
        }

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

        const year =
            req.query.year !== undefined
                ? Number(req.query.year)
                : new Date().getFullYear();

        if (
            !Number.isInteger(year) ||
            year < 2000
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid year"
            });
        }

        let balance = await LeaveBalance.findOne({
            employee: employee._id,
            year
        });

        if (!balance) {
            balance = await LeaveBalance.create({
                employee: employee._id,
                year
            });
        }

        res.status(200).json({
            success: true,
            data: {
                employee,
                balance
            }
        });
    } catch (error) {
        next(error);
    }
};

export const updateEmployeeLeaveBalance = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid employee ID"
            });
        }

        const {
            casual,
            sick,
            earned,
            unpaid
        } = req.body;

        const year =
            req.body.year !== undefined
                ? Number(req.body.year)
                : new Date().getFullYear();

        if (
            !Number.isInteger(year) ||
            year < 2000
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid year"
            });
        }

        const employee = await User.findOne({
            _id: req.params.id,
            role: "employee"
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        let balance = await LeaveBalance.findOne({
            employee: employee._id,
            year
        });

        if (!balance) {
            balance = new LeaveBalance({
                employee: employee._id,
                year
            });
        }

        const values = {
            casual,
            sick,
            earned,
            unpaid
        };

        for (const type of [
            "casual",
            "sick",
            "earned",
            "unpaid"
        ]) {
            if (values[type] !== undefined) {
                const value = Number(values[type]);

                if (
                    !Number.isFinite(value) ||
                    value < 0
                ) {
                    return res.status(400).json({
                        success: false,
                        message: `${type} leave balance must be a valid non-negative number`
                    });
                }

                balance[type] = value;
            }
        }

        await balance.save();

        res.status(200).json({
            success: true,
            message: "Leave balance updated successfully",
            data: {
                balance
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getMyLeaveBalance = async (req, res, next) => {
    try {
        const year =
            req.query.year !== undefined
                ? Number(req.query.year)
                : new Date().getFullYear();

        if (
            !Number.isInteger(year) ||
            year < 2000
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid year"
            });
        }

        let balance = await LeaveBalance.findOne({
            employee: req.user._id,
            year
        });

        if (!balance) {
            balance = await LeaveBalance.create({
                employee: req.user._id,
                year
            });
        }

        res.status(200).json({
            success: true,
            data: {
                balance
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getAllLeaveBalances = async (req, res, next) => {
    try {
        const year =
            req.query.year !== undefined
                ? Number(req.query.year)
                : new Date().getFullYear();

        if (
            !Number.isInteger(year) ||
            year < 2000
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid year"
            });
        }

        const balances = await LeaveBalance.find({
            year
        })
            .populate(
                "employee",
                "employeeId name email department designation"
            )
            .sort({
                "employee.name": 1
            });

        res.status(200).json({
            success: true,
            data: {
                year,
                balances
            }
        });
    } catch (error) {
        next(error);
    }
};

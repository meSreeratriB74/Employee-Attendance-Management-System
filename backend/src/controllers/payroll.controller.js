import mongoose from "mongoose";
import Payroll from "../models/Payroll.js";
import User from "../models/User.js";

export const createPayroll = async (req, res, next) => {
    try {
        const {
            employee,
            month,
            year,
            basicSalary,
            allowances = 0,
            deductions = 0,
            remarks
        } = req.body;

        if (!mongoose.Types.ObjectId.isValid(employee)) {
            return res.status(400).json({
                success: false,
                message: "Invalid employee ID"
            });
        }

        const employeeUser = await User.findOne({
            _id: employee,
            role: "employee"
        });

        if (!employeeUser) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        const parsedMonth = Number(month);
        const parsedYear = Number(year);
        const parsedBasicSalary = Number(basicSalary);
        const parsedAllowances = Number(allowances);
        const parsedDeductions = Number(deductions);

        if (
            !Number.isInteger(parsedMonth) ||
            parsedMonth < 1 ||
            parsedMonth > 12
        ) {
            return res.status(400).json({
                success: false,
                message: "Month must be between 1 and 12"
            });
        }

        if (
            !Number.isInteger(parsedYear) ||
            parsedYear < 2000
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid year"
            });
        }

        if (
            !Number.isFinite(parsedBasicSalary) ||
            parsedBasicSalary < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Basic salary must be a valid non-negative number"
            });
        }

        if (
            !Number.isFinite(parsedAllowances) ||
            parsedAllowances < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Allowances must be a valid non-negative number"
            });
        }

        if (
            !Number.isFinite(parsedDeductions) ||
            parsedDeductions < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Deductions must be a valid non-negative number"
            });
        }

        const netSalary =
            parsedBasicSalary +
            parsedAllowances -
            parsedDeductions;

        if (netSalary < 0) {
            return res.status(400).json({
                success: false,
                message: "Net salary cannot be negative"
            });
        }

        const existingPayroll = await Payroll.findOne({
            employee,
            month: parsedMonth,
            year: parsedYear
        });

        if (existingPayroll) {
            return res.status(409).json({
                success: false,
                message: "Payroll already exists for this employee and month"
            });
        }

        const payroll = await Payroll.create({
            employee,
            month: parsedMonth,
            year: parsedYear,
            basicSalary: parsedBasicSalary,
            allowances: parsedAllowances,
            deductions: parsedDeductions,
            netSalary,
            remarks
        });

        const populatedPayroll = await Payroll.findById(
            payroll._id
        ).populate(
            "employee",
            "employeeId name email department designation"
        );

        res.status(201).json({
            success: true,
            message: "Payroll created successfully",
            data: {
                payroll: populatedPayroll
            }
        });
    } catch (error) {
        next(error);
    }
};

export const updatePayroll = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payroll ID"
            });
        }

        const {
            basicSalary,
            allowances,
            deductions,
            remarks
        } = req.body;

        const payroll = await Payroll.findById(req.params.id);

        if (!payroll) {
            return res.status(404).json({
                success: false,
                message: "Payroll record not found"
            });
        }

        if (payroll.status === "paid") {
            return res.status(400).json({
                success: false,
                message: "Paid payroll cannot be modified"
            });
        }

        if (basicSalary !== undefined) {
            const value = Number(basicSalary);

            if (!Number.isFinite(value) || value < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Basic salary must be a valid non-negative number"
                });
            }

            payroll.basicSalary = value;
        }

        if (allowances !== undefined) {
            const value = Number(allowances);

            if (!Number.isFinite(value) || value < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Allowances must be a valid non-negative number"
                });
            }

            payroll.allowances = value;
        }

        if (deductions !== undefined) {
            const value = Number(deductions);

            if (!Number.isFinite(value) || value < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Deductions must be a valid non-negative number"
                });
            }

            payroll.deductions = value;
        }

        if (remarks !== undefined) {
            payroll.remarks = remarks;
        }

        payroll.netSalary =
            payroll.basicSalary +
            payroll.allowances -
            payroll.deductions;

        if (payroll.netSalary < 0) {
            return res.status(400).json({
                success: false,
                message: "Net salary cannot be negative"
            });
        }

        await payroll.save();

        res.status(200).json({
            success: true,
            message: "Payroll updated successfully",
            data: {
                payroll
            }
        });
    } catch (error) {
        next(error);
    }
};

export const processPayroll = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payroll ID"
            });
        }

        const payroll = await Payroll.findById(req.params.id);

        if (!payroll) {
            return res.status(404).json({
                success: false,
                message: "Payroll record not found"
            });
        }

        if (payroll.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Only pending payroll can be processed"
            });
        }

        payroll.status = "processed";
        payroll.processedAt = new Date();

        await payroll.save();

        res.status(200).json({
            success: true,
            message: "Payroll processed successfully",
            data: {
                payroll
            }
        });
    } catch (error) {
        next(error);
    }
};

export const markPayrollPaid = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payroll ID"
            });
        }

        const payroll = await Payroll.findById(req.params.id);

        if (!payroll) {
            return res.status(404).json({
                success: false,
                message: "Payroll record not found"
            });
        }

        if (payroll.status !== "processed") {
            return res.status(400).json({
                success: false,
                message: "Only processed payroll can be marked as paid"
            });
        }

        payroll.status = "paid";
        payroll.paidAt = new Date();

        await payroll.save();

        res.status(200).json({
            success: true,
            message: "Payroll marked as paid successfully",
            data: {
                payroll
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getPayrollSummary = async (req, res, next) => {
    try {
        const { month, year } = req.query;

        const filter = {};

        if (month !== undefined) {
            const parsedMonth = Number(month);

            if (
                !Number.isInteger(parsedMonth) ||
                parsedMonth < 1 ||
                parsedMonth > 12
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Month must be between 1 and 12"
                });
            }

            filter.month = parsedMonth;
        }

        if (year !== undefined) {
            const parsedYear = Number(year);

            if (
                !Number.isInteger(parsedYear) ||
                parsedYear < 2000
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid year"
                });
            }

            filter.year = parsedYear;
        }

        const total = await Payroll.countDocuments(filter);

        const pending = await Payroll.countDocuments({
            ...filter,
            status: "pending"
        });

        const processed = await Payroll.countDocuments({
            ...filter,
            status: "processed"
        });

        const paid = await Payroll.countDocuments({
            ...filter,
            status: "paid"
        });

        const payrollRecords = await Payroll.find(filter).select(
            "basicSalary allowances deductions netSalary"
        );

        const totalSalary = payrollRecords.reduce(
            (sum, payroll) => sum + payroll.netSalary,
            0
        );

        res.status(200).json({
            success: true,
            data: {
                total,
                pending,
                processed,
                paid,
                totalSalary
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getPayrollById = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payroll ID"
            });
        }

        const payroll = await Payroll.findById(req.params.id)
            .populate(
                "employee",
                "employeeId name email department designation"
            );

        if (!payroll) {
            return res.status(404).json({
                success: false,
                message: "Payroll record not found"
            });
        }

        if (
            req.user.role === "employee" &&
            payroll.employee._id.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to access this payroll"
            });
        }

        res.status(200).json({
            success: true,
            data: {
                payroll
            }
        });
    } catch (error) {
        next(error);
    }
};

export const deletePayroll = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payroll ID"
            });
        }

        const payroll = await Payroll.findById(req.params.id);

        if (!payroll) {
            return res.status(404).json({
                success: false,
                message: "Payroll record not found"
            });
        }

        if (payroll.status === "paid") {
            return res.status(400).json({
                success: false,
                message: "Paid payroll cannot be deleted"
            });
        }

        await payroll.deleteOne();

        res.status(200).json({
            success: true,
            message: "Payroll deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

export const getSalarySlip = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payroll ID"
            });
        }

        const payroll = await Payroll.findById(req.params.id)
            .populate(
                "employee",
                "employeeId name email department designation joiningDate"
            );

        if (!payroll) {
            return res.status(404).json({
                success: false,
                message: "Payroll record not found"
            });
        }

        if (
            req.user.role === "employee" &&
            payroll.employee._id.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to access this salary slip"
            });
        }

        res.status(200).json({
            success: true,
            data: {
                salarySlip: {
                    payrollId: payroll._id,
                    employee: payroll.employee,
                    month: payroll.month,
                    year: payroll.year,
                    basicSalary: payroll.basicSalary,
                    allowances: payroll.allowances,
                    deductions: payroll.deductions,
                    netSalary: payroll.netSalary,
                    status: payroll.status,
                    processedAt: payroll.processedAt,
                    paidAt: payroll.paidAt,
                    remarks: payroll.remarks
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getEmployeePayroll = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid employee ID"
            });
        }

        const {
            month,
            year,
            status
        } = req.query;

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

        if (month !== undefined) {
            const parsedMonth = Number(month);

            if (
                !Number.isInteger(parsedMonth) ||
                parsedMonth < 1 ||
                parsedMonth > 12
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Month must be between 1 and 12"
                });
            }

            filter.month = parsedMonth;
        }

        if (year !== undefined) {
            const parsedYear = Number(year);

            if (
                !Number.isInteger(parsedYear) ||
                parsedYear < 2000
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid year"
                });
            }

            filter.year = parsedYear;
        }

        if (status !== undefined) {
            if (
                !["pending", "processed", "paid"].includes(status)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid payroll status"
                });
            }

            filter.status = status;
        }

        const payroll = await Payroll.find(filter).sort({
            year: -1,
            month: -1
        });

        res.status(200).json({
            success: true,
            data: {
                employee,
                payroll
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getMonthlyPayrollReport = async (req, res, next) => {
    try {
        const { month, year } = req.query;

        if (month === undefined || year === undefined) {
            return res.status(400).json({
                success: false,
                message: "Month and year are required"
            });
        }

        const parsedMonth = Number(month);
        const parsedYear = Number(year);

        if (
            !Number.isInteger(parsedMonth) ||
            parsedMonth < 1 ||
            parsedMonth > 12
        ) {
            return res.status(400).json({
                success: false,
                message: "Month must be between 1 and 12"
            });
        }

        if (
            !Number.isInteger(parsedYear) ||
            parsedYear < 2000
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid year"
            });
        }

        const payroll = await Payroll.find({
            month: parsedMonth,
            year: parsedYear
        })
            .populate(
                "employee",
                "employeeId name email department designation"
            )
            .sort({
                "employee.name": 1
            });

        const totalBasicSalary = payroll.reduce(
            (sum, item) => sum + item.basicSalary,
            0
        );

        const totalAllowances = payroll.reduce(
            (sum, item) => sum + item.allowances,
            0
        );

        const totalDeductions = payroll.reduce(
            (sum, item) => sum + item.deductions,
            0
        );

        const totalNetSalary = payroll.reduce(
            (sum, item) => sum + item.netSalary,
            0
        );

        res.status(200).json({
            success: true,
            data: {
                month: parsedMonth,
                year: parsedYear,
                employeeCount: payroll.length,
                totals: {
                    basicSalary: totalBasicSalary,
                    allowances: totalAllowances,
                    deductions: totalDeductions,
                    netSalary: totalNetSalary
                },
                payroll
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getEmployeePayrollSummary = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid employee ID"
            });
        }

        const {
            startYear,
            endYear
        } = req.query;

        const employee = await User.findOne({
            _id: req.params.id,
            role: "employee"
        }).select(
            "employeeId name email department designation salary"
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

        if (
            startYear !== undefined ||
            endYear !== undefined
        ) {
            filter.year = {};

            if (startYear !== undefined) {
                const parsedStartYear = Number(startYear);

                if (
                    !Number.isInteger(parsedStartYear) ||
                    parsedStartYear < 2000
                ) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid start year"
                    });
                }

                filter.year.$gte = parsedStartYear;
            }

            if (endYear !== undefined) {
                const parsedEndYear = Number(endYear);

                if (
                    !Number.isInteger(parsedEndYear) ||
                    parsedEndYear < 2000
                ) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid end year"
                    });
                }

                filter.year.$lte = parsedEndYear;
            }

            if (
                startYear !== undefined &&
                endYear !== undefined &&
                filter.year.$gte > filter.year.$lte
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Start year cannot be greater than end year"
                });
            }
        }

        const payroll = await Payroll.find(filter);

        const totalPayrolls = payroll.length;

        const paidPayrolls = payroll.filter(
            item => item.status === "paid"
        ).length;

        const processedPayrolls = payroll.filter(
            item => item.status === "processed"
        ).length;

        const pendingPayrolls = payroll.filter(
            item => item.status === "pending"
        ).length;

        const totalBasicSalary = payroll.reduce(
            (sum, item) => sum + item.basicSalary,
            0
        );

        const totalAllowances = payroll.reduce(
            (sum, item) => sum + item.allowances,
            0
        );

        const totalDeductions = payroll.reduce(
            (sum, item) => sum + item.deductions,
            0
        );

        const totalNetSalary = payroll.reduce(
            (sum, item) => sum + item.netSalary,
            0
        );

        res.status(200).json({
            success: true,
            data: {
                employee,
                period: {
                    startYear: startYear || null,
                    endYear: endYear || null
                },
                summary: {
                    totalPayrolls,
                    paidPayrolls,
                    processedPayrolls,
                    pendingPayrolls,
                    totalBasicSalary,
                    totalAllowances,
                    totalDeductions,
                    totalNetSalary
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getAllPayroll = async (req, res, next) => {
    try {
        const {
            employeeId,
            employeeName,
            employeeCode,
            department,
            month,
            year,
            status,
            page = 1,
            limit = 10
        } = req.query;

        const filter = {};
        const employeeFilter = {};

        if (employeeId) {
            if (!mongoose.Types.ObjectId.isValid(employeeId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid employee ID"
                });
            }

            employeeFilter._id = employeeId;
        }

        if (employeeName) {
            employeeFilter.name = {
                $regex: employeeName,
                $options: "i"
            };
        }

        if (employeeCode) {
            employeeFilter.employeeId = {
                $regex: employeeCode,
                $options: "i"
            };
        }

        if (department) {
            employeeFilter.department = {
                $regex: department,
                $options: "i"
            };
        }

        if (Object.keys(employeeFilter).length > 0) {
            employeeFilter.role = "employee";

            const employees = await User.find(employeeFilter)
                .select("_id");

            if (employees.length === 0) {
                return res.status(200).json({
                    success: true,
                    data: {
                        payroll: [],
                        pagination: {
                            page: Number(page),
                            limit: Number(limit),
                            total: 0,
                            totalPages: 0
                        }
                    }
                });
            }

            filter.employee = {
                $in: employees.map(
                    employee => employee._id
                )
            };
        }

        if (month !== undefined) {
            const parsedMonth = Number(month);

            if (
                !Number.isInteger(parsedMonth) ||
                parsedMonth < 1 ||
                parsedMonth > 12
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Month must be between 1 and 12"
                });
            }

            filter.month = parsedMonth;
        }

        if (year !== undefined) {
            const parsedYear = Number(year);

            if (
                !Number.isInteger(parsedYear) ||
                parsedYear < 2000
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid year"
                });
            }

            filter.year = parsedYear;
        }

        if (status !== undefined) {
            if (
                !["pending", "processed", "paid"].includes(status)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid payroll status"
                });
            }

            filter.status = status;
        }

        const parsedPage = Number(page);
        const parsedLimit = Number(limit);

        if (
            !Number.isInteger(parsedPage) ||
            parsedPage < 1
        ) {
            return res.status(400).json({
                success: false,
                message: "Page must be a positive integer"
            });
        }

        if (
            !Number.isInteger(parsedLimit) ||
            parsedLimit < 1 ||
            parsedLimit > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "Limit must be between 1 and 100"
            });
        }

        const skip = (parsedPage - 1) * parsedLimit;

        const total = await Payroll.countDocuments(filter);

        const payroll = await Payroll.find(filter)
            .populate(
                "employee",
                "employeeId name email department designation"
            )
            .sort({
                year: -1,
                month: -1
            })
            .skip(skip)
            .limit(parsedLimit);

        const totalPages = Math.ceil(
            total / parsedLimit
        );

        res.status(200).json({
            success: true,
            data: {
                payroll,
                pagination: {
                    page: parsedPage,
                    limit: parsedLimit,
                    total,
                    totalPages
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getMyPayroll = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10
        } = req.query;

        const parsedPage = Number(page);
        const parsedLimit = Number(limit);

        if (
            !Number.isInteger(parsedPage) ||
            parsedPage < 1
        ) {
            return res.status(400).json({
                success: false,
                message: "Page must be a positive integer"
            });
        }

        if (
            !Number.isInteger(parsedLimit) ||
            parsedLimit < 1 ||
            parsedLimit > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "Limit must be between 1 and 100"
            });
        }

        const filter = {
            employee: req.user._id
        };

        const total = await Payroll.countDocuments(filter);

        const payroll = await Payroll.find(filter)
            .sort({
                year: -1,
                month: -1
            })
            .skip(
                (parsedPage - 1) * parsedLimit
            )
            .limit(parsedLimit);

        res.status(200).json({
            success: true,
            data: {
                payroll,
                pagination: {
                    page: parsedPage,
                    limit: parsedLimit,
                    total,
                    totalPages: Math.ceil(
                        total / parsedLimit
                    )
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

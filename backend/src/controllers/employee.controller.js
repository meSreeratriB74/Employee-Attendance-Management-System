import mongoose from "mongoose";
import User from "../models/User.js";

export const getAllEmployees = async (req, res, next) => {
    try {
        const employees = await User.find({
            role: "employee"
        }).select(
            "-password"
        ).sort({
            createdAt: -1
        });

        res.status(200).json({
            success: true,
            data: {
                employees
            }
        });
    } catch (error) {
        next(error);
    }
};
export const getEmployeeById = async (req, res, next) => {
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
        }).select("-password");

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        res.status(200).json({
            success: true,
            data: {
                employee
            }
        });
    } catch (error) {
        next(error);
    }
};
export const updateEmployee = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
        success: false,
        message: "Invalid employee ID"
    });
}
        const { name, department, designation, joiningDate, salary } = req.body;

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

        if (name !== undefined) employee.name = name;
        if (department !== undefined) employee.department = department;
        if (designation !== undefined) employee.designation = designation;
        if (joiningDate !== undefined) employee.joiningDate = joiningDate;
        if (salary !== undefined) employee.salary = salary;

        await employee.save();

        res.status(200).json({
            success: true,
            message: "Employee updated successfully",
            data: {
                employee
            }
        });
    } catch (error) {
        next(error);
    }
};
export const updateEmployeeStatus = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
        success: false,
        message: "Invalid employee ID"
    });
}
        const { status } = req.body;

        if (!["active", "inactive"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be active or inactive"
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

        employee.status = status;

        await employee.save();

        res.status(200).json({
            success: true,
            message: `Employee ${status === "active" ? "activated" : "deactivated"} successfully`,
            data: {
                employee
            }
        });
    } catch (error) {
        next(error);
    }
};
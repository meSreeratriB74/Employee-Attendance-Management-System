import { generateEmployeeId } from "../utils/employeeId.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (user) => {
    return jwt.sign(
        {
            userId: user._id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "1d"
        }
    );
};

export const register = async (req, res, next) => {
    try {
        const {
            name,
            email,
            password,
            department,
            designation,
            joiningDate,
            salary
        } = req.body;

        const existingUser = await User.findOne({
            email: email.toLowerCase()
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const employeeId = await generateEmployeeId();

        const user = await User.create({
    employeeId,
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: "employee",
    department,
    designation,
    joiningDate,
    salary
});

        const token = generateToken(user);

        res.status(201).json({
            success: true,
            message: "Employee registered successfully",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    department: user.department,
                    designation: user.designation
                },
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({
            email: email.toLowerCase()
        }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        if (user.status !== "active") {
            return res.status(403).json({
                success: false,
                message: "Your account is inactive"
            });
        }

        const passwordMatched = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatched) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = generateToken(user);

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user: {
                    id: user._id,
                    employeeId: user.employeeId,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    department: user.department,
                    designation: user.designation
                },
                token
            }
        });
    } catch (error) {
        next(error);
    }
};
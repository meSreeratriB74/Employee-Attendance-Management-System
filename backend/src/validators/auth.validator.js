import { body } from "express-validator";

export const registerValidation = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ min: 2, max: 100 })
        .withMessage("Name must be between 2 and 100 characters"),

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Please provide a valid email address")
        .normalizeEmail(),

    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 8 })
        .withMessage("Password must contain at least 8 characters"),

    body("department")
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage("Department cannot exceed 100 characters"),

    body("designation")
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage("Designation cannot exceed 100 characters"),

    body("joiningDate")
        .optional()
        .isISO8601()
        .withMessage("Joining date must be a valid date"),

    body("salary")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Salary must be a positive number")
];

export const loginValidation = [
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Please provide a valid email address")
        .normalizeEmail(),

    body("password")
        .notEmpty()
        .withMessage("Password is required")
];
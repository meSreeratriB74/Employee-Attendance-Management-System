import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    try {
        let token;

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer ")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User account no longer exists"
            });
        }

        if (user.status !== "active") {
            return res.status(403).json({
                success: false,
                message: "Your account is inactive"
            });
        }

        req.user = user;

        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token"
            });
        }

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Authentication token has expired"
            });
        }

        next(error);
    }
};
export const activeEmployee = (req, res, next) => {
    if (
        req.user.role === "employee" &&
        req.user.status !== "active"
    ) {
        return res.status(403).json({
            success: false,
            message: "Your account is inactive"
        });
    }

    next();
};
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./src/models/User.js";

dotenv.config();

const createHR = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const email = "hr@attendance.com";
        const password = "Hr@123456";

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            existingUser.role = "hr";
            existingUser.status = "active";
            existingUser.password = await bcrypt.hash(password, 12);
            await existingUser.save();

            console.log("Existing user converted to HR.");
        } else {
            const hashedPassword = await bcrypt.hash(password, 12);

            await User.create({
                employeeId: "HR-00001",
                name: "HR Manager",
                email,
                password: hashedPassword,
                role: "hr",
                department: "Human Resources",
                designation: "HR Manager",
                status: "active"
            });

            console.log("HR account created successfully.");
        }

        console.log("Email:", email);
        console.log("Password:", password);

        await mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
};

createHR();
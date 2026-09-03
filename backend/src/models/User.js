import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        employeeId: {
            type: String,
            unique: true,
            sparse: true,
            trim: true
        },

        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, "Name must contain at least 2 characters"],
            maxlength: [100, "Name cannot exceed 100 characters"]
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8, "Password must contain at least 8 characters"],
            select: false
        },

        role: {
            type: String,
            enum: ["employee", "hr"],
            default: "employee"
        },

        department: {
            type: String,
            trim: true,
            maxlength: [100, "Department cannot exceed 100 characters"]
        },

        designation: {
            type: String,
            trim: true,
            maxlength: [100, "Designation cannot exceed 100 characters"]
        },

        joiningDate: {
            type: Date
        },

        salary: {
            type: Number,
            min: [0, "Salary cannot be negative"]
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);

export default User;
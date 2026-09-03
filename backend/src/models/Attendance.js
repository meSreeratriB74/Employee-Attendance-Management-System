import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Employee is required"]
        },

        date: {
            type: Date,
            required: [true, "Attendance date is required"]
        },

        checkIn: {
            type: Date
        },

        checkOut: {
            type: Date
        },

        workingMinutes: {
            type: Number,
            default: 0,
            min: [0, "Working minutes cannot be negative"]
        },

        status: {
            type: String,
            enum: [
                "present",
                "late",
                "half_day",
                "absent",
                "leave",
                "working"
            ],
            default: "working"
        },

        remarks: {
            type: String,
            trim: true,
            maxlength: [500, "Remarks cannot exceed 500 characters"]
        }
    },
    {
        timestamps: true
    }
);

attendanceSchema.index(
    { employee: 1, date: 1 },
    { unique: true }
);

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
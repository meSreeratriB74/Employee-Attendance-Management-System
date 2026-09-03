import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Employee is required"]
        },

        leaveType: {
            type: String,
            enum: ["casual", "sick", "earned", "unpaid"],
            required: [true, "Leave type is required"]
        },

        startDate: {
            type: Date,
            required: [true, "Start date is required"]
        },

        endDate: {
            type: Date,
            required: [true, "End date is required"]
        },

        totalDays: {
            type: Number,
            required: [true, "Total leave days are required"],
            min: [1, "Leave must be at least one day"]
        },

        reason: {
            type: String,
            required: [true, "Leave reason is required"],
            trim: true,
            minlength: [5, "Reason must contain at least 5 characters"],
            maxlength: [500, "Reason cannot exceed 500 characters"]
        },

        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "cancelled"],
            default: "pending"
        },

        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        approvedAt: {
            type: Date
        },

        rejectionReason: {
            type: String,
            trim: true,
            maxlength: [500, "Rejection reason cannot exceed 500 characters"]
        }
    },
    {
        timestamps: true
    }
);

leaveSchema.index({ employee: 1, startDate: 1 });
leaveSchema.index({ status: 1 });

const Leave = mongoose.model("Leave", leaveSchema);

export default Leave;
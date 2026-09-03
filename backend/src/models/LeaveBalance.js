import mongoose from "mongoose";

const leaveBalanceSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        year: {
            type: Number,
            required: true
        },

        casual: {
            type: Number,
            default: 12,
            min: 0
        },

        sick: {
            type: Number,
            default: 10,
            min: 0
        },

        earned: {
            type: Number,
            default: 15,
            min: 0
        },

        unpaid: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    {
        timestamps: true
    }
);

leaveBalanceSchema.index(
    { employee: 1, year: 1 },
    { unique: true }
);

const LeaveBalance = mongoose.model(
    "LeaveBalance",
    leaveBalanceSchema
);

export default LeaveBalance;
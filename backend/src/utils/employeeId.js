import User from "../models/User.js";

export const generateEmployeeId = async () => {
    const employees = await User.find(
        {
            employeeId: {
                $exists: true,
                $ne: null
            }
        },
        {
            employeeId: 1
        }
    ).lean();

    let maxNumber = 0;

    for (const employee of employees) {
        const match = employee.employeeId.match(/^EMP-(\d+)$/);

        if (match) {
            const number = parseInt(match[1], 10);

            if (number > maxNumber) {
                maxNumber = number;
            }
        }
    }

    let nextNumber = maxNumber + 1;
    let employeeId = `EMP-${String(nextNumber).padStart(5, "0")}`;

    while (
        await User.exists({
            employeeId
        })
    ) {
        nextNumber++;

        employeeId = `EMP-${String(nextNumber).padStart(5, "0")}`;
    }

    return employeeId;
};
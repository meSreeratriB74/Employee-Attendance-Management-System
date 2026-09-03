import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./AttendanceHistory.css";

const AttendanceHistory = () => {
    const navigate = useNavigate();

    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadHistory = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/attendance/history");

            setAttendance(
                response.data.data.attendance || []
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load attendance history"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHistory();
    }, []);

    const formatDate = (date) => {
        if (!date) return "--";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const formatTime = (date) => {
        if (!date) return "--";

        return new Date(date).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const formatMinutes = (minutes) => {
        if (!minutes) return "0 min";

        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;

        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }

        return `${mins} min`;
    };

    const statusBadgeClass = (status) => {
        const key = (status || "").toLowerCase();

        if (key.includes("present")) {
            return "attendance-history-status--present";
        }

        if (key.includes("late")) {
            return "attendance-history-status--late";
        }

        if (key.includes("absent")) {
            return "attendance-history-status--absent";
        }

        if (key.includes("leave")) {
            return "attendance-history-status--leave";
        }

        return "attendance-history-status--leave";
    };

    return (
        <div className="attendance-history-page">
            <div className="attendance-history-container">

                <div className="attendance-history-header">

                    <div className="attendance-history-title">
                        <h1>Attendance history</h1>
                        <p>
                            View your complete attendance record
                        </p>
                    </div>

                    <button
                        type="button"
                        className="attendance-history-back"
                        onClick={() => navigate("/dashboard")}
                    >
                        Back to dashboard
                    </button>

                </div>

                {error && (
                    <div className="attendance-history-error">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="attendance-history-state">
                        Loading attendance history…
                    </div>
                ) : attendance.length === 0 ? (
                    <div className="attendance-history-state">
                        No attendance records found.
                    </div>
                ) : (
                    <div className="attendance-history-table-card">

                        <div className="attendance-history-table-wrapper">

                            <table className="attendance-history-table">

                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Check in</th>
                                        <th>Check out</th>
                                        <th>Working time</th>
                                        <th>Status</th>
                                        <th>Remarks</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {attendance.map((item) => (
                                        <tr key={item._id}>

                                            <td className="attendance-history-date">
                                                {formatDate(item.date)}
                                            </td>

                                            <td className="attendance-history-mono">
                                                {formatTime(item.checkIn)}
                                            </td>

                                            <td className="attendance-history-mono">
                                                {formatTime(item.checkOut)}
                                            </td>

                                            <td className="attendance-history-mono">
                                                {formatMinutes(
                                                    item.workingMinutes
                                                )}
                                            </td>

                                            <td>
                                                <span
                                                    className={`attendance-history-status ${statusBadgeClass(
                                                        item.status
                                                    )}`}
                                                >
                                                    {item.status}
                                                </span>
                                            </td>

                                            <td
                                                className={
                                                    !item.remarks
                                                        ? "attendance-history-muted"
                                                        : undefined
                                                }
                                            >
                                                {item.remarks || "--"}
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>

                            </table>

                        </div>

                    </div>
                )}

            </div>
        </div>
    );
};

export default AttendanceHistory;
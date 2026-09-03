import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./LeaveManagement.css";

const LeaveManagement = () => {
    const navigate = useNavigate();

    const [balance, setBalance] = useState(null);
    const [leaves, setLeaves] = useState([]);

    const [leaveType, setLeaveType] = useState("casual");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [reason, setReason] = useState("");

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [popup, setPopup] = useState({
        show: false,
        message: "",
        type: "error"
    });

    const closePopup = () => {
        setPopup({
            show: false,
            message: "",
            type: "error"
        });
    };

    const showPopup = (message, type = "error") => {
        setPopup({
            show: true,
            message,
            type
        });
    };

    const loadData = async () => {
        try {
            setLoading(true);

            const [balanceResponse, leaveResponse] =
                await Promise.all([
                    api.get("/leave-balance/my"),
                    api.get("/leave")
                ]);

            setBalance(
                balanceResponse.data.data.balance
            );

            setLeaves(
                leaveResponse.data.data.leaves || []
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load leave information"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (!startDate || !endDate) {
            showPopup(
                "Please select both start date and end date."
            );
            return;
        }

        if (new Date(endDate) < new Date(startDate)) {
            showPopup(
                "End date cannot be before start date."
            );
            return;
        }

        if (reason.trim().length < 5) {
            showPopup(
                "Reason must be at least 5 characters long."
            );
            return;
        }

        try {
            setSubmitting(true);

            const response = await api.post("/leave", {
                leaveType,
                startDate,
                endDate,
                reason
            });

            setMessage(
                response.data.message ||
                "Leave applied successfully."
            );

            setStartDate("");
            setEndDate("");
            setReason("");

            await loadData();
        } catch (err) {
            const errorMessage =
                err.response?.data?.message ||
                "Failed to apply leave";

            showPopup(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = async (id) => {
        if (
            !window.confirm(
                "Are you sure you want to cancel this leave?"
            )
        ) {
            return;
        }

        try {
            setError("");
            setMessage("");

            const response = await api.patch(
                `/leave/${id}/cancel`
            );

            setMessage(
                response.data.message ||
                "Leave cancelled successfully."
            );

            await loadData();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to cancel leave"
            );
        }
    };

    const formatDate = (date) => {
        if (!date) return "--";

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };

    const formatType = (type) => {
        if (!type) return "--";

        return type
            .replace("_", " ")
            .replace(/\b\w/g, (char) =>
                char.toUpperCase()
            );
    };

    const statusPillClass = (status) => {
        const key = (status || "").toLowerCase();

        if (key.includes("approved")) return "leave-management-status-pill--approved";
        if (key.includes("pending")) return "leave-management-status-pill--pending";
        if (key.includes("rejected")) return "leave-management-status-pill--rejected";
        if (key.includes("cancelled")) return "leave-management-status-pill--cancelled";

        return "leave-management-status-pill--pending";
    };

    if (loading) {
        return (
            <div className="leave-management-loading">
                Loading leave information…
            </div>
        );
    }

    return (
        <div className="leave-management-page">

            {popup.show && (
                <div
                    className="leave-management-popup-overlay"
                    onClick={closePopup}
                >
                    <div
                        className="leave-management-popup-card"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            className={`leave-management-popup-icon leave-management-popup-icon--${popup.type}`}
                        >
                            {popup.type === "success" ? "✓" : "!"}
                        </div>

                        <h2 className="leave-management-popup-title">
                            {popup.type === "success"
                                ? "Success"
                                : "Leave application failed"}
                        </h2>

                        <p className="leave-management-popup-message">
                            {popup.message}
                        </p>

                        <button
                            className={`leave-management-popup-button leave-management-popup-button--${popup.type}`}
                            onClick={closePopup}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}

            <div className="leave-management-container">

                <div className="leave-management-header">
                    <div>
                        <h1>Leave management</h1>
                        <p>Apply for leave and view your leave history</p>
                    </div>

                    <button
                        className="leave-management-back"
                        onClick={() => navigate("/dashboard")}
                    >
                        Back to dashboard
                    </button>
                </div>

                {message && (
                    <div className="leave-management-banner-success">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="leave-management-banner-error">
                        {error}
                    </div>
                )}

                <h2 className="leave-management-section-title">Leave balance</h2>

                <div className="leave-management-balance-grid">
                    <div className="leave-management-balance-card">
                        <p className="leave-management-balance-label">Casual</p>
                        <p className="leave-management-balance-value">
                            {balance?.casual ?? 0}<span>days</span>
                        </p>
                    </div>

                    <div className="leave-management-balance-card">
                        <p className="leave-management-balance-label">Sick</p>
                        <p className="leave-management-balance-value">
                            {balance?.sick ?? 0}<span>days</span>
                        </p>
                    </div>

                    <div className="leave-management-balance-card">
                        <p className="leave-management-balance-label">Earned</p>
                        <p className="leave-management-balance-value">
                            {balance?.earned ?? 0}<span>days</span>
                        </p>
                    </div>

                    <div className="leave-management-balance-card">
                        <p className="leave-management-balance-label">Unpaid</p>
                        <p className="leave-management-balance-value">
                            {balance?.unpaid ?? 0}<span>days</span>
                        </p>
                    </div>
                </div>

                <h2 className="leave-management-section-title">Apply for leave</h2>

                <form className="leave-management-form-card" onSubmit={handleSubmit}>
                    <div className="leave-management-field">
                        <label htmlFor="leaveType">Leave type</label>

                        <select
                            id="leaveType"
                            value={leaveType}
                            onChange={(e) => setLeaveType(e.target.value)}
                        >
                            <option value="casual">Casual leave</option>
                            <option value="sick">Sick leave</option>
                            <option value="earned">Earned leave</option>
                            <option value="unpaid">Unpaid leave</option>
                        </select>
                    </div>

                    <div className="leave-management-field-row">
                        <div className="leave-management-field">
                            <label htmlFor="startDate">Start date</label>
                            <input
                                id="startDate"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                            />
                        </div>

                        <div className="leave-management-field">
                            <label htmlFor="endDate">End date</label>
                            <input
                                id="endDate"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="leave-management-field">
                        <label htmlFor="reason">Reason</label>
                        <textarea
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Enter reason for leave"
                            required
                            rows="4"
                        />
                    </div>

                    <button
                        type="submit"
                        className="leave-management-submit"
                        disabled={submitting}
                    >
                        {submitting ? "Applying…" : "Apply leave"}
                    </button>
                </form>

                <h2 className="leave-management-section-title">Leave history</h2>

                {leaves.length === 0 ? (
                    <div className="leave-management-state">
                        No leave applications found.
                    </div>
                ) : (
                    <div className="leave-management-table-card">
                        <div className="leave-management-table-wrapper">
                            <table className="leave-management-table">
                                <thead>
                                    <tr>
                                        <th>Type</th>
                                        <th>Start date</th>
                                        <th>End date</th>
                                        <th>Days</th>
                                        <th>Reason</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {leaves.map((leave) => (
                                        <tr key={leave._id}>
                                            <td>{formatType(leave.leaveType)}</td>
                                            <td>{formatDate(leave.startDate)}</td>
                                            <td>{formatDate(leave.endDate)}</td>
                                            <td>{leave.totalDays ?? "--"}</td>
                                            <td
                                                className="leave-management-reason-cell"
                                                title={leave.reason || "--"}
                                            >
                                                {leave.reason || "--"}
                                            </td>
                                            <td>
                                                <span
                                                    className={`leave-management-status-pill ${statusPillClass(
                                                        leave.status
                                                    )}`}
                                                >
                                                    {formatType(leave.status)}
                                                </span>
                                            </td>
                                            <td className={leave.status !== "pending" ? "is-muted" : undefined}>
                                                {leave.status === "pending" ? (
                                                    <button
                                                        className="leave-management-cancel-btn"
                                                        onClick={() => handleCancel(leave._id)}
                                                    >
                                                        Cancel
                                                    </button>
                                                ) : (
                                                    "--"
                                                )}
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

export default LeaveManagement;
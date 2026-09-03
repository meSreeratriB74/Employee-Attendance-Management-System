import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import "./Dashboard.css";

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [today, setToday] = useState(null);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const loadDashboard = async () => {
        try {
            setLoading(true);

            const [todayResponse, summaryResponse] = await Promise.all([
                api.get("/attendance/today"),
                api.get("/attendance/my-summary")
            ]);

            setToday(todayResponse.data.data.attendance);
            setSummary(summaryResponse.data.data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load dashboard"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const handleCheckIn = async () => {
        try {
            setActionLoading(true);
            setMessage("");
            setError("");

            const response = await api.post("/attendance/check-in");

            setMessage(response.data.message);

            await loadDashboard();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Check-in failed"
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleCheckOut = async () => {
        try {
            setActionLoading(true);
            setMessage("");
            setError("");

            const response = await api.post("/attendance/check-out");

            setMessage(response.data.message);

            await loadDashboard();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Check-out failed"
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const formatTime = (date) => {
        if (!date) return "--";

        return new Date(date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const formatMinutes = (minutes) => {
        if (!minutes) return "0 min";

        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;

        return hours > 0
            ? `${hours}h ${mins}m`
            : `${mins} min`;
    };

    const statusPillClass = (status) => {
        const key = (status || "").toLowerCase();

        if (key.includes("present")) return "dashboard-status-pill--present";
        if (key.includes("late")) return "dashboard-status-pill--late";
        if (key.includes("absent")) return "dashboard-status-pill--absent";
        if (key.includes("leave")) return "dashboard-status-pill--leave";

        return "dashboard-status-pill--pending";
    };

    if (loading) {
        return <div className="dashboard-loading">Loading dashboard…</div>;
    }

    return (
        <div className="dashboard-page">
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <div>
                        <h1>Dashboard</h1>
                        <p>
                            Welcome, <strong>{user?.name}</strong>
                        </p>
                    </div>

                    <button className="dashboard-logout" onClick={handleLogout}>
                        Log out
                    </button>
                </div>

                {message && (
                    <div className="dashboard-banner-success">{message}</div>
                )}

                {error && (
                    <div className="dashboard-banner-error">{error}</div>
                )}

                <div className="dashboard-today-card">
                    <div className="dashboard-today-header">
                        <h2>Today's attendance</h2>
                        <span
                            className={`dashboard-status-pill ${statusPillClass(
                                today?.status
                            )}`}
                        >
                            {today?.status || "Not marked"}
                        </span>
                    </div>

                    <div className="dashboard-today-stats">
                        <div>
                            <p className="dashboard-stat-label">Check in</p>
                            <p className="dashboard-stat-value">
                                {formatTime(today?.checkIn)}
                            </p>
                        </div>

                        <div>
                            <p className="dashboard-stat-label">Check out</p>
                            <p className="dashboard-stat-value">
                                {formatTime(today?.checkOut)}
                            </p>
                        </div>

                        <div>
                            <p className="dashboard-stat-label">Working time</p>
                            <p className="dashboard-stat-value">
                                {formatMinutes(today?.workingMinutes)}
                            </p>
                        </div>
                    </div>

                    <div className="dashboard-today-actions">
                        <button
                            className="dashboard-btn dashboard-btn--checkin"
                            onClick={handleCheckIn}
                            disabled={actionLoading || !!today?.checkIn}
                        >
                            {actionLoading ? "Processing…" : "Check in"}
                        </button>

                        <button
                            className="dashboard-btn dashboard-btn--checkout"
                            onClick={handleCheckOut}
                            disabled={
                                actionLoading ||
                                !today?.checkIn ||
                                !!today?.checkOut
                            }
                        >
                            {actionLoading ? "Processing…" : "Check out"}
                        </button>
                    </div>
                </div>

                <div className="dashboard-summary-grid">
                    <div className="dashboard-summary-card">
                        <p className="dashboard-summary-label">Total</p>
                        <p className="dashboard-summary-value">
                            {summary?.total || 0}
                        </p>
                    </div>

                    <div className="dashboard-summary-card">
                        <p className="dashboard-summary-label">Present</p>
                        <p className="dashboard-summary-value">
                            {summary?.present || 0}
                        </p>
                    </div>

                    <div className="dashboard-summary-card">
                        <p className="dashboard-summary-label">Late</p>
                        <p className="dashboard-summary-value">
                            {summary?.late || 0}
                        </p>
                    </div>

                    <div className="dashboard-summary-card">
                        <p className="dashboard-summary-label">Leave</p>
                        <p className="dashboard-summary-value">
                            {summary?.leave || 0}
                        </p>
                    </div>

                    <div className="dashboard-summary-card dashboard-summary-card--highlight">
                        <p className="dashboard-summary-label">Attendance</p>
                        <p className="dashboard-summary-value">
                            {summary?.attendancePercentage || 0}%
                        </p>
                    </div>
                </div>

                <div className="dashboard-nav-actions">
                    <button
                        className="dashboard-nav-btn"
                        onClick={() => navigate("/attendance-history")}
                    >
                        Attendance history
                    </button>

                    <button
                        className="dashboard-nav-btn"
                        onClick={() => navigate("/leave")}
                    >
                        Leave management
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
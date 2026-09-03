import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "./HRDashboard.css";

function useClock() {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    return now;
}

const HRDashboard = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const now = useClock();

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/hr-dashboard");

            setDashboard(response.data.data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load HR dashboard"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const formatAmount = (amount) => {
        return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
    };

    if (loading) {
        return (
            <div className="hr-dashboard-loading">
                <p>Loading dashboard…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="hr-dashboard-error-state">
                <p>{error}</p>
                <div className="hr-dashboard-error-actions">
                    <button onClick={loadDashboard}>Retry</button>
                    <button onClick={handleLogout}>Log out</button>
                </div>
            </div>
        );
    }

    return (
        <div className="hr-dashboard-page">
            <div className="hr-dashboard-hero">
                <div className="hr-dashboard-hero-inner">
                    <div className="hr-dashboard-hero-title">
                        <h1>HR dashboard</h1>
                        <p>Employee Attendance Management System</p>
                    </div>

                    <div className="hr-dashboard-hero-right">
                        <div className="hr-dashboard-hero-clock">
                            <div className="hr-dashboard-hero-time">
                                {now.toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                    hour12: false
                                })}
                            </div>
                            <div className="hr-dashboard-hero-date">
                                {now.toLocaleDateString("en-US", {
                                    weekday: "long",
                                    month: "long",
                                    day: "numeric"
                                })}
                            </div>
                        </div>

                        <button className="hr-dashboard-logout" onClick={handleLogout}>
                            Log out
                        </button>
                    </div>
                </div>
            </div>

            <div className="hr-dashboard-body">

                <div className="hr-dashboard-section">
                    <h2 className="hr-dashboard-section-title">Employee overview</h2>
                    <div className="hr-dashboard-stats-grid">
                        <div className="hr-dashboard-stat-card">
                            <p className="hr-dashboard-stat-label">Total employees</p>
                            <p className="hr-dashboard-stat-value">{dashboard.employees.total}</p>
                        </div>

                        <div className="hr-dashboard-stat-card hr-dashboard-stat-card--active">
                            <p className="hr-dashboard-stat-label">Active</p>
                            <p className="hr-dashboard-stat-value">{dashboard.employees.active}</p>
                        </div>

                        <div className="hr-dashboard-stat-card hr-dashboard-stat-card--inactive">
                            <p className="hr-dashboard-stat-label">Inactive</p>
                            <p className="hr-dashboard-stat-value">{dashboard.employees.inactive}</p>
                        </div>
                    </div>
                </div>

                <div className="hr-dashboard-section">
                    <h2 className="hr-dashboard-section-title">Attendance overview</h2>
                    <div className="hr-dashboard-stats-grid">
                        <div className="hr-dashboard-stat-card">
                            <p className="hr-dashboard-stat-label">Total attendance</p>
                            <p className="hr-dashboard-stat-value">{dashboard.attendance.total}</p>
                        </div>

                        <div className="hr-dashboard-stat-card hr-dashboard-stat-card--present">
                            <p className="hr-dashboard-stat-label">Present today</p>
                            <p className="hr-dashboard-stat-value">{dashboard.attendance.presentToday}</p>
                        </div>
                    </div>
                </div>

                <div className="hr-dashboard-section">
                    <h2 className="hr-dashboard-section-title">Leave overview</h2>
                    <div className="hr-dashboard-stats-grid">
                        <div className="hr-dashboard-stat-card hr-dashboard-stat-card--pending">
                            <p className="hr-dashboard-stat-label">Pending</p>
                            <p className="hr-dashboard-stat-value">{dashboard.leaves.pending}</p>
                        </div>

                        <div className="hr-dashboard-stat-card hr-dashboard-stat-card--approved">
                            <p className="hr-dashboard-stat-label">Approved</p>
                            <p className="hr-dashboard-stat-value">{dashboard.leaves.approved}</p>
                        </div>

                        <div className="hr-dashboard-stat-card hr-dashboard-stat-card--rejected">
                            <p className="hr-dashboard-stat-label">Rejected</p>
                            <p className="hr-dashboard-stat-value">{dashboard.leaves.rejected}</p>
                        </div>
                    </div>
                </div>

                <div className="hr-dashboard-section">
                    <h2 className="hr-dashboard-section-title">Payroll overview</h2>
                    <div className="hr-dashboard-payroll-grid">
                        <div className="hr-dashboard-payroll-hero">
                            <div>
                                <p className="hr-dashboard-payroll-hero-label">Total payroll amount</p>
                                <p className="hr-dashboard-payroll-hero-value">
                                    {formatAmount(dashboard.payroll.totalAmount)}
                                </p>
                            </div>
                        </div>

                        <div className="hr-dashboard-stat-card hr-dashboard-stat-card--pending">
                            <p className="hr-dashboard-stat-label">Pending</p>
                            <p className="hr-dashboard-stat-value">{dashboard.payroll.pending}</p>
                        </div>

                        <div className="hr-dashboard-stat-card hr-dashboard-stat-card--processed">
                            <p className="hr-dashboard-stat-label">Processed</p>
                            <p className="hr-dashboard-stat-value">{dashboard.payroll.processed}</p>
                        </div>

                        <div className="hr-dashboard-stat-card hr-dashboard-stat-card--paid">
                            <p className="hr-dashboard-stat-label">Paid</p>
                            <p className="hr-dashboard-stat-value">{dashboard.payroll.paid}</p>
                        </div>
                    </div>
                </div>

                <div className="hr-dashboard-section">
                    <h2 className="hr-dashboard-section-title">Quick actions</h2>
                    <div className="hr-dashboard-actions-grid">
                        <button
                            className="hr-dashboard-action-card"
                            onClick={() => navigate("/hr/employees")}
                        >
                            <div>
                                <p className="hr-dashboard-action-card-title">Employee management</p>
                                <p className="hr-dashboard-action-card-desc">View, edit, and manage staff</p>
                            </div>
                            <span className="hr-dashboard-action-card-arrow">→</span>
                        </button>

                        <button
                            className="hr-dashboard-action-card"
                            onClick={() => navigate("/hr/attendance")}
                        >
                            <div>
                                <p className="hr-dashboard-action-card-title">Attendance management</p>
                                <p className="hr-dashboard-action-card-desc">Review and correct daily records</p>
                            </div>
                            <span className="hr-dashboard-action-card-arrow">→</span>
                        </button>

                        <button
                            className="hr-dashboard-action-card"
                            onClick={() => navigate("/hr/leaves")}
                        >
                            <div>
                                <p className="hr-dashboard-action-card-title">Leave management</p>
                                <p className="hr-dashboard-action-card-desc">Approve or reject leave requests</p>
                            </div>
                            <span className="hr-dashboard-action-card-arrow">→</span>
                        </button>

                        <button
                            className="hr-dashboard-action-card"
                            onClick={() => navigate("/hr/payroll")}
                        >
                            <div>
                                <p className="hr-dashboard-action-card-title">Payroll management</p>
                                <p className="hr-dashboard-action-card-desc">Process and track employee pay</p>
                            </div>
                            <span className="hr-dashboard-action-card-arrow">→</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default HRDashboard;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./HRLeaveManagement.css";

const HRLeaveManagement = () => {
    const navigate = useNavigate();

    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [processingId, setProcessingId] = useState(null);
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedLeave, setSelectedLeave] = useState(null);

    const loadLeaves = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/leave/all");

            const leaveData = response.data.data;

setLeaves(
    Array.isArray(leaveData)
        ? leaveData
        : leaveData?.leaves || []
);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load leave applications"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLeaves();
    }, []);

    const handleApprove = async (id) => {
        try {
            setProcessingId(id);

            await api.patch(`/leave/${id}/approve`);

            alert("Leave approved successfully.");

            setSelectedLeave(null);

            await loadLeaves();
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Failed to approve leave"
            );
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to reject this leave application?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setProcessingId(id);

            await api.patch(`/leave/${id}/reject`);

            alert("Leave rejected successfully.");

            setSelectedLeave(null);

            await loadLeaves();
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Failed to reject leave"
            );
        } finally {
            setProcessingId(null);
        }
    };

    const formatDate = (date) => {
        if (!date) {
            return "--";
        }

        return new Date(date).toLocaleDateString();
    };

    const formatStatus = (status) => {
        if (!status) {
            return "--";
        }

        return status
            .replace("_", " ")
            .replace(/\b\w/g, (char) =>
                char.toUpperCase()
            );
    };

    const statusPillClass = (status) => {
        const key = (status || "").toLowerCase();
        return `hr-leave-management-status-pill--${key || "pending"}`;
    };

    const filteredLeaves =
        statusFilter === "all"
            ? leaves
            : leaves.filter(
                  (leave) =>
                      leave.status === statusFilter
              );

    const pendingCount = leaves.filter(
        (leave) => leave.status === "pending"
    ).length;

    const approvedCount = leaves.filter(
        (leave) => leave.status === "approved"
    ).length;

    const rejectedCount = leaves.filter(
        (leave) => leave.status === "rejected"
    ).length;

    if (loading) {
        return (
            <div className="hr-leave-management-loading">
                <p>Loading leave applications…</p>
            </div>
        );
    }

    return (
        <div className="hr-leave-management-page">
            <div className="hr-leave-management-container">

                <div className="hr-leave-management-header">
                    <div>
                        <h1>HR leave management</h1>
                        <p>View and manage employee leave applications</p>
                    </div>

                    <button
                        className="hr-leave-management-back"
                        onClick={() => navigate("/hr-dashboard")}
                    >
                        Back to HR dashboard
                    </button>
                </div>

                {error && (
                    <div className="hr-leave-management-error-banner">
                        <span>{error}</span>
                        <button className="hr-leave-management-retry-btn" onClick={loadLeaves}>
                            Retry
                        </button>
                    </div>
                )}

                <div className="hr-leave-management-summary-grid">
                    <div className="hr-leave-management-summary-card">
                        <p className="hr-leave-management-summary-label">Total applications</p>
                        <p className="hr-leave-management-summary-value">{leaves.length}</p>
                    </div>

                    <div className="hr-leave-management-summary-card hr-leave-management-summary-card--pending">
                        <p className="hr-leave-management-summary-label">Pending</p>
                        <p className="hr-leave-management-summary-value">{pendingCount}</p>
                    </div>

                    <div className="hr-leave-management-summary-card hr-leave-management-summary-card--approved">
                        <p className="hr-leave-management-summary-label">Approved</p>
                        <p className="hr-leave-management-summary-value">{approvedCount}</p>
                    </div>

                    <div className="hr-leave-management-summary-card hr-leave-management-summary-card--rejected">
                        <p className="hr-leave-management-summary-label">Rejected</p>
                        <p className="hr-leave-management-summary-value">{rejectedCount}</p>
                    </div>
                </div>

                <div className="hr-leave-management-filter">
                    <label htmlFor="status-filter">Filter by status</label>
                    <select
                        id="status-filter"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                <div className="hr-leave-management-table-card">
                    <div className="hr-leave-management-table-wrapper">
                        <table className="hr-leave-management-table">
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Employee ID</th>
                                    <th>Leave type</th>
                                    <th>Start date</th>
                                    <th>End date</th>
                                    <th>Days</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredLeaves.length === 0 ? (
                                    <tr className="hr-leave-management-empty-row">
                                        <td colSpan="8">No leave applications found</td>
                                    </tr>
                                ) : (
                                    filteredLeaves.map((leave) => (
                                        <tr key={leave._id}>
                                            <td>
                                                {leave.employee?.name || leave.user?.name || "--"}
                                            </td>

                                            <td>
                                                {leave.employee?.employeeId ||
                                                    leave.user?.employeeId ||
                                                    "--"}
                                            </td>

                                            <td>
                                                {leave.leaveType
                                                    ? leave.leaveType
                                                          .replace("_", " ")
                                                          .replace(/\b\w/g, (char) => char.toUpperCase())
                                                    : "--"}
                                            </td>

                                            <td>{formatDate(leave.startDate)}</td>
                                            <td>{formatDate(leave.endDate)}</td>
                                            <td>{leave.days ?? leave.numberOfDays ?? "--"}</td>

                                            <td>
                                                <span
                                                    className={`hr-leave-management-status-pill ${statusPillClass(
                                                        leave.status
                                                    )}`}
                                                >
                                                    {formatStatus(leave.status)}
                                                </span>
                                            </td>

                                            <td>
                                                <button
                                                    className="hr-leave-management-view-btn"
                                                    onClick={() => setSelectedLeave(leave)}
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {selectedLeave && (
                    <div className="hr-leave-management-modal-overlay">
                        <div className="hr-leave-management-modal-card">
                            <h2 className="hr-leave-management-modal-title">Leave application details</h2>

                            <div className="hr-leave-management-detail-row">
                                <span className="hr-leave-management-detail-label">Employee</span>
                                <span className="hr-leave-management-detail-value">
                                    {selectedLeave.employee?.name || selectedLeave.user?.name || "--"}
                                </span>
                            </div>

                            <div className="hr-leave-management-detail-row">
                                <span className="hr-leave-management-detail-label">Employee ID</span>
                                <span className="hr-leave-management-detail-value">
                                    {selectedLeave.employee?.employeeId ||
                                        selectedLeave.user?.employeeId ||
                                        "--"}
                                </span>
                            </div>

                            <div className="hr-leave-management-detail-row">
                                <span className="hr-leave-management-detail-label">Email</span>
                                <span className="hr-leave-management-detail-value">
                                    {selectedLeave.employee?.email || selectedLeave.user?.email || "--"}
                                </span>
                            </div>

                            <div className="hr-leave-management-detail-row">
                                <span className="hr-leave-management-detail-label">Department</span>
                                <span className="hr-leave-management-detail-value">
                                    {selectedLeave.employee?.department ||
                                        selectedLeave.user?.department ||
                                        "--"}
                                </span>
                            </div>

                            <div className="hr-leave-management-detail-row">
                                <span className="hr-leave-management-detail-label">Leave type</span>
                                <span className="hr-leave-management-detail-value">
                                    {selectedLeave.leaveType
                                        ? selectedLeave.leaveType
                                              .replace("_", " ")
                                              .replace(/\b\w/g, (char) => char.toUpperCase())
                                        : "--"}
                                </span>
                            </div>

                            <div className="hr-leave-management-detail-row">
                                <span className="hr-leave-management-detail-label">Start date</span>
                                <span className="hr-leave-management-detail-value">
                                    {formatDate(selectedLeave.startDate)}
                                </span>
                            </div>

                            <div className="hr-leave-management-detail-row">
                                <span className="hr-leave-management-detail-label">End date</span>
                                <span className="hr-leave-management-detail-value">
                                    {formatDate(selectedLeave.endDate)}
                                </span>
                            </div>

                            <div className="hr-leave-management-detail-row">
                                <span className="hr-leave-management-detail-label">Days</span>
                                <span className="hr-leave-management-detail-value">
                                    {selectedLeave.days ?? selectedLeave.numberOfDays ?? "--"}
                                </span>
                            </div>

                            <div className="hr-leave-management-detail-row">
                                <span className="hr-leave-management-detail-label">Status</span>
                                <span className="hr-leave-management-detail-value">
                                    {formatStatus(selectedLeave.status)}
                                </span>
                            </div>

                            <div className="hr-leave-management-detail-row">
                                <span className="hr-leave-management-detail-label">Reason</span>
                                <span className="hr-leave-management-detail-value">
                                    {selectedLeave.reason || "--"}
                                </span>
                            </div>

                            {selectedLeave.status === "pending" && (
                                <div className="hr-leave-management-modal-actions">
                                    <button
                                        className="hr-leave-management-approve-btn"
                                        onClick={() => handleApprove(selectedLeave._id)}
                                        disabled={processingId === selectedLeave._id}
                                    >
                                        {processingId === selectedLeave._id ? "Processing…" : "Approve"}
                                    </button>

                                    <button
                                        className="hr-leave-management-reject-btn"
                                        onClick={() => handleReject(selectedLeave._id)}
                                        disabled={processingId === selectedLeave._id}
                                    >
                                        Reject
                                    </button>
                                </div>
                            )}

                            <button
                                className="hr-leave-management-modal-close"
                                onClick={() => setSelectedLeave(null)}
                                disabled={processingId === selectedLeave._id}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HRLeaveManagement;
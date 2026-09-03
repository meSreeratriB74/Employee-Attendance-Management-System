import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./Hrattendance.css";

const HRAttendance = () => {
    const navigate = useNavigate();

    const [attendance, setAttendance] = useState([]);

    const [summary, setSummary] = useState({
        total: 0,
        present: 0,
        late: 0,
        halfDay: 0,
        absent: 0,
        leave: 0
    });

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [editingRecord, setEditingRecord] = useState(null);
    const [saving, setSaving] = useState(false);
    const [processing, setProcessing] = useState(false);

    const loadAttendance = async () => {
        try {
            setLoading(true);
            setError("");

            const params = {};

            if (startDate) {
                params.startDate = startDate;
            }

            if (endDate) {
                params.endDate = endDate;
            }

            const response = await api.get(
                "/attendance/report",
                { params }
            );

            setAttendance(
                response.data.data.attendance || []
            );

            setSummary(
                response.data.data.summary || {
                    total: 0,
                    present: 0,
                    late: 0,
                    halfDay: 0,
                    absent: 0,
                    leave: 0
                }
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load attendance"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAttendance();
    }, []);

    const handleFilter = (event) => {
        event.preventDefault();
        loadAttendance();
    };

    const clearFilter = () => {
        setStartDate("");
        setEndDate("");

        setTimeout(() => {
            loadAttendance();
        }, 0);
    };

    const processDailyAttendance = async () => {
        try {
            setProcessing(true);
            setError("");

            const response = await api.post(
                "/attendance/process-daily"
            );

            const data = response.data.data;

            alert(
                `${response.data.message}\n\n` +
                `Total Employees: ${data.totalEmployees}\n` +
                `Processed: ${data.processed}\n` +
                `Marked Absent: ${data.markedAbsent}\n` +
                `Marked Leave: ${data.markedLeave}`
            );

            await loadAttendance();
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Failed to process daily attendance"
            );
        } finally {
            setProcessing(false);
        }
    };

    const formatDate = (date) => {
        if (!date) {
            return "--";
        }

        return new Date(date).toLocaleDateString();
    };

    const formatTime = (time) => {
        if (!time) {
            return "--";
        }

        return new Date(time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
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

    const openEdit = (record) => {
        setEditingRecord({
            _id: record._id,
            status: record.status || "",
            checkIn: record.checkIn
                ? new Date(record.checkIn)
                      .toISOString()
                      .slice(0, 16)
                : "",
            checkOut: record.checkOut
                ? new Date(record.checkOut)
                      .toISOString()
                      .slice(0, 16)
                : "",
            workingMinutes:
                record.workingMinutes ?? 0,
            remarks: record.remarks || ""
        });
    };

    const closeEdit = () => {
        if (!saving) {
            setEditingRecord(null);
        }
    };

    const handleEditChange = (field, value) => {
        setEditingRecord((previous) => ({
            ...previous,
            [field]: value
        }));
    };

    const saveAttendance = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);

            await api.patch(
                `/attendance/${editingRecord._id}`,
                {
                    status: editingRecord.status,

                    checkIn: editingRecord.checkIn
                        ? new Date(
                              editingRecord.checkIn
                          ).toISOString()
                        : undefined,

                    checkOut: editingRecord.checkOut
                        ? new Date(
                              editingRecord.checkOut
                          ).toISOString()
                        : undefined,

                    workingMinutes:
                        Number(
                            editingRecord.workingMinutes
                        ),

                    remarks:
                        editingRecord.remarks
                }
            );

            setEditingRecord(null);

            await loadAttendance();

            alert("Attendance updated successfully.");
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Failed to update attendance"
            );
        } finally {
            setSaving(false);
        }
    };

    const statusPillClass = (status) => {
        const key = (status || "").toLowerCase();
        return `hr-attendance-status-pill--${key || "leave"}`;
    };

    if (loading) {
        return (
            <div className="hr-attendance-loading">
                <p>Loading attendance…</p>
            </div>
        );
    }

    return (
        <div className="hr-attendance-page">
            <div className="hr-attendance-container">

                <div className="hr-attendance-header">
                    <div>
                        <h1>HR attendance management</h1>
                        <p>View and manage employee attendance</p>
                    </div>

                    <div className="hr-attendance-header-actions">
                        <button
                            className="hr-attendance-back"
                            onClick={() => navigate("/hr-dashboard")}
                        >
                            Back to HR dashboard
                        </button>

                        <button
                            className="hr-attendance-process-btn"
                            onClick={processDailyAttendance}
                            disabled={processing}
                        >
                            {processing ? "Processing…" : "Process daily attendance"}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="hr-attendance-error-banner">
                        <span>{error}</span>
                        <button className="hr-attendance-retry-btn" onClick={loadAttendance}>
                            Retry
                        </button>
                    </div>
                )}

                <form className="hr-attendance-filter" onSubmit={handleFilter}>
                    <div className="hr-attendance-filter-field">
                        <label htmlFor="filter-start">Start date</label>
                        <input
                            id="filter-start"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>

                    <div className="hr-attendance-filter-field">
                        <label htmlFor="filter-end">End date</label>
                        <input
                            id="filter-end"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="hr-attendance-filter-apply">
                        Apply filter
                    </button>

                    <button
                        type="button"
                        className="hr-attendance-filter-clear"
                        onClick={clearFilter}
                    >
                        Clear
                    </button>
                </form>

                <div className="hr-attendance-summary-grid">
                    <div className="hr-attendance-summary-card">
                        <p className="hr-attendance-summary-label">Total</p>
                        <p className="hr-attendance-summary-value">{summary.total}</p>
                    </div>

                    <div className="hr-attendance-summary-card hr-attendance-summary-card--present">
                        <p className="hr-attendance-summary-label">Present</p>
                        <p className="hr-attendance-summary-value">{summary.present}</p>
                    </div>

                    <div className="hr-attendance-summary-card hr-attendance-summary-card--late">
                        <p className="hr-attendance-summary-label">Late</p>
                        <p className="hr-attendance-summary-value">{summary.late}</p>
                    </div>

                    <div className="hr-attendance-summary-card hr-attendance-summary-card--halfday">
                        <p className="hr-attendance-summary-label">Half day</p>
                        <p className="hr-attendance-summary-value">{summary.halfDay}</p>
                    </div>

                    <div className="hr-attendance-summary-card hr-attendance-summary-card--absent">
                        <p className="hr-attendance-summary-label">Absent</p>
                        <p className="hr-attendance-summary-value">{summary.absent}</p>
                    </div>

                    <div className="hr-attendance-summary-card">
                        <p className="hr-attendance-summary-label">Leave</p>
                        <p className="hr-attendance-summary-value">{summary.leave}</p>
                    </div>
                </div>

                <div className="hr-attendance-table-card">
                    <div className="hr-attendance-table-wrapper">
                        <table className="hr-attendance-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Employee ID</th>
                                    <th>Employee name</th>
                                    <th>Department</th>
                                    <th>Check in</th>
                                    <th>Check out</th>
                                    <th>Working minutes</th>
                                    <th>Status</th>
                                    <th>Remarks</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {attendance.length === 0 ? (
                                    <tr className="hr-attendance-empty-row">
                                        <td colSpan="10">No attendance records found</td>
                                    </tr>
                                ) : (
                                    attendance.map((record) => (
                                        <tr key={record._id}>
                                            <td>{formatDate(record.date)}</td>
                                            <td>{record.employee?.employeeId || "--"}</td>
                                            <td>{record.employee?.name || "--"}</td>
                                            <td>{record.employee?.department || "--"}</td>
                                            <td className="is-mono">{formatTime(record.checkIn)}</td>
                                            <td className="is-mono">{formatTime(record.checkOut)}</td>
                                            <td className="is-mono">{record.workingMinutes ?? 0}</td>

                                            <td>
                                                <span
                                                    className={`hr-attendance-status-pill ${statusPillClass(
                                                        record.status
                                                    )}`}
                                                >
                                                    {formatStatus(record.status)}
                                                </span>
                                            </td>

                                            <td className={!record.remarks ? "is-muted" : undefined}>
                                                {record.remarks || "--"}
                                            </td>

                                            <td>
                                                <button
                                                    className="hr-attendance-edit-btn"
                                                    onClick={() => openEdit(record)}
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {editingRecord && (
                    <div className="hr-attendance-modal-overlay">
                        <form className="hr-attendance-modal-card" onSubmit={saveAttendance}>
                            <h2 className="hr-attendance-modal-title">Edit attendance</h2>

                            <div className="hr-attendance-field">
                                <label htmlFor="edit-status">Status</label>
                                <select
                                    id="edit-status"
                                    value={editingRecord.status}
                                    onChange={(e) => handleEditChange("status", e.target.value)}
                                >
                                    <option value="present">Present</option>
                                    <option value="late">Late</option>
                                    <option value="half_day">Half day</option>
                                    <option value="absent">Absent</option>
                                    <option value="leave">Leave</option>
                                    <option value="working">Working</option>
                                </select>
                            </div>

                            <div className="hr-attendance-field">
                                <label htmlFor="edit-checkin">Check in</label>
                                <input
                                    id="edit-checkin"
                                    type="datetime-local"
                                    value={editingRecord.checkIn}
                                    onChange={(e) => handleEditChange("checkIn", e.target.value)}
                                />
                            </div>

                            <div className="hr-attendance-field">
                                <label htmlFor="edit-checkout">Check out</label>
                                <input
                                    id="edit-checkout"
                                    type="datetime-local"
                                    value={editingRecord.checkOut}
                                    onChange={(e) => handleEditChange("checkOut", e.target.value)}
                                />
                            </div>

                            <div className="hr-attendance-field">
                                <label htmlFor="edit-minutes">Working minutes</label>
                                <input
                                    id="edit-minutes"
                                    type="number"
                                    min="0"
                                    value={editingRecord.workingMinutes}
                                    onChange={(e) => handleEditChange("workingMinutes", e.target.value)}
                                />
                            </div>

                            <div className="hr-attendance-field">
                                <label htmlFor="edit-remarks">Remarks</label>
                                <textarea
                                    id="edit-remarks"
                                    value={editingRecord.remarks}
                                    onChange={(e) => handleEditChange("remarks", e.target.value)}
                                    rows="3"
                                />
                            </div>

                            <div className="hr-attendance-form-actions">
                                <button
                                    type="submit"
                                    className="hr-attendance-save-btn"
                                    disabled={saving}
                                >
                                    {saving ? "Saving…" : "Save changes"}
                                </button>

                                <button
                                    type="button"
                                    className="hr-attendance-cancel-btn"
                                    onClick={closeEdit}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HRAttendance;
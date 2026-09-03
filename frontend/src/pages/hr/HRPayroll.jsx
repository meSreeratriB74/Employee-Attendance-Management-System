import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./HRPayroll.css";

const HRPayroll = () => {
    const navigate = useNavigate();

    const [payroll, setPayroll] = useState([]);
    const [employees, setEmployees] = useState([]);

    const [summary, setSummary] = useState({
        total: 0,
        pending: 0,
        processed: 0,
        paid: 0,
        totalSalary: 0
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [month, setMonth] = useState("");
    const [year, setYear] = useState("");
    const [status, setStatus] = useState("all");

    const [showCreate, setShowCreate] = useState(false);
    const [editingPayroll, setEditingPayroll] = useState(null);
    const [selectedPayroll, setSelectedPayroll] = useState(null);

    const [saving, setSaving] = useState(false);
    const [processingId, setProcessingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const [form, setForm] = useState({
        employee: "",
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        basicSalary: "",
        allowances: 0,
        deductions: 0,
        remarks: ""
    });

    const loadEmployees = async () => {
        try {
            const response = await api.get("/employees");

            setEmployees(
                Array.isArray(response.data.data)
                    ? response.data.data
                    : response.data.data?.employees || []
            );
        } catch (err) {
            console.error("Failed to load employees", err);
        }
    };

    const loadSummary = async () => {
        try {
            const params = {};

            if (month) {
                params.month = Number(month);
            }

            if (year) {
                params.year = Number(year);
            }

            const response = await api.get("/payroll/summary", { params });

            setSummary(
                response.data.data || {
                    total: 0,
                    pending: 0,
                    processed: 0,
                    paid: 0,
                    totalSalary: 0
                }
            );
        } catch (err) {
            console.error("Failed to load payroll summary", err);
        }
    };

    const loadPayroll = async () => {
        try {
            setLoading(true);
            setError("");

            const params = {
                page: 1,
                limit: 100
            };

            if (month) {
                params.month = Number(month);
            }

            if (year) {
                params.year = Number(year);
            }

            if (status !== "all") {
                params.status = status;
            }

            const response = await api.get("/payroll/all", { params });

            setPayroll(response.data.data?.payroll || []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load payroll");
        } finally {
            setLoading(false);
        }
    };

    const loadData = async () => {
        await Promise.all([loadEmployees(), loadPayroll(), loadSummary()]);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleFilter = async (event) => {
        event.preventDefault();

        await loadPayroll();
        await loadSummary();
    };

    const clearFilter = async () => {
        setMonth("");
        setYear("");
        setStatus("all");

        setTimeout(async () => {
            await loadPayroll();
            await loadSummary();
        }, 0);
    };

    const handleFormChange = (field, value) => {
        setForm((previous) => ({
            ...previous,
            [field]: value
        }));
    };

    const calculateNetSalary = () => {
        const basic = Number(form.basicSalary) || 0;
        const allowances = Number(form.allowances) || 0;
        const deductions = Number(form.deductions) || 0;

        return basic + allowances - deductions;
    };

    const openCreate = () => {
        setEditingPayroll(null);

        setForm({
            employee: "",
            month: month || new Date().getMonth() + 1,
            year: year || new Date().getFullYear(),
            basicSalary: "",
            allowances: 0,
            deductions: 0,
            remarks: ""
        });

        setShowCreate(true);
    };

    const openEdit = (record) => {
        setShowCreate(false);

        setEditingPayroll(record);

        setForm({
            employee: record.employee?._id || "",
            month: record.month,
            year: record.year,
            basicSalary: record.basicSalary ?? 0,
            allowances: record.allowances ?? 0,
            deductions: record.deductions ?? 0,
            remarks: record.remarks || ""
        });
    };

    const closeForm = () => {
        if (!saving) {
            setShowCreate(false);
            setEditingPayroll(null);
        }
    };

    const savePayroll = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);

            const basicSalary = Number(form.basicSalary);
            const allowances = Number(form.allowances);
            const deductions = Number(form.deductions);

            if (!form.employee) {
                alert("Please select an employee.");
                return;
            }

            if (!Number.isFinite(basicSalary) || basicSalary < 0) {
                alert("Please enter a valid basic salary.");
                return;
            }

            if (!Number.isFinite(allowances) || allowances < 0) {
                alert("Please enter valid allowances.");
                return;
            }

            if (!Number.isFinite(deductions) || deductions < 0) {
                alert("Please enter valid deductions.");
                return;
            }

            if (basicSalary + allowances - deductions < 0) {
                alert("Net salary cannot be negative.");
                return;
            }

            if (editingPayroll) {
                await api.patch(`/payroll/${editingPayroll._id}`, {
                    basicSalary,
                    allowances,
                    deductions,
                    remarks: form.remarks
                });

                alert("Payroll updated successfully.");
            } else {
                await api.post("/payroll", {
                    employee: form.employee,
                    month: Number(form.month),
                    year: Number(form.year),
                    basicSalary,
                    allowances,
                    deductions,
                    remarks: form.remarks
                });

                alert("Payroll created successfully.");
            }

            setShowCreate(false);
            setEditingPayroll(null);

            await loadPayroll();
            await loadSummary();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to save payroll");
        } finally {
            setSaving(false);
        }
    };

    const processPayroll = async (id) => {
        try {
            setProcessingId(id);

            await api.patch(`/payroll/${id}/process`);

            alert("Payroll processed successfully.");

            setSelectedPayroll(null);

            await loadPayroll();
            await loadSummary();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to process payroll");
        } finally {
            setProcessingId(null);
        }
    };

    const markPayrollPaid = async (id) => {
        try {
            setProcessingId(id);

            await api.patch(`/payroll/${id}/pay`);

            alert("Payroll marked as paid successfully.");

            setSelectedPayroll(null);

            await loadPayroll();
            await loadSummary();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to mark payroll as paid");
        } finally {
            setProcessingId(null);
        }
    };

    const deletePayroll = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this payroll record?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(id);

            await api.delete(`/payroll/${id}`);

            alert("Payroll deleted successfully.");

            setSelectedPayroll(null);

            await loadPayroll();
            await loadSummary();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete payroll");
        } finally {
            setDeletingId(null);
        }
    };

    const formatMonth = (value) => {
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        return months[value - 1] || "--";
    };

    const formatStatus = (value) => {
        if (!value) {
            return "--";
        }

        return value.replace("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const formatCurrency = (value) => {
        return `₹${Number(value || 0).toLocaleString("en-IN")}`;
    };

    const statusPillClass = (value) => {
        if (value === "pending") return "status-pill status-pill--pending";
        if (value === "processed") return "status-pill status-pill--processed";
        if (value === "paid") return "status-pill status-pill--paid";
        return "status-pill";
    };

    if (loading) {
        return (
            <div className="payroll-page">
                <div className="loading-state">
                    <h2>HR Payroll Management</h2>
                    <p>Loading payroll...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="payroll-page">
            {/* HEADER */}

            <div className="payroll-header">
                <div>
                    <h1>HR Payroll Management</h1>
                    <p>Create, process and manage employee payroll</p>
                </div>

                <div className="payroll-header__actions">
                    <button className="btn" onClick={() => navigate("/hr-dashboard")}>
                        Back to HR Dashboard
                    </button>

                    <button className="btn btn--primary" onClick={openCreate}>
                        Create Payroll
                    </button>
                </div>
            </div>

            {/* ERROR */}

            {error && (
                <div className="alert alert--error">
                    <span>{error}</span>
                    <button className="btn btn--sm" onClick={loadData}>
                        Retry
                    </button>
                </div>
            )}

            {/* FILTER */}

            <form className="filter-bar" onSubmit={handleFilter}>
                <div className="filter-field">
                    <label>Month</label>

                    <select value={month} onChange={(e) => setMonth(e.target.value)}>
                        <option value="">All Months</option>

                        {Array.from({ length: 12 }, (_, index) => (
                            <option key={index + 1} value={index + 1}>
                                {formatMonth(index + 1)}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-field">
                    <label>Year</label>

                    <input
                        type="number"
                        min="2000"
                        value={year}
                        placeholder="Year"
                        onChange={(e) => setYear(e.target.value)}
                    />
                </div>

                <div className="filter-field">
                    <label>Status</label>

                    <select value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="processed">Processed</option>
                        <option value="paid">Paid</option>
                    </select>
                </div>

                <div className="filter-actions">
                    <button type="submit" className="btn btn--primary">
                        Apply Filter
                    </button>

                    <button type="button" className="btn" onClick={clearFilter}>
                        Clear
                    </button>
                </div>
            </form>

            {/* SUMMARY */}

            <div className="summary-grid">
                <div className="summary-card">
                    <h3>Total Payroll</h3>
                    <p>{summary.total}</p>
                </div>

                <div className="summary-card summary-card--pending">
                    <h3>Pending</h3>
                    <p>{summary.pending}</p>
                </div>

                <div className="summary-card summary-card--processed">
                    <h3>Processed</h3>
                    <p>{summary.processed}</p>
                </div>

                <div className="summary-card summary-card--paid">
                    <h3>Paid</h3>
                    <p>{summary.paid}</p>
                </div>

                <div className="summary-card summary-card--salary">
                    <h3>Total Salary</h3>
                    <p className="num">{formatCurrency(summary.totalSalary)}</p>
                </div>
            </div>

            {/* PAYROLL TABLE */}

            <div className="table-wrap">
                <table className="payroll-table">
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Employee ID</th>
                            <th>Month</th>
                            <th>Year</th>
                            <th>Basic Salary</th>
                            <th>Allowances</th>
                            <th>Deductions</th>
                            <th>Net Salary</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {payroll.length === 0 ? (
                            <tr>
                                <td colSpan="10" className="is-empty">
                                    No payroll records found
                                </td>
                            </tr>
                        ) : (
                            payroll.map((record) => (
                                <tr key={record._id}>
                                    <td>{record.employee?.name || "--"}</td>
                                    <td>{record.employee?.employeeId || "--"}</td>
                                    <td>{formatMonth(record.month)}</td>
                                    <td>{record.year}</td>
                                    <td className="num">{formatCurrency(record.basicSalary)}</td>
                                    <td className="num">{formatCurrency(record.allowances)}</td>
                                    <td className="num">{formatCurrency(record.deductions)}</td>
                                    <td className="num">{formatCurrency(record.netSalary)}</td>
                                    <td>
                                        <span className={statusPillClass(record.status)}>
                                            {formatStatus(record.status)}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="table-actions">
                                            <button
                                                className="btn btn--sm"
                                                onClick={() => setSelectedPayroll(record)}
                                            >
                                                View
                                            </button>

                                            {record.status !== "paid" && (
                                                <button
                                                    className="btn btn--sm"
                                                    onClick={() => openEdit(record)}
                                                >
                                                    Edit
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* CREATE / EDIT MODAL */}

            {(showCreate || editingPayroll) && (
                <div className="modal-overlay">
                    <form className="modal" onSubmit={savePayroll}>
                        <h2>{editingPayroll ? "Edit Payroll" : "Create Payroll"}</h2>

                        {/* EMPLOYEE */}

                        {!editingPayroll && (
                            <div className="form-group">
                                <label>Employee</label>

                                <select
                                    value={form.employee}
                                    onChange={(e) => handleFormChange("employee", e.target.value)}
                                >
                                    <option value="">Select Employee</option>

                                    {employees.map((employee) => (
                                        <option key={employee._id} value={employee._id}>
                                            {employee.name} ({employee.employeeId})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* MONTH */}

                        <div className="form-group">
                            <label>Month</label>

                            <select
                                value={form.month}
                                disabled={!!editingPayroll}
                                onChange={(e) => handleFormChange("month", e.target.value)}
                            >
                                {Array.from({ length: 12 }, (_, index) => (
                                    <option key={index + 1} value={index + 1}>
                                        {formatMonth(index + 1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* YEAR */}

                        <div className="form-group">
                            <label>Year</label>

                            <input
                                type="number"
                                min="2000"
                                value={form.year}
                                disabled={!!editingPayroll}
                                onChange={(e) => handleFormChange("year", e.target.value)}
                            />
                        </div>

                        {/* BASIC SALARY */}

                        <div className="form-group">
                            <label>Basic Salary</label>

                            <input
                                type="number"
                                min="0"
                                value={form.basicSalary}
                                onChange={(e) => handleFormChange("basicSalary", e.target.value)}
                            />
                        </div>

                        {/* ALLOWANCES */}

                        <div className="form-group">
                            <label>Allowances</label>

                            <input
                                type="number"
                                min="0"
                                value={form.allowances}
                                onChange={(e) => handleFormChange("allowances", e.target.value)}
                            />
                        </div>

                        {/* DEDUCTIONS */}

                        <div className="form-group">
                            <label>Deductions</label>

                            <input
                                type="number"
                                min="0"
                                value={form.deductions}
                                onChange={(e) => handleFormChange("deductions", e.target.value)}
                            />
                        </div>

                        {/* NET SALARY */}

                        <div className="net-salary-box">
                            <span>Net Salary</span>
                            <strong className="num">{formatCurrency(calculateNetSalary())}</strong>
                        </div>

                        {/* REMARKS */}

                        <div className="form-group">
                            <label>Remarks</label>

                            <textarea
                                value={form.remarks}
                                onChange={(e) => handleFormChange("remarks", e.target.value)}
                                rows="3"
                            />
                        </div>

                        {/* BUTTONS */}

                        <div className="modal-form-actions">
                            <button type="submit" className="btn btn--primary" disabled={saving}>
                                {saving ? "Saving..." : editingPayroll ? "Update Payroll" : "Create Payroll"}
                            </button>

                            <button type="button" className="btn" onClick={closeForm} disabled={saving}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* VIEW MODAL */}

            {selectedPayroll && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Payroll Details</h2>

                        <div className="detail-list">
                            <div className="detail-row">
                                <span className="detail-row__label">Employee</span>
                                <span className="detail-row__value">
                                    {selectedPayroll.employee?.name || "--"}
                                </span>
                            </div>

                            <div className="detail-row">
                                <span className="detail-row__label">Employee ID</span>
                                <span className="detail-row__value">
                                    {selectedPayroll.employee?.employeeId || "--"}
                                </span>
                            </div>

                            <div className="detail-row">
                                <span className="detail-row__label">Department</span>
                                <span className="detail-row__value">
                                    {selectedPayroll.employee?.department || "--"}
                                </span>
                            </div>

                            <div className="detail-row">
                                <span className="detail-row__label">Month</span>
                                <span className="detail-row__value">
                                    {formatMonth(selectedPayroll.month)}
                                </span>
                            </div>

                            <div className="detail-row">
                                <span className="detail-row__label">Year</span>
                                <span className="detail-row__value">{selectedPayroll.year}</span>
                            </div>

                            <div className="detail-row">
                                <span className="detail-row__label">Basic Salary</span>
                                <span className="detail-row__value num">
                                    {formatCurrency(selectedPayroll.basicSalary)}
                                </span>
                            </div>

                            <div className="detail-row">
                                <span className="detail-row__label">Allowances</span>
                                <span className="detail-row__value num">
                                    {formatCurrency(selectedPayroll.allowances)}
                                </span>
                            </div>

                            <div className="detail-row">
                                <span className="detail-row__label">Deductions</span>
                                <span className="detail-row__value num">
                                    {formatCurrency(selectedPayroll.deductions)}
                                </span>
                            </div>

                            <div className="detail-row">
                                <span className="detail-row__label">Net Salary</span>
                                <span className="detail-row__value num">
                                    {formatCurrency(selectedPayroll.netSalary)}
                                </span>
                            </div>

                            <div className="detail-row">
                                <span className="detail-row__label">Status</span>
                                <span className={statusPillClass(selectedPayroll.status)}>
                                    {formatStatus(selectedPayroll.status)}
                                </span>
                            </div>

                            <div className="detail-row">
                                <span className="detail-row__label">Remarks</span>
                                <span className="detail-row__value">
                                    {selectedPayroll.remarks || "--"}
                                </span>
                            </div>

                            {selectedPayroll.processedAt && (
                                <div className="detail-row">
                                    <span className="detail-row__label">Processed At</span>
                                    <span className="detail-row__value">
                                        {new Date(selectedPayroll.processedAt).toLocaleString()}
                                    </span>
                                </div>
                            )}

                            {selectedPayroll.paidAt && (
                                <div className="detail-row">
                                    <span className="detail-row__label">Paid At</span>
                                    <span className="detail-row__value">
                                        {new Date(selectedPayroll.paidAt).toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* PAYROLL ACTIONS */}

                        <div className="modal-view-actions">
                            {selectedPayroll.status === "pending" && (
                                <button
                                    className="btn btn--primary"
                                    onClick={() => processPayroll(selectedPayroll._id)}
                                    disabled={processingId === selectedPayroll._id}
                                >
                                    {processingId === selectedPayroll._id ? "Processing..." : "Process Payroll"}
                                </button>
                            )}

                            {selectedPayroll.status === "processed" && (
                                <button
                                    className="btn btn--primary"
                                    onClick={() => markPayrollPaid(selectedPayroll._id)}
                                    disabled={processingId === selectedPayroll._id}
                                >
                                    {processingId === selectedPayroll._id ? "Processing..." : "Mark as Paid"}
                                </button>
                            )}

                            {selectedPayroll.status !== "paid" && (
                                <button
                                    className="btn"
                                    onClick={() => openEdit(selectedPayroll)}
                                    disabled={processingId === selectedPayroll._id}
                                >
                                    Edit
                                </button>
                            )}

                            {selectedPayroll.status !== "paid" && (
                                <button
                                    className="btn btn--danger"
                                    onClick={() => deletePayroll(selectedPayroll._id)}
                                    disabled={deletingId === selectedPayroll._id}
                                >
                                    {deletingId === selectedPayroll._id ? "Deleting..." : "Delete"}
                                </button>
                            )}

                            <button
                                className="btn btn--text"
                                onClick={() => setSelectedPayroll(null)}
                                disabled={
                                    processingId === selectedPayroll._id ||
                                    deletingId === selectedPayroll._id
                                }
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HRPayroll;
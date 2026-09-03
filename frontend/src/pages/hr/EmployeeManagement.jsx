import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./EmployeeManagement.css";

const EmployeeManagement = () => {
    const navigate = useNavigate();

    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [saving, setSaving] = useState(false);

    const loadEmployees = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/employees");

            setEmployees(response.data.data.employees || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load employees"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEmployees();
    }, []);

    const toggleStatus = async (employee) => {
        const newStatus =
            employee.status === "active"
                ? "inactive"
                : "active";

        try {
            await api.patch(
                `/employees/${employee._id}/status`,
                {
                    status: newStatus
                }
            );

            await loadEmployees();
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Failed to update employee status"
            );
        }
    };

    const handleEditChange = (field, value) => {
        setEditingEmployee((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    const updateEmployee = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);

            await api.patch(
                `/employees/${editingEmployee._id}`,
                {
                    name: editingEmployee.name,
                    department: editingEmployee.department,
                    designation: editingEmployee.designation,
                    joiningDate:
                        editingEmployee.joiningDate || undefined,
                    salary:
                        editingEmployee.salary === ""
                            ? undefined
                            : Number(editingEmployee.salary)
                }
            );

            setEditingEmployee(null);
            await loadEmployees();

            alert("Employee updated successfully");
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Failed to update employee"
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="employee-management-loading">
                <p>Loading employees…</p>
            </div>
        );
    }

    const activeCount = employees.filter(
        (employee) => employee.status === "active"
    ).length;

    const inactiveCount = employees.filter(
        (employee) => employee.status === "inactive"
    ).length;

    return (
        <div className="employee-management-page">
            <div className="employee-management-container">
                <div className="employee-management-header">
                    <div>
                        <h1>Employee management</h1>
                        <p>Manage all employees</p>
                    </div>

                    <button
                        className="employee-management-back"
                        onClick={() => navigate("/hr-dashboard")}
                    >
                        Back to HR dashboard
                    </button>
                </div>

                {error && (
                    <div className="employee-management-error-banner">
                        <span>{error}</span>
                        <button
                            className="employee-management-retry-btn"
                            onClick={loadEmployees}
                        >
                            Retry
                        </button>
                    </div>
                )}

                <div className="employee-management-stats-grid">
                    <div className="employee-management-stat-card">
                        <p className="employee-management-stat-label">Total employees</p>
                        <p className="employee-management-stat-value">{employees.length}</p>
                    </div>

                    <div className="employee-management-stat-card employee-management-stat-card--active">
                        <p className="employee-management-stat-label">Active</p>
                        <p className="employee-management-stat-value">{activeCount}</p>
                    </div>

                    <div className="employee-management-stat-card employee-management-stat-card--inactive">
                        <p className="employee-management-stat-label">Inactive</p>
                        <p className="employee-management-stat-value">{inactiveCount}</p>
                    </div>
                </div>

                <div className="employee-management-table-card">
                    <div className="employee-management-table-wrapper">
                        <table className="employee-management-table">
                            <thead>
                                <tr>
                                    <th>Employee ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Department</th>
                                    <th>Designation</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {employees.length === 0 ? (
                                    <tr className="employee-management-empty-row">
                                        <td colSpan="7">No employees found</td>
                                    </tr>
                                ) : (
                                    employees.map((employee) => (
                                        <tr key={employee._id}>
                                            <td className="employee-management-id-cell">
                                                {employee.employeeId}
                                            </td>

                                            <td>{employee.name}</td>
                                            <td>{employee.email}</td>
                                            <td>{employee.department || "--"}</td>
                                            <td>{employee.designation || "--"}</td>

                                            <td>
                                                <span
                                                    className={`employee-management-status-pill employee-management-status-pill--${employee.status}`}
                                                >
                                                    {employee.status}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="employee-management-actions">
                                                    <button
                                                        className="employee-management-action-btn"
                                                        onClick={() => setSelectedEmployee(employee)}
                                                    >
                                                        View
                                                    </button>

                                                    <button
                                                        className="employee-management-action-btn"
                                                        onClick={() =>
                                                            setEditingEmployee({
                                                                ...employee,
                                                                joiningDate: employee.joiningDate
                                                                    ? employee.joiningDate.substring(0, 10)
                                                                    : "",
                                                                salary: employee.salary ?? ""
                                                            })
                                                        }
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        className={`employee-management-action-btn ${
                                                            employee.status === "active"
                                                                ? "employee-management-action-btn--deactivate"
                                                                : "employee-management-action-btn--activate"
                                                        }`}
                                                        onClick={() => toggleStatus(employee)}
                                                    >
                                                        {employee.status === "active"
                                                            ? "Deactivate"
                                                            : "Activate"}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {selectedEmployee && (
                    <div
                        className="employee-management-modal-overlay"
                        onClick={() => setSelectedEmployee(null)}
                    >
                        <div
                            className="employee-management-modal-card"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="employee-management-modal-title">Employee details</h2>

                            <div className="employee-management-detail-row">
                                <span className="employee-management-detail-label">ID</span>
                                <span className="employee-management-detail-value">
                                    {selectedEmployee.employeeId}
                                </span>
                            </div>

                            <div className="employee-management-detail-row">
                                <span className="employee-management-detail-label">Name</span>
                                <span className="employee-management-detail-value">
                                    {selectedEmployee.name}
                                </span>
                            </div>

                            <div className="employee-management-detail-row">
                                <span className="employee-management-detail-label">Email</span>
                                <span className="employee-management-detail-value">
                                    {selectedEmployee.email}
                                </span>
                            </div>

                            <div className="employee-management-detail-row">
                                <span className="employee-management-detail-label">Department</span>
                                <span className="employee-management-detail-value">
                                    {selectedEmployee.department || "--"}
                                </span>
                            </div>

                            <div className="employee-management-detail-row">
                                <span className="employee-management-detail-label">Designation</span>
                                <span className="employee-management-detail-value">
                                    {selectedEmployee.designation || "--"}
                                </span>
                            </div>

                            <div className="employee-management-detail-row">
                                <span className="employee-management-detail-label">Joining date</span>
                                <span className="employee-management-detail-value">
                                    {selectedEmployee.joiningDate
                                        ? new Date(selectedEmployee.joiningDate).toLocaleDateString()
                                        : "--"}
                                </span>
                            </div>

                            <div className="employee-management-detail-row">
                                <span className="employee-management-detail-label">Salary</span>
                                <span className="employee-management-detail-value">
                                    {selectedEmployee.salary ?? "--"}
                                </span>
                            </div>

                            <div className="employee-management-detail-row">
                                <span className="employee-management-detail-label">Status</span>
                                <span className="employee-management-detail-value">
                                    {selectedEmployee.status}
                                </span>
                            </div>

                            <button
                                className="employee-management-modal-close"
                                onClick={() => setSelectedEmployee(null)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}

                {editingEmployee && (
                    <div className="employee-management-modal-overlay">
                        <form
                            className="employee-management-modal-card"
                            onSubmit={updateEmployee}
                        >
                            <h2 className="employee-management-modal-title">Edit employee</h2>

                            <div className="employee-management-field">
                                <label htmlFor="edit-name">Name</label>
                                <input
                                    id="edit-name"
                                    type="text"
                                    value={editingEmployee.name || ""}
                                    onChange={(e) => handleEditChange("name", e.target.value)}
                                    required
                                />
                            </div>

                            <div className="employee-management-field">
                                <label htmlFor="edit-department">Department</label>
                                <input
                                    id="edit-department"
                                    type="text"
                                    value={editingEmployee.department || ""}
                                    onChange={(e) => handleEditChange("department", e.target.value)}
                                />
                            </div>

                            <div className="employee-management-field">
                                <label htmlFor="edit-designation">Designation</label>
                                <input
                                    id="edit-designation"
                                    type="text"
                                    value={editingEmployee.designation || ""}
                                    onChange={(e) => handleEditChange("designation", e.target.value)}
                                />
                            </div>

                            <div className="employee-management-field">
                                <label htmlFor="edit-joining-date">Joining date</label>
                                <input
                                    id="edit-joining-date"
                                    type="date"
                                    value={editingEmployee.joiningDate || ""}
                                    onChange={(e) => handleEditChange("joiningDate", e.target.value)}
                                />
                            </div>

                            <div className="employee-management-field">
                                <label htmlFor="edit-salary">Salary</label>
                                <input
                                    id="edit-salary"
                                    type="number"
                                    min="0"
                                    value={editingEmployee.salary}
                                    onChange={(e) => handleEditChange("salary", e.target.value)}
                                />
                            </div>

                            <div className="employee-management-form-actions">
                                <button
                                    type="submit"
                                    className="employee-management-save-btn"
                                    disabled={saving}
                                >
                                    {saving ? "Saving…" : "Save changes"}
                                </button>

                                <button
                                    type="button"
                                    className="employee-management-cancel-btn"
                                    onClick={() => setEditingEmployee(null)}
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

export default EmployeeManagement;
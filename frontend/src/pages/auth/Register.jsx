import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./Register.css";

const Register = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        department: "",
        designation: "",
        joiningDate: "",
        salary: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        try {
            setLoading(true);

            const {
                confirmPassword,
                ...registrationData
            } = formData;

            await api.post(
                "/auth/register",
                {
                    ...registrationData,
                    salary: Number(registrationData.salary)
                }
            );

            setSuccess(
                "Registration successful. Redirecting to login..."
            );

            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (err) {
            const message = err.response?.data?.message;
            const validationErrors = err.response?.data?.errors;

            if (validationErrors?.length) {
                alert(
                    `${message || "Validation failed"}\n\n` +
                    validationErrors
                        .map((item) => `• ${item.message}`)
                        .join("\n")
                );
            } else {
                alert(
                    message || "Registration failed"
                );
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">

            <div className="register-container">

                <div className="register-brand">

                    <div className="register-brand-mark">
                        XYZ
                    </div>

                    <div>
                        <h2>XYZ Technologies</h2>

                        <p>
                            Employee Attendance Management System
                        </p>
                    </div>

                </div>

                <div className="register-card">

                    <div className="register-header">

                        <h1>Create employee account</h1>

                        <p>
                            Register as an employee to access the
                            attendance management system.
                        </p>

                    </div>

                    {success && (
                        <div className="register-success">
                            {success}
                        </div>
                    )}

                    <form
                        className="register-form"
                        onSubmit={handleSubmit}
                    >

                        <div className="register-grid">

                            <div className="register-field">

                                <label htmlFor="name">
                                    Full name
                                </label>

                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter full name"
                                    required
                                />

                            </div>

                            <div className="register-field">

                                <label htmlFor="email">
                                    Email
                                </label>

                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter email address"
                                    required
                                />

                            </div>

                            <div className="register-field">

                                <label htmlFor="department">
                                    Department
                                </label>

                                <input
                                    id="department"
                                    name="department"
                                    type="text"
                                    value={formData.department}
                                    onChange={handleChange}
                                    placeholder="e.g. Information Technology"
                                    required
                                />

                            </div>

                            <div className="register-field">

                                <label htmlFor="designation">
                                    Designation
                                </label>

                                <input
                                    id="designation"
                                    name="designation"
                                    type="text"
                                    value={formData.designation}
                                    onChange={handleChange}
                                    placeholder="e.g. Software Developer"
                                    required
                                />

                            </div>

                            <div className="register-field">

                                <label htmlFor="joiningDate">
                                    Joining date
                                </label>

                                <input
                                    id="joiningDate"
                                    name="joiningDate"
                                    type="date"
                                    value={formData.joiningDate}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                            <div className="register-field">

                                <label htmlFor="salary">
                                    Salary
                                </label>

                                <input
                                    id="salary"
                                    name="salary"
                                    type="number"
                                    min="0"
                                    value={formData.salary}
                                    onChange={handleChange}
                                    placeholder="Enter salary"
                                    required
                                />

                            </div>

                            <div className="register-field">

                                <label htmlFor="password">
                                    Password
                                </label>

                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Create password"
                                    required
                                />

                            </div>

                            <div className="register-field">

                                <label htmlFor="confirmPassword">
                                    Confirm password
                                </label>

                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm password"
                                    required
                                />

                            </div>

                        </div>

                        <button
                            type="submit"
                            className="register-submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Creating account..."
                                : "Create account"}
                        </button>

                    </form>

                    <div className="register-footer">

                        <span>
                            Already have an account?
                        </span>

                        <Link to="/login">
                            Back to login
                        </Link>

                    </div>

                </div>

                <div className="register-note">

                    Employee registration only · HR accounts are managed
                    separately by the organization

                </div>

            </div>

        </div>
    );
};

export default Register;
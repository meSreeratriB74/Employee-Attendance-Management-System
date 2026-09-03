import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Dashboard from "../pages/employee/Dashboard";
import AttendanceHistory from "../pages/employee/AttendanceHistory";
import LeaveManagement from "../pages/employee/LeaveManagement";

import HRDashboard from "../pages/hr/HRDashboard";
import EmployeeManagement from "../pages/hr/EmployeeManagement";
import HRAttendance from "../pages/hr/HRAttendance";
import HRLeaveManagement from "../pages/hr/HRLeaveManagement";
import HRPayroll from "../pages/hr/HRPayroll";

import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();

    return isAuthenticated
        ? children
        : <Navigate to="/login" replace />;
};

const RoleRoute = ({ children, role }) => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== role) {
        return (
            <Navigate
                to={user.role === "hr" ? "/hr-dashboard" : "/dashboard"}
                replace
            />
        );
    }

    return children;
};

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route path="/register" element={<Register />} />

                {/* Employee Routes */}

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <RoleRoute role="employee">
                                <Dashboard />
                            </RoleRoute>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/attendance-history"
                    element={
                        <ProtectedRoute>
                            <RoleRoute role="employee">
                                <AttendanceHistory />
                            </RoleRoute>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/leave"
                    element={
                        <ProtectedRoute>
                            <RoleRoute role="employee">
                                <LeaveManagement />
                            </RoleRoute>
                        </ProtectedRoute>
                    }
                />

                {/* HR Routes */}

                <Route
                    path="/hr-dashboard"
                    element={
                        <ProtectedRoute>
                            <RoleRoute role="hr">
                                <HRDashboard />
                            </RoleRoute>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/hr/employees"
                    element={
                        <ProtectedRoute>
                            <RoleRoute role="hr">
                                <EmployeeManagement />
                            </RoleRoute>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/hr/attendance"
                    element={
                        <ProtectedRoute>
                            <RoleRoute role="hr">
                                <HRAttendance />
                            </RoleRoute>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/hr/leaves"
                    element={
                        <ProtectedRoute>
                            <RoleRoute role="hr">
                                <HRLeaveManagement />
                            </RoleRoute>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/hr/payroll"
                    element={
                        <ProtectedRoute>
                            <RoleRoute role="hr">
                                <HRPayroll />
                            </RoleRoute>
                        </ProtectedRoute>
                    }
                />

                {/* Default */}

                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/dashboard"
                            replace
                        />
                    }
                />

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/dashboard"
                            replace
                        />
                    }
                />

            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../App.css";

function useClock() {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    return now;
}

function formatTime(date) {
    return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });
}

function formatDate(date) {
    return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
    });
}

const Login = () => {
    const navigate = useNavigate();
    const { login, loading } = useAuth();
    const now = useClock();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const result = await login(email, password);

        if (result.success) {
            navigate("/dashboard");
        } else {
            setError(result.message || "Login failed");
        }
    };

    return (
        <div className="login-page">

            <aside className="login-brand">

                <div className="login-brand__mark">
                    <span className="login-brand__mark-dot" />
                    XYZ
                </div>

                <div className="login-brand__clock">
                    <div className="login-brand__time">
                        {formatTime(now)}
                    </div>

                    <div className="login-brand__date">
                        {formatDate(now)}
                    </div>
                </div>

                <p className="login-brand__tagline">
                    Every clock-in, accounted for.
                </p>

                <div className="login-brand__footer">
                    © {now.getFullYear()} XYZ Workforce
                </div>

            </aside>

            <div className="login-form-panel">

                <div className="login-container">

                    <h1>Sign in</h1>

                    <h2>
                        Use your work email and password to clock in for today.
                    </h2>

                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        <div>
                            <label htmlFor="email">
                                Email
                            </label>

                            <input
                                id="email"
                                type="email"
                                autoComplete="username"
                                placeholder="Enter email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password">
                                Password
                            </label>

                            <input
                                id="password"
                                type="password"
                                autoComplete="current-password"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="login-options">

                            <label htmlFor="remember">
                                <input
                                    id="remember"
                                    type="checkbox"
                                    checked={remember}
                                    onChange={(e) =>
                                        setRemember(e.target.checked)
                                    }
                                />

                                Remember this device
                            </label>

                            <a href="/forgot-password">
                                Forgot password?
                            </a>

                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Logging in…"
                                : "Sign in"}
                        </button>

                    </form>

                    <div className="login-register-link">
                        <span>New employee?</span>

                        <Link to="/register">
                            Create an account
                        </Link>
                    </div>

                    <p className="login-footnote">
                        Having trouble signing in? Contact your HR administrator.
                    </p>

                </div>

            </div>

        </div>
    );
};

export default Login;
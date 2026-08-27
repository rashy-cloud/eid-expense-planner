import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
    const [username, setUsername] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [error, setError] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();


    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            await login(
                username,
                password
            );

            navigate(
                "/dashboard"
            );

        } catch (error) {
            console.error(
                "Login error:",
                error
            );

            setError(
                "Invalid username or password."
            );

        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="auth-wrapper">

            <div className="card auth-card shadow">

                <div className="card-body p-4 p-md-5">

                    <div className="auth-logo">
                        🌙{" "}
                        <strong>
                            Eid
                        </strong>
                        <span>
                            Plan
                        </span>
                    </div>


                    <div className="text-center mb-4">

                        <h2>
                            Welcome Back
                        </h2>

                        <p className="text-muted">
                            Sign in to manage your
                            Eid budget and expenses.
                        </p>

                    </div>


                    {error && (

                        <div className="alert alert-danger">
                            {error}
                        </div>

                    )}


                    <form
                        onSubmit={
                            handleSubmit
                        }
                    >

                        <div className="mb-3">

                            <label className="form-label">
                                Username
                            </label>

                            <input
                                type="text"
                                className="form-control"
                                value={
                                    username
                                }
                                onChange={(e) =>
                                    setUsername(
                                        e.target.value
                                    )
                                }
                                placeholder="Enter your username"
                                required
                            />

                        </div>


                        <div className="mb-4">

                            <label className="form-label">
                                Password
                            </label>

                            <input
                                type="password"
                                className="form-control"
                                value={
                                    password
                                }
                                onChange={(e) =>
                                    setPassword(
                                        e.target.value
                                    )
                                }
                                placeholder="Enter your password"
                                required
                            />

                        </div>


                        <button
                            type="submit"
                            className="btn btn-primary w-100"
                            disabled={
                                loading
                            }
                        >

                            {loading
                                ? "Signing in..."
                                : "Login"}

                        </button>

                    </form>


                    <div className="text-center mt-4">

                        <span className="text-muted">
                            Don't have an account?{" "}
                        </span>

                        <Link
                            to="/register"
                            className="fw-bold"
                        >
                            Create Account
                        </Link>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Login;
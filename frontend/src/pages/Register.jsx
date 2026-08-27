import { useState } from "react";
import {
    Link,
    useNavigate,
} from "react-router-dom";

import API from "../services/api";


function Register() {
    const navigate =
        useNavigate();

    const [formData, setFormData] =
        useState({
            username: "",
            email: "",
            password: "",
        });

    const [error, setError] =
        useState("");

    const [loading, setLoading] =
        useState(false);


    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]:
                e.target.value,
        });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            await API.post(
                "/accounts/register/",
                formData
            );

            navigate(
                "/login"
            );

        } catch (error) {
            console.error(
                "Registration error:",
                error
            );

            setError(
                "Registration failed. Please check your details."
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
                            Create Account
                        </h2>

                        <p className="text-muted">
                            Start planning your Eid
                            spending more effectively.
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
                                name="username"
                                value={
                                    formData.username
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            />

                        </div>


                        <div className="mb-3">

                            <label className="form-label">
                                Email Address
                            </label>

                            <input
                                type="email"
                                className="form-control"
                                name="email"
                                value={
                                    formData.email
                                }
                                onChange={
                                    handleChange
                                }
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
                                name="password"
                                value={
                                    formData.password
                                }
                                onChange={
                                    handleChange
                                }
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
                                ? "Creating Account..."
                                : "Create Account"}

                        </button>

                    </form>


                    <div className="text-center mt-4">

                        <span className="text-muted">
                            Already have an account?{" "}
                        </span>

                        <Link
                            to="/login"
                            className="fw-bold"
                        >
                            Login
                        </Link>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Register;
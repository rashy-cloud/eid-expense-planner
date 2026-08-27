import {
    Link,
    useLocation,
    useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();

        navigate(
            "/login",
            {
                replace: true,
            }
        );
    };

    const linkClass = (path) => {
        return location.pathname === path
            ? "nav-link active"
            : "nav-link";
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark eid-navbar">

            <div className="container">

                <Link
                    className="navbar-brand eid-brand"
                    to="/dashboard"
                >
                    🌙 Eid<span>Plan</span>
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#eidNavbar"
                    aria-controls="eidNavbar"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon" />
                </button>

                <div
                    className="collapse navbar-collapse"
                    id="eidNavbar"
                >

                    <ul className="navbar-nav me-auto">

                        <li className="nav-item">
                            <Link
                                className={
                                    linkClass(
                                        "/dashboard"
                                    )
                                }
                                to="/dashboard"
                            >
                                Dashboard
                            </Link>
                        </li>

                        <li className="nav-item">
                            <Link
                                className={
                                    linkClass(
                                        "/budget"
                                    )
                                }
                                to="/budget"
                            >
                                Budget Planner
                            </Link>
                        </li>

                        <li className="nav-item">
                            <Link
                                className={
                                    linkClass(
                                        "/expenses"
                                    )
                                }
                                to="/expenses"
                            >
                                Expenses
                            </Link>
                        </li>

                    </ul>

                    <button
                        type="button"
                        className="eid-logout"
                        onClick={
                            handleLogout
                        }
                    >
                        Logout
                    </button>

                </div>

            </div>

        </nav>
    );
}

export default Navbar;
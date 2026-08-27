import {
    BrowserRouter,
    Routes,
    Route,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Budget from "./pages/Budget";
import Expenses from "./pages/Expenses";

import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";


function App() {
    return (
        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />


                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <AppLayout>
                                <Dashboard />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />


                <Route
                    path="/budget"
                    element={
                        <ProtectedRoute>
                            <AppLayout>
                                <Budget />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />


                <Route
                    path="/expenses"
                    element={
                        <ProtectedRoute>
                            <AppLayout>
                                <Expenses />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;
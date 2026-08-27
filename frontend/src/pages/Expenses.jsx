import { useEffect, useState } from "react";
import API from "../services/api";

function Expenses() {
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);

    const [formData, setFormData] = useState({
        category: "",
        amount: "",
        description: "",
        expense_date: "",
    });

    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setError("");

            const [
                expensesResponse,
                categoriesResponse,
            ] = await Promise.all([
                API.get("/expenses/"),
                API.get("/budgets/categories/"),
            ]);

            setExpenses(
                expensesResponse.data || []
            );

            setCategories(
                categoriesResponse.data || []
            );

        } catch (error) {
            console.error(
                "Expense loading error:",
                error
            );

            setError(
                "Unable to load expenses."
            );

        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const resetForm = () => {
        setFormData({
            category: "",
            amount: "",
            description: "",
            expense_date: "",
        });

        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        const amountValue =
            Number(formData.amount);

        if (
            Number.isNaN(amountValue) ||
            amountValue <= 0
        ) {
            setError(
                "Expense amount must be greater than £0."
            );
            return;
        }

        try {
            const budgetResponse =
                await API.get("/budgets/");

            if (
                !budgetResponse.data ||
                budgetResponse.data.length === 0
            ) {
                setError(
                    "Please create a budget first."
                );
                return;
            }

            const budgetId =
                budgetResponse.data[0].id;

            const expenseData = {
                budget: budgetId,
                category: Number(
                    formData.category
                ),
                amount: formData.amount,
                description:
                    formData.description.trim(),
                expense_date:
                    formData.expense_date,
            };

            if (editingId) {
                await API.put(
                    `/expenses/${editingId}/`,
                    expenseData
                );

                setMessage(
                    "Expense updated successfully."
                );
            } else {
                await API.post(
                    "/expenses/",
                    expenseData
                );

                setMessage(
                    "Expense added successfully."
                );
            }

            resetForm();
            await fetchData();

        } catch (error) {
            console.error(
                "Expense save error:",
                error
            );

            setError(
                error.response?.data
                    ? JSON.stringify(
                          error.response.data
                      )
                    : "Unable to save expense."
            );
        }
    };

    const handleEdit = (expense) => {
        setEditingId(expense.id);

        setFormData({
            category:
                String(expense.category),
            amount:
                expense.amount,
            description:
                expense.description || "",
            expense_date:
                expense.expense_date,
        });

        setMessage("");
        setError("");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const handleDelete = async (
        expenseId
    ) => {
        const confirmed =
            window.confirm(
                "Are you sure you want to delete this expense?"
            );

        if (!confirmed) {
            return;
        }

        setMessage("");
        setError("");

        try {
            await API.delete(
                `/expenses/${expenseId}/`
            );

            if (editingId === expenseId) {
                resetForm();
            }

            setMessage(
                "Expense deleted successfully."
            );

            await fetchData();

        } catch (error) {
            console.error(
                "Expense delete error:",
                error
            );

            setError(
                "Unable to delete expense."
            );
        }
    };

    const totalExpenses =
        expenses.reduce(
            (total, expense) =>
                total +
                Number(
                    expense.amount || 0
                ),
            0
        );

    if (loading) {
        return (
            <div className="container eid-page">

                <div className="text-center py-5">

                    <h3>
                        Loading expenses...
                    </h3>

                    <p className="text-muted">
                        Preparing your Eid expense records.
                    </p>

                </div>

            </div>
        );
    }

    return (
        <div className="container eid-page">

            {/* PAGE HEADER */}

            <div className="eid-page-header">

                <h1>
                    💷 Expense Manager
                </h1>

                <p className="text-muted">
                    Record, edit and manage your
                    Eid expenses in one place.
                </p>

            </div>


            {/* MESSAGES */}

            {message && (
                <div className="alert alert-success">
                    {message}
                </div>
            )}

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}


            {/* SUMMARY */}

            <div className="row mb-4">

                <div className="col-md-6 mb-3">

                    <div className="card eid-stat-card h-100">

                        <div className="card-body">

                            <div className="eid-stat-label">
                                Number of Expenses
                            </div>

                            <div className="eid-stat-value">
                                {expenses.length}
                            </div>

                        </div>

                    </div>

                </div>


                <div className="col-md-6 mb-3">

                    <div className="card eid-stat-card gold h-100">

                        <div className="card-body">

                            <div className="eid-stat-label">
                                Total Recorded Spending
                            </div>

                            <div className="eid-stat-value">
                                £
                                {totalExpenses.toFixed(
                                    2
                                )}
                            </div>

                        </div>

                    </div>

                </div>

            </div>


            {/* ADD / EDIT EXPENSE */}

            <div className="card mb-5">

                <div className="card-body">

                    <div className="eid-section-title">

                        <h3 className="mb-0">

                            {editingId
                                ? "✏️ Edit Expense"
                                : "➕ Add Expense"}

                        </h3>

                    </div>

                    <p className="eid-section-subtitle">

                        {editingId
                            ? "Update the details of your selected expense."
                            : "Record a new expense against your Eid budget."}

                    </p>


                    <form
                        onSubmit={handleSubmit}
                    >

                        <div className="row">


                            {/* CATEGORY */}

                            <div className="col-md-6 mb-3">

                                <label className="form-label">
                                    Category
                                </label>

                                <select
                                    className="form-select"
                                    name="category"
                                    value={
                                        formData.category
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                >

                                    <option value="">
                                        Select category
                                    </option>

                                    {categories.map(
                                        (category) => (

                                            <option
                                                key={
                                                    category.id
                                                }
                                                value={
                                                    category.id
                                                }
                                            >
                                                {
                                                    category.name
                                                }
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* AMOUNT */}

                            <div className="col-md-6 mb-3">

                                <label className="form-label">
                                    Amount (£)
                                </label>

                                <input
                                    type="number"
                                    className="form-control"
                                    name="amount"
                                    value={
                                        formData.amount
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    min="0.01"
                                    step="0.01"
                                    placeholder="e.g. 45.00"
                                    required
                                />

                            </div>


                            {/* DESCRIPTION */}

                            <div className="col-md-6 mb-3">

                                <label className="form-label">
                                    Description
                                </label>

                                <input
                                    type="text"
                                    className="form-control"
                                    name="description"
                                    value={
                                        formData.description
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="e.g. Eid groceries"
                                    required
                                />

                            </div>


                            {/* DATE */}

                            <div className="col-md-6 mb-3">

                                <label className="form-label">
                                    Expense Date
                                </label>

                                <input
                                    type="date"
                                    className="form-control"
                                    name="expense_date"
                                    value={
                                        formData.expense_date
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />

                            </div>

                        </div>


                        <button
                            type="submit"
                            className={
                                editingId
                                    ? "btn btn-warning me-2"
                                    : "btn btn-primary me-2"
                            }
                        >

                            {editingId
                                ? "Update Expense"
                                : "Add Expense"}

                        </button>


                        {editingId && (

                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={
                                    resetForm
                                }
                            >
                                Cancel Edit
                            </button>

                        )}

                    </form>

                </div>

            </div>


            {/* RECENT EXPENSES */}

            <div className="mb-3">

                <div className="eid-section-title">

                    <h3 className="mb-0">
                        Recent Expenses
                    </h3>

                </div>

                <p className="eid-section-subtitle">
                    Review and manage your recorded
                    Eid spending.
                </p>

            </div>


            {expenses.length === 0 ? (

                <div className="alert alert-info">

                    You haven't recorded any
                    expenses yet.

                </div>

            ) : (

                <div className="card">

                    <div className="card-body p-0">

                        <div className="table-responsive">

                            <table className="table table-hover align-middle mb-0">

                                <thead>

                                    <tr>

                                        <th>
                                            Category
                                        </th>

                                        <th>
                                            Description
                                        </th>

                                        <th>
                                            Amount
                                        </th>

                                        <th>
                                            Date
                                        </th>

                                        <th>
                                            Actions
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {expenses.map(
                                        (expense) => (

                                            <tr
                                                key={
                                                    expense.id
                                                }
                                            >

                                                <td>
                                                    <strong>
                                                        {
                                                            expense.category_name
                                                        }
                                                    </strong>
                                                </td>

                                                <td>
                                                    {
                                                        expense.description
                                                    }
                                                </td>

                                                <td>
                                                    <strong>
                                                        £
                                                        {Number(
                                                            expense.amount
                                                        ).toFixed(
                                                            2
                                                        )}
                                                    </strong>
                                                </td>

                                                <td>
                                                    {
                                                        expense.expense_date
                                                    }
                                                </td>

                                                <td>

                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-warning me-2"
                                                        onClick={() =>
                                                            handleEdit(
                                                                expense
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() =>
                                                            handleDelete(
                                                                expense.id
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </button>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default Expenses;
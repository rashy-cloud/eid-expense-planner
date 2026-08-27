import { useEffect, useState } from "react";
import API from "../services/api";

function Budget() {
    const [budget, setBudget] = useState(null);
    const [categories, setCategories] = useState([]);
    const [allocations, setAllocations] = useState([]);

    const [budgetForm, setBudgetForm] = useState({
        eid_type: "FITR",
        total_budget: "",
        savings_goal: "",
        current_savings: "",
        target_date: "",
    });

    const [allocationForm, setAllocationForm] = useState({
        category: "",
        allocated_amount: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        loadBudgetData();
    }, []);

    const loadBudgetData = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                budgetResponse,
                categoryResponse,
            ] = await Promise.all([
                API.get("/budgets/"),
                API.get("/budgets/categories/"),
            ]);

            setCategories(
                categoryResponse.data || []
            );

            if (
                budgetResponse.data &&
                budgetResponse.data.length > 0
            ) {
                const existingBudget =
                    budgetResponse.data[0];

                setBudget(existingBudget);

                setBudgetForm({
                    eid_type:
                        existingBudget.eid_type ||
                        "FITR",

                    total_budget:
                        existingBudget.total_budget ||
                        "",

                    savings_goal:
                        existingBudget.savings_goal ||
                        "",

                    current_savings:
                        existingBudget.current_savings ||
                        "",

                    target_date:
                        existingBudget.target_date ||
                        "",
                });

                const allocationResponse =
                    await API.get(
                        `/budgets/allocations/?budget=${existingBudget.id}`
                    );

                setAllocations(
                    allocationResponse.data || []
                );

            } else {
                setBudget(null);
                setAllocations([]);
            }

        } catch (error) {
            console.error(
                "Budget loading error:",
                error
            );

            console.error(
                "Backend response:",
                error.response?.data
            );

            setError(
                "Unable to load your budget information."
            );

        } finally {
            setLoading(false);
        }
    };

    const handleBudgetChange = (e) => {
        setBudgetForm({
            ...budgetForm,
            [e.target.name]: e.target.value,
        });
    };

    const handleAllocationChange = (e) => {
        setAllocationForm({
            ...allocationForm,
            [e.target.name]: e.target.value,
        });
    };

    const saveBudget = async (e) => {
        e.preventDefault();

        setSaving(true);
        setMessage("");
        setError("");

        const totalBudgetValue =
            Number(
                budgetForm.total_budget
            );

        const savingsGoalValue =
            Number(
                budgetForm.savings_goal || 0
            );

        const currentSavingsValue =
            Number(
                budgetForm.current_savings || 0
            );

        const targetDateValue =
            new Date(
                `${budgetForm.target_date}T00:00:00`
            );

        const today =
            new Date();

        today.setHours(
            0,
            0,
            0,
            0
        );

        if (
            Number.isNaN(
                totalBudgetValue
            ) ||
            totalBudgetValue <= 0
        ) {
            setError(
                "Total budget must be greater than £0."
            );

            setSaving(false);
            return;
        }

        if (
            Number.isNaN(
                savingsGoalValue
            ) ||
            savingsGoalValue < 0
        ) {
            setError(
                "Savings goal cannot be negative."
            );

            setSaving(false);
            return;
        }

        if (
            Number.isNaN(
                currentSavingsValue
            ) ||
            currentSavingsValue < 0
        ) {
            setError(
                "Amount already saved cannot be negative."
            );

            setSaving(false);
            return;
        }

        if (
            currentSavingsValue >
            savingsGoalValue
        ) {
            setError(
                "Amount already saved cannot exceed the savings goal."
            );

            setSaving(false);
            return;
        }

        if (
            !budgetForm.target_date ||
            Number.isNaN(
                targetDateValue.getTime()
            )
        ) {
            setError(
                "Please select a valid target date."
            );

            setSaving(false);
            return;
        }

        if (
            targetDateValue <= today
        ) {
            setError(
                "Target date must be in the future."
            );

            setSaving(false);
            return;
        }

        const existingAllocated =
            allocations.reduce(
                (
                    total,
                    allocation
                ) =>
                    total +
                    Number(
                        allocation
                            .allocated_amount ||
                            0
                    ),
                0
            );

        if (
            totalBudgetValue <
            existingAllocated
        ) {
            setError(
                `Your total budget cannot be lower than the £${existingAllocated.toFixed(
                    2
                )} already allocated across categories.`
            );

            setSaving(false);
            return;
        }

        try {
            let response;

            if (budget) {
                response =
                    await API.put(
                        `/budgets/${budget.id}/`,
                        budgetForm
                    );
            } else {
                response =
                    await API.post(
                        "/budgets/",
                        budgetForm
                    );
            }

            setBudget(
                response.data
            );

            setMessage(
                budget
                    ? "Budget updated successfully."
                    : "Budget created successfully."
            );

            await loadBudgetData();

        } catch (error) {
            console.error(
                "Budget save error:",
                error
            );

            setError(
                error.response?.data
                    ? JSON.stringify(
                        error.response.data
                    )
                    : "Unable to save your budget."
            );

        } finally {
            setSaving(false);
        }
    };

    const addAllocation = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (!budget) {
            setError(
                "Please create your budget first."
            );
            return;
        }

        const amount =
            Number(
                allocationForm
                    .allocated_amount
            );

        if (
            !allocationForm.category ||
            Number.isNaN(amount) ||
            amount <= 0
        ) {
            setError(
                "Please select a category and enter an amount greater than £0."
            );
            return;
        }

        const totalAllocated =
            allocations.reduce(
                (
                    total,
                    allocation
                ) =>
                    total +
                    Number(
                        allocation
                            .allocated_amount ||
                            0
                    ),
                0
            );

        const totalBudget =
            Number(
                budget.total_budget ||
                0
            );

        if (
            totalAllocated +
            amount >
            totalBudget
        ) {
            setError(
                "This allocation would exceed your total budget."
            );
            return;
        }

        const alreadyAllocated =
            allocations.some(
                (allocation) =>
                    Number(
                        allocation.category
                    ) ===
                    Number(
                        allocationForm.category
                    )
            );

        if (alreadyAllocated) {
            setError(
                "This category already has a budget allocation."
            );
            return;
        }

        try {
            const response =
                await API.post(
                    "/budgets/allocations/",
                    {
                        budget:
                            budget.id,

                        category:
                            Number(
                                allocationForm
                                    .category
                            ),

                        allocated_amount:
                            allocationForm
                                .allocated_amount,
                    }
                );

            setAllocations([
                ...allocations,
                response.data,
            ]);

            setAllocationForm({
                category: "",
                allocated_amount: "",
            });

            setMessage(
                "Category allocation added successfully."
            );

        } catch (error) {
            console.error(
                "Allocation error:",
                error
            );

            setError(
                error.response?.data
                    ? JSON.stringify(
                        error.response.data
                    )
                    : "Unable to add allocation."
            );
        }
    };

    const deleteAllocation = async (
        allocationId
    ) => {
        const confirmed =
            window.confirm(
                "Are you sure you want to remove this allocation?"
            );

        if (!confirmed) {
            return;
        }

        setMessage("");
        setError("");

        try {
            await API.delete(
                `/budgets/allocations/${allocationId}/`
            );

            setAllocations(
                allocations.filter(
                    (allocation) =>
                        allocation.id !==
                        allocationId
                )
            );

            setMessage(
                "Allocation removed successfully."
            );

        } catch (error) {
            console.error(
                "Delete allocation error:",
                error
            );

            setError(
                "Unable to remove allocation."
            );
        }
    };

    const totalBudget =
        Number(
            budget?.total_budget || 0
        );

    const totalAllocated =
        allocations.reduce(
            (
                total,
                allocation
            ) =>
                total +
                Number(
                    allocation
                        .allocated_amount ||
                        0
                ),
            0
        );

    const unallocated =
        totalBudget -
        totalAllocated;

    const allocationPercentage =
        totalBudget > 0
            ? Math.min(
                (
                    totalAllocated /
                    totalBudget
                ) * 100,
                100
            )
            : 0;

    if (loading) {
        return (
            <div className="container eid-page">

                <div className="text-center py-5">

                    <h3>
                        Loading budget...
                    </h3>

                    <p className="text-muted">
                        Preparing your Eid budget information.
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
                    🌙 Eid Budget Planner
                </h1>

                <p className="text-muted">
                    Create your Eid budget,
                    set your savings goal and
                    allocate money across your
                    planned spending categories.
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


            {/* SUMMARY CARDS */}

            <div className="row mb-4">

                <div className="col-md-4 mb-3">

                    <div className="card eid-stat-card h-100">

                        <div className="card-body">

                            <div className="eid-stat-label">
                                Total Budget
                            </div>

                            <div className="eid-stat-value">
                                £
                                {totalBudget.toFixed(
                                    2
                                )}
                            </div>

                        </div>

                    </div>

                </div>


                <div className="col-md-4 mb-3">

                    <div className="card eid-stat-card gold h-100">

                        <div className="card-body">

                            <div className="eid-stat-label">
                                Allocated
                            </div>

                            <div className="eid-stat-value">
                                £
                                {totalAllocated.toFixed(
                                    2
                                )}
                            </div>

                        </div>

                    </div>

                </div>


                <div className="col-md-4 mb-3">

                    <div
                        className={
                            unallocated < 0
                                ? "card eid-stat-card danger h-100"
                                : "card eid-stat-card h-100"
                        }
                    >

                        <div className="card-body">

                            <div className="eid-stat-label">
                                Unallocated
                            </div>

                            <div
                                className={
                                    unallocated < 0
                                        ? "eid-stat-value text-danger"
                                        : "eid-stat-value"
                                }
                            >
                                £
                                {unallocated.toFixed(
                                    2
                                )}
                            </div>

                        </div>

                    </div>

                </div>

            </div>


            {/* BUDGET DETAILS */}

            <div className="card mb-5">

                <div className="card-body">

                    <div className="eid-section-title">

                        <h3 className="mb-0">
                            Budget Details
                        </h3>

                    </div>

                    <p className="eid-section-subtitle">
                        Set the main details for
                        your Eid spending and
                        savings plan.
                    </p>


                    <form
                        onSubmit={
                            saveBudget
                        }
                    >

                        <div className="row">


                            {/* EID TYPE */}

                            <div className="col-md-6 mb-3">

                                <label className="form-label">
                                    Eid Type
                                </label>

                                <select
                                    className="form-select"
                                    name="eid_type"
                                    value={
                                        budgetForm
                                            .eid_type
                                    }
                                    onChange={
                                        handleBudgetChange
                                    }
                                    required
                                >

                                    <option value="FITR">
                                        Eid al-Fitr
                                    </option>

                                    <option value="ADHA">
                                        Eid al-Adha
                                    </option>

                                </select>

                            </div>


                            {/* TOTAL BUDGET */}

                            <div className="col-md-6 mb-3">

                                <label className="form-label">
                                    Total Budget (£)
                                </label>

                                <input
                                    type="number"
                                    className="form-control"
                                    name="total_budget"
                                    value={
                                        budgetForm
                                            .total_budget
                                    }
                                    onChange={
                                        handleBudgetChange
                                    }
                                    min="0.01"
                                    step="0.01"
                                    placeholder="e.g. 1500"
                                    required
                                />

                            </div>


                            {/* SAVINGS GOAL */}

                            <div className="col-md-6 mb-3">

                                <label className="form-label">
                                    Savings Goal (£)
                                </label>

                                <input
                                    type="number"
                                    className="form-control"
                                    name="savings_goal"
                                    value={
                                        budgetForm
                                            .savings_goal
                                    }
                                    onChange={
                                        handleBudgetChange
                                    }
                                    min="0"
                                    step="0.01"
                                    placeholder="e.g. 500"
                                />

                            </div>


                            {/* CURRENT SAVINGS */}

                            <div className="col-md-6 mb-3">

                                <label className="form-label">
                                    Amount Already Saved (£)
                                </label>

                                <input
                                    type="number"
                                    className="form-control"
                                    name="current_savings"
                                    value={
                                        budgetForm
                                            .current_savings
                                    }
                                    onChange={
                                        handleBudgetChange
                                    }
                                    min="0"
                                    step="0.01"
                                    placeholder="e.g. 150"
                                />

                            </div>


                            {/* TARGET DATE */}

                            <div className="col-md-6 mb-3">

                                <label className="form-label">
                                    Target Date
                                </label>

                                <input
                                    type="date"
                                    className="form-control"
                                    name="target_date"
                                    value={
                                        budgetForm
                                            .target_date
                                    }
                                    onChange={
                                        handleBudgetChange
                                    }
                                    required
                                />

                            </div>

                        </div>


                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={
                                saving
                            }
                        >

                            {saving
                                ? "Saving..."
                                : budget
                                ? "Update Budget"
                                : "Create Budget"}

                        </button>

                    </form>

                </div>

            </div>


            {/* ALLOCATION PROGRESS */}

            <div className="card mb-5">

                <div className="card-body">

                    <div className="d-flex justify-content-between align-items-center">

                        <div>

                            <h5 className="mb-1">
                                Budget Allocation Progress
                            </h5>

                            <small className="text-muted">
                                Track how much of your
                                total budget has been
                                assigned to categories.
                            </small>

                        </div>

                        <strong>
                            {allocationPercentage.toFixed(
                                1
                            )}
                            %
                        </strong>

                    </div>


                    <div className="progress mt-3">

                        <div
                            className="progress-bar bg-success"
                            role="progressbar"
                            style={{
                                width:
                                    `${allocationPercentage}%`,
                            }}
                            aria-valuenow={
                                allocationPercentage
                            }
                            aria-valuemin="0"
                            aria-valuemax="100"
                        >

                            {allocationPercentage.toFixed(
                                1
                            )}
                            %

                        </div>

                    </div>

                </div>

            </div>


            {/* ADD ALLOCATION */}

            <div className="card mb-5">

                <div className="card-body">

                    <div className="eid-section-title">

                        <h3 className="mb-0">
                            ➕ Add Category Allocation
                        </h3>

                    </div>

                    <p className="eid-section-subtitle">
                        Divide your Eid budget
                        between different spending
                        categories.
                    </p>


                    {!budget ? (

                        <div className="alert alert-info">
                            Create your budget
                            first, then add category
                            allocations.
                        </div>

                    ) : (

                        <form
                            onSubmit={
                                addAllocation
                            }
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
                                            allocationForm
                                                .category
                                        }
                                        onChange={
                                            handleAllocationChange
                                        }
                                        required
                                    >

                                        <option value="">
                                            Select category
                                        </option>

                                        {categories
                                            .filter(
                                                (
                                                    category
                                                ) =>
                                                    budgetForm
                                                        .eid_type ===
                                                        "ADHA" ||
                                                    !category
                                                        .is_adha_only
                                            )
                                            .map(
                                                (
                                                    category
                                                ) => (

                                                    <option
                                                        key={
                                                            category
                                                                .id
                                                        }
                                                        value={
                                                            category
                                                                .id
                                                        }
                                                    >
                                                        {
                                                            category
                                                                .name
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
                                        name="allocated_amount"
                                        value={
                                            allocationForm
                                                .allocated_amount
                                        }
                                        onChange={
                                            handleAllocationChange
                                        }
                                        min="0.01"
                                        step="0.01"
                                        placeholder="e.g. 400"
                                        required
                                    />

                                </div>

                            </div>


                            <button
                                type="submit"
                                className="btn btn-success"
                            >
                                Add Allocation
                            </button>

                        </form>

                    )}

                </div>

            </div>


            {/* ALLOCATION LIST */}

            <div className="mb-3">

                <div className="eid-section-title">

                    <h3 className="mb-0">
                        Your Budget Allocations
                    </h3>

                </div>

                <p className="eid-section-subtitle">
                    Review the amount assigned to
                    each Eid spending category.
                </p>

            </div>


            {allocations.length === 0 ? (

                <div className="alert alert-info">
                    No allocations have been
                    created yet.
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
                                            Allocated Amount
                                        </th>

                                        <th>
                                            Action
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {allocations.map(
                                        (
                                            allocation
                                        ) => (

                                            <tr
                                                key={
                                                    allocation
                                                        .id
                                                }
                                            >

                                                <td>

                                                    <strong>
                                                        {
                                                            allocation
                                                                .category_name
                                                        }
                                                    </strong>

                                                </td>

                                                <td>

                                                    <strong>
                                                        £
                                                        {Number(
                                                            allocation
                                                                .allocated_amount
                                                        ).toFixed(
                                                            2
                                                        )}
                                                    </strong>

                                                </td>

                                                <td>

                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() =>
                                                            deleteAllocation(
                                                                allocation
                                                                    .id
                                                            )
                                                        }
                                                    >
                                                        Remove
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

export default Budget;
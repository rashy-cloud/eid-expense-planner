import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

import SavingsPlanner from "../components/SavingsPlanner";
import BudgetHealth from "../components/BudgetHealth";
import SpendingCharts from "../components/SpendingCharts";


function Dashboard() {
    const { user } = useAuth();

    const [budget, setBudget] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [categorySummary, setCategorySummary] = useState([]);
    const [recommendations, setRecommendations] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError("");

                const [
                    budgetResponse,
                    expenseResponse,
                ] = await Promise.all([
                    API.get("/budgets/"),
                    API.get("/expenses/"),
                ]);

                setExpenses(
                    expenseResponse.data || []
                );

                if (
                    !budgetResponse.data ||
                    budgetResponse.data.length === 0
                ) {
                    setBudget(null);
                    setCategorySummary([]);
                    setRecommendations([]);
                    return;
                }

                const currentBudget =
                    budgetResponse.data[0];

                setBudget(currentBudget);

                const budgetId =
                    currentBudget.id;

                const [
                    categoryResponse,
                    recommendationResponse,
                ] = await Promise.all([
                    API.get(
                        `/expenses/category-summary/${budgetId}/`
                    ),

                    API.get(
                        `/recommendations/budget/${budgetId}/`
                    ),
                ]);

                setCategorySummary(
                    categoryResponse.data || []
                );

                setRecommendations(
                    recommendationResponse.data
                        ?.recommendations || []
                );

            } catch (error) {
                console.error(
                    "Dashboard error:",
                    error
                );

                console.error(
                    "Backend response:",
                    error.response?.data
                );

                setError(
                    "Unable to load your dashboard."
                );

            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();

    }, []);


    // Loading screen
    if (loading) {
        return (
            <div className="container eid-page">

                <div className="text-center py-5">

                    <h3>
                        Loading your dashboard...
                    </h3>

                    <p className="text-muted">
                        Preparing your Eid budget information.
                    </p>

                </div>

            </div>
        );
    }


    // Error screen
    if (error) {
        return (
            <div className="container eid-page">

                <div className="alert alert-danger">
                    {error}
                </div>

            </div>
        );
    }


    // Overall calculations
    const totalBudget =
        Number(
            budget?.total_budget || 0
        );

    const totalSpent =
        expenses.reduce(
            (total, expense) =>
                total +
                Number(
                    expense.amount || 0
                ),
            0
        );

    const remaining =
        totalBudget - totalSpent;

    const overallPercentage =
        totalBudget > 0
            ? (
                totalSpent /
                totalBudget
            ) * 100
            : 0;


    return (
        <div className="container eid-page">


            {/* PAGE HEADER */}

            <div className="eid-page-header">

                <h1>
                    🌙 Eid Budget Dashboard
                </h1>

                <p className="text-muted">

                    Welcome,{" "}

                    <strong>
                        {user?.username || "User"}
                    </strong>

                    ! Track your Eid budget,
                    savings, spending and
                    personalised recommendations.

                </p>

            </div>


            {/* NO BUDGET MESSAGE */}

            {!budget && (

                <div className="alert alert-info">

                    <h5>
                        No Eid budget found
                    </h5>

                    <p className="mb-0">

                        You have not created an
                        Eid budget yet. Open the
                        Budget Planner to create
                        your first budget.

                    </p>

                </div>

            )}


            {budget && (
                <>

                    {/* SUMMARY CARDS */}

                    <div className="row mb-4">


                        {/* TOTAL BUDGET */}

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


                        {/* TOTAL SPENT */}

                        <div className="col-md-4 mb-3">

                            <div className="card eid-stat-card gold h-100">

                                <div className="card-body">

                                    <div className="eid-stat-label">
                                        Total Spent
                                    </div>

                                    <div className="eid-stat-value">
                                        £
                                        {totalSpent.toFixed(
                                            2
                                        )}
                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* REMAINING */}

                        <div className="col-md-4 mb-3">

                            <div
                                className={
                                    remaining < 0
                                        ? "card eid-stat-card danger h-100"
                                        : "card eid-stat-card h-100"
                                }
                            >

                                <div className="card-body">

                                    <div className="eid-stat-label">
                                        Remaining
                                    </div>

                                    <div
                                        className={
                                            remaining < 0
                                                ? "eid-stat-value text-danger"
                                                : "eid-stat-value"
                                        }
                                    >
                                        £
                                        {remaining.toFixed(
                                            2
                                        )}
                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* OVERALL BUDGET USAGE */}

                    <div className="card mb-4">

                        <div className="card-body">

                            <div className="d-flex justify-content-between align-items-center">

                                <div>

                                    <h5 className="mb-1">
                                        Overall Budget Usage
                                    </h5>

                                    <small className="text-muted">
                                        Percentage of your total
                                        Eid budget already spent.
                                    </small>

                                </div>

                                <strong>
                                    {overallPercentage.toFixed(
                                        1
                                    )}
                                    %
                                </strong>

                            </div>


                            <div className="progress mt-3">

                                <div
                                    className={
                                        overallPercentage >= 100
                                            ? "progress-bar bg-danger"
                                            : overallPercentage >= 80
                                            ? "progress-bar bg-warning"
                                            : "progress-bar bg-success"
                                    }
                                    role="progressbar"
                                    style={{
                                        width:
                                            `${Math.min(
                                                overallPercentage,
                                                100
                                            )}%`,
                                    }}
                                    aria-valuenow={
                                        overallPercentage
                                    }
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                >

                                    {overallPercentage.toFixed(
                                        1
                                    )}
                                    %

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* SAVINGS PLANNER */}

                    <div className="mt-4">

                        <SavingsPlanner
                            budget={budget}
                        />

                    </div>


                    {/* BUDGET HEALTH */}

                    <div className="mt-4">

                        <BudgetHealth
                            budget={budget}
                            expenses={expenses}
                            categorySummary={
                                categorySummary
                            }
                        />

                    </div>


                    {/* SPENDING ANALYTICS */}

                    <SpendingCharts
                        categorySummary={
                            categorySummary
                        }
                    />


                    {/* SPENDING BY CATEGORY */}

                    <div className="mt-5">

                        <div className="eid-section-title">

                            <h3 className="mb-0">
                                Spending by Category
                            </h3>

                        </div>

                        <p className="eid-section-subtitle">

                            Track your planned and
                            actual Eid spending across
                            each category.

                        </p>


                        {categorySummary.length === 0 ? (

                            <div className="alert alert-info">

                                No category allocations
                                have been created yet.

                            </div>

                        ) : (

                            categorySummary.map(
                                (category) => {

                                    const percentage =
                                        Number(
                                            category
                                                .percentage_used ||
                                            0
                                        );

                                    const spent =
                                        Number(
                                            category.spent ||
                                            0
                                        );

                                    const planned =
                                        Number(
                                            category.planned ||
                                            0
                                        );

                                    const remainingCategory =
                                        Number(
                                            category.remaining ||
                                            0
                                        );

                                    let progressClass =
                                        "progress-bar bg-success";

                                    if (
                                        percentage >= 100
                                    ) {
                                        progressClass =
                                            "progress-bar bg-danger";

                                    } else if (
                                        percentage >= 80
                                    ) {
                                        progressClass =
                                            "progress-bar bg-warning";

                                    } else if (
                                        percentage >= 60
                                    ) {
                                        progressClass =
                                            "progress-bar bg-primary";
                                    }


                                    return (

                                        <div
                                            className="card mb-3"
                                            key={
                                                category.category
                                            }
                                        >

                                            <div className="card-body">

                                                <div className="d-flex justify-content-between align-items-center">

                                                    <h5 className="mb-0">
                                                        {
                                                            category.category
                                                        }
                                                    </h5>

                                                    <strong>
                                                        £
                                                        {spent.toFixed(
                                                            2
                                                        )}

                                                        {" / "}

                                                        £
                                                        {planned.toFixed(
                                                            2
                                                        )}
                                                    </strong>

                                                </div>


                                                <div className="progress mt-3">

                                                    <div
                                                        className={
                                                            progressClass
                                                        }
                                                        role="progressbar"
                                                        style={{
                                                            width:
                                                                `${Math.min(
                                                                    percentage,
                                                                    100
                                                                )}%`,
                                                        }}
                                                        aria-valuenow={
                                                            percentage
                                                        }
                                                        aria-valuemin="0"
                                                        aria-valuemax="100"
                                                    >

                                                        {percentage.toFixed(
                                                            1
                                                        )}
                                                        %

                                                    </div>

                                                </div>


                                                <div className="mt-2">

                                                    {remainingCategory >= 0 ? (

                                                        <small className="text-muted">

                                                            £
                                                            {remainingCategory.toFixed(
                                                                2
                                                            )}

                                                            {" remaining"}

                                                        </small>

                                                    ) : (

                                                        <small className="text-danger fw-bold">

                                                            £
                                                            {Math.abs(
                                                                remainingCategory
                                                            ).toFixed(
                                                                2
                                                            )}

                                                            {" over budget"}

                                                        </small>

                                                    )}

                                                </div>

                                            </div>

                                        </div>

                                    );
                                }
                            )

                        )}

                    </div>


                    {/* INTELLIGENT RECOMMENDATIONS */}

                    <div className="mt-5">

                        <div className="eid-section-title">

                            <h3 className="mb-0">
                                🧠 Intelligent Recommendations
                            </h3>

                        </div>

                        <p className="eid-section-subtitle">

                            Personalised financial
                            insights based on your
                            current Eid spending and
                            savings behaviour.

                        </p>


                        {recommendations.length === 0 ? (

                            <div className="alert alert-info">

                                No recommendations are
                                available yet.

                            </div>

                        ) : (

                            recommendations.map(
                                (
                                    recommendation,
                                    index
                                ) => {

                                    let alertClass =
                                        "alert alert-success";

                                    if (
                                        recommendation
                                            .severity ===
                                        "MEDIUM"
                                    ) {
                                        alertClass =
                                            "alert alert-warning";
                                    }

                                    if (
                                        recommendation
                                            .severity ===
                                        "HIGH"
                                    ) {
                                        alertClass =
                                            "alert alert-danger";
                                    }


                                    return (

                                        <div
                                            key={
                                                `${recommendation.category}-${index}`
                                            }
                                            className={
                                                alertClass
                                            }
                                        >

                                            <h5>
                                                {
                                                    recommendation.category
                                                }
                                            </h5>

                                            <p className="mb-0">
                                                {
                                                    recommendation.message
                                                }
                                            </p>

                                        </div>

                                    );
                                }
                            )

                        )}

                    </div>

                </>
            )}

        </div>
    );
}


export default Dashboard;
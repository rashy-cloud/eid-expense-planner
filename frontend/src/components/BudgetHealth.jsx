function BudgetHealth({
    budget,
    expenses,
    categorySummary,
}) {
    if (!budget) {
        return null;
    }

    const totalBudget = Number(
        budget.total_budget || 0
    );

    const totalSpent = expenses.reduce(
        (total, expense) =>
            total + Number(expense.amount || 0),
        0
    );

    const percentageUsed =
        totalBudget > 0
            ? (totalSpent / totalBudget) * 100
            : 0;

    const remaining =
        totalBudget - totalSpent;

    // Calculate health score
    let healthScore = 100;

    categorySummary.forEach((category) => {
        const percentage = Number(
            category.percentage_used || 0
        );

        if (percentage >= 100) {
            healthScore -= 20;
        } else if (percentage >= 80) {
            healthScore -= 10;
        } else if (percentage >= 60) {
            healthScore -= 5;
        }
    });

    healthScore = Math.max(
        healthScore,
        0
    );

    let healthStatus = "Healthy";
    let alertClass = "alert-success";

    if (healthScore < 80) {
        healthStatus = "Needs Attention";
        alertClass = "alert-warning";
    }

    if (healthScore < 50) {
        healthStatus = "High Risk";
        alertClass = "alert-danger";
    }

    const getCategoryStatus = (
        percentage
    ) => {
        if (percentage >= 100) {
            return {
                label: "Over Budget",
                badge: "bg-danger",
            };
        }

        if (percentage >= 80) {
            return {
                label: "Warning",
                badge: "bg-warning text-dark",
            };
        }

        if (percentage >= 60) {
            return {
                label: "Moderate",
                badge: "bg-primary",
            };
        }

        return {
            label: "Healthy",
            badge: "bg-success",
        };
    };

    return (
        <div className="card shadow-sm mt-5">

            <div className="card-body">

                <h3>
                    🧠 Budget Health Analysis
                </h3>

                <p className="text-muted">
                    Automated assessment of your
                    current Eid spending.
                </p>

                <div
                    className={`alert ${alertClass}`}
                >
                    <div className="row">

                        <div className="col-md-4">

                            <strong>
                                Budget Health Score
                            </strong>

                            <h2 className="mt-2">
                                {healthScore}/100
                            </h2>

                        </div>

                        <div className="col-md-4">

                            <strong>
                                Status
                            </strong>

                            <h4 className="mt-2">
                                {healthStatus}
                            </h4>

                        </div>

                        <div className="col-md-4">

                            <strong>
                                Overall Budget Used
                            </strong>

                            <h4 className="mt-2">
                                {percentageUsed.toFixed(
                                    1
                                )}
                                %
                            </h4>

                        </div>

                    </div>
                </div>

                <div className="row mt-4">

                    {categorySummary.map(
                        (category) => {

                            const percentage =
                                Number(
                                    category.percentage_used ||
                                        0
                                );

                            const status =
                                getCategoryStatus(
                                    percentage
                                );

                            return (
                                <div
                                    className="col-md-6 mb-3"
                                    key={
                                        category.category
                                    }
                                >

                                    <div className="border rounded p-3 h-100">

                                        <div className="d-flex justify-content-between">

                                            <strong>
                                                {
                                                    category.category
                                                }
                                            </strong>

                                            <span
                                                className={
                                                    `badge ${status.badge}`
                                                }
                                            >
                                                {
                                                    status.label
                                                }
                                            </span>

                                        </div>

                                        <div className="mt-3">

                                            <strong>
                                                {percentage.toFixed(
                                                    1
                                                )}
                                                %
                                            </strong>

                                            <span className="text-muted">
                                                {" "}of allocation used
                                            </span>

                                        </div>

                                    </div>

                                </div>
                            );
                        }
                    )}

                </div>

                <hr />

                <p className="mb-0">
                    <strong>
                        Current position:
                    </strong>

                    {" "}You have spent{" "}

                    <strong>
                        £{totalSpent.toFixed(2)}
                    </strong>

                    {" "}of your{" "}

                    <strong>
                        £{totalBudget.toFixed(2)}
                    </strong>

                    {" "}Eid budget, leaving{" "}

                    <strong>
                        £{remaining.toFixed(2)}
                    </strong>.
                </p>

            </div>

        </div>
    );
}

export default BudgetHealth;
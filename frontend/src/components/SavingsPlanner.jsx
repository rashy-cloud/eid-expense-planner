function SavingsPlanner({ budget }) {
    if (!budget) {
        return null;
    }

    const savingsGoal =
        Number(budget.savings_goal || 0);

    const currentSavings =
        Number(budget.current_savings || 0);

    const remainingToSave =
        Math.max(
            savingsGoal - currentSavings,
            0
        );

    const progress =
        savingsGoal > 0
            ? Math.min(
                  (currentSavings / savingsGoal) * 100,
                  100
              )
            : 0;

    const targetDate =
        new Date(budget.target_date);

    const today =
        new Date();

    const daysRemaining =
        Math.ceil(
            (targetDate - today) /
                (1000 * 60 * 60 * 24)
        );

    if (
        savingsGoal <= 0 ||
        daysRemaining <= 0
    ) {
        return (
            <div className="card shadow-sm mb-4">
                <div className="card-body">

                    <h4>
                        🌙 Eid Savings Planner
                    </h4>

                    <p className="text-muted mb-0">
                        Add a valid savings goal and
                        future target date to receive
                        a personalised savings plan.
                    </p>

                </div>
            </div>
        );
    }

    const weeksRemaining =
        Math.max(
            daysRemaining / 7,
            1
        );

    const monthsRemaining =
        Math.max(
            daysRemaining / 30.44,
            1
        );

    const dailySaving =
        remainingToSave /
        daysRemaining;

    const weeklySaving =
        remainingToSave /
        weeksRemaining;

    const monthlySaving =
        remainingToSave /
        monthsRemaining;

    let status = "On Track";
    let alertClass = "alert-success";

    if (progress >= 100) {
        status = "Goal Reached";
    } else if (progress < 25) {
        status = "Needs Attention";
        alertClass = "alert-warning";
    }

    return (
        <div className="card shadow-sm mb-4">

            <div className="card-body">

                <h4 className="mb-3">
                    🌙 Eid Savings Planner
                </h4>

                <p className="text-muted">
                    Track your savings progress
                    and see how much you need to
                    save before Eid.
                </p>

                <div className="row">

                    <div className="col-md-3 mb-3">
                        <div className="border rounded p-3 h-100">

                            <small className="text-muted">
                                Savings Goal
                            </small>

                            <h3>
                                £{savingsGoal.toFixed(2)}
                            </h3>

                        </div>
                    </div>

                    <div className="col-md-3 mb-3">
                        <div className="border rounded p-3 h-100">

                            <small className="text-muted">
                                Saved
                            </small>

                            <h3>
                                £{currentSavings.toFixed(2)}
                            </h3>

                        </div>
                    </div>

                    <div className="col-md-3 mb-3">
                        <div className="border rounded p-3 h-100">

                            <small className="text-muted">
                                Still Needed
                            </small>

                            <h3>
                                £{remainingToSave.toFixed(2)}
                            </h3>

                        </div>
                    </div>

                    <div className="col-md-3 mb-3">
                        <div className="border rounded p-3 h-100">

                            <small className="text-muted">
                                Days Remaining
                            </small>

                            <h3>
                                {daysRemaining}
                            </h3>

                        </div>
                    </div>

                </div>

                <div className="mt-3">

                    <div className="d-flex justify-content-between">

                        <span>
                            Savings Progress
                        </span>

                        <strong>
                            {progress.toFixed(1)}%
                        </strong>

                    </div>

                    <div className="progress mt-2">

                        <div
                            className="progress-bar bg-success"
                            style={{
                                width:
                                    `${progress}%`,
                            }}
                        >
                            {progress.toFixed(1)}%
                        </div>

                    </div>

                </div>

                <div className="row mt-4">

                    <div className="col-md-4 mb-3">
                        <div className="border rounded p-3">

                            <small className="text-muted">
                                Save Daily
                            </small>

                            <h4>
                                £{dailySaving.toFixed(2)}
                            </h4>

                        </div>
                    </div>

                    <div className="col-md-4 mb-3">
                        <div className="border rounded p-3">

                            <small className="text-muted">
                                Save Weekly
                            </small>

                            <h4>
                                £{weeklySaving.toFixed(2)}
                            </h4>

                        </div>
                    </div>

                    <div className="col-md-4 mb-3">
                        <div className="border rounded p-3">

                            <small className="text-muted">
                                Save Monthly
                            </small>

                            <h4>
                                £{monthlySaving.toFixed(2)}
                            </h4>

                        </div>
                    </div>

                </div>

                <div className={`alert ${alertClass} mt-3`}>

                    <strong>
                        {status}:
                    </strong>

                    {" "}

                    {remainingToSave === 0
                        ? "You have reached your Eid savings goal."
                        : `You need to save approximately £${weeklySaving.toFixed(
                              2
                          )} per week to reach your target.`}

                </div>

            </div>

        </div>
    );
}

export default SavingsPlanner;
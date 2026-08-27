import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";


function SpendingCharts({ categorySummary }) {

    if (
        !categorySummary ||
        categorySummary.length === 0
    ) {
        return (
            <div className="alert alert-info mt-4">
                Add category allocations and expenses
                to view your spending analytics.
            </div>
        );
    }


    // Prepare data for the charts
    const chartData = categorySummary.map(
        (category) => ({
            category: category.category,
            planned: Number(
                category.planned || 0
            ),
            spent: Number(
                category.spent || 0
            ),
        })
    );


    // Only include categories where money
    // has actually been spent in the pie chart
    const pieData = chartData.filter(
        (category) =>
            category.spent > 0
    );


    // Colours for pie chart sections
    const COLORS = [
        "#198754",
        "#0d6efd",
        "#ffc107",
        "#dc3545",
        "#6f42c1",
        "#fd7e14",
        "#20c997",
        "#0dcaf0",
    ];


    const formatCurrency = (value) => {
        return `£${Number(value).toFixed(2)}`;
    };


    return (
        <div className="mt-5">

            <div className="mb-4">

                <h3>
                    📊 Spending Analytics
                </h3>

                <p className="text-muted">
                    Visual comparison of your planned
                    Eid budget and actual household
                    spending.
                </p>

            </div>


            <div className="row">

                {/* PLANNED VS ACTUAL CHART */}

                <div className="col-lg-7 mb-4">

                    <div className="card shadow-sm h-100">

                        <div className="card-body">

                            <h5 className="mb-4">
                                Planned vs Actual Spending
                            </h5>


                            <div
                                style={{
                                    width: "100%",
                                    height: "350px",
                                }}
                            >

                                <ResponsiveContainer>

                                    <BarChart
                                        data={chartData}
                                        margin={{
                                            top: 10,
                                            right: 20,
                                            left: 10,
                                            bottom: 40,
                                        }}
                                    >

                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                        />

                                        <XAxis
                                            dataKey="category"
                                            angle={-25}
                                            textAnchor="end"
                                            interval={0}
                                            height={80}
                                        />

                                        <YAxis />

                                        <Tooltip
                                            formatter={
                                                formatCurrency
                                            }
                                        />

                                        <Legend />

                                        <Bar
                                            dataKey="planned"
                                            name="Planned"
                                            fill="#198754"
                                        />

                                        <Bar
                                            dataKey="spent"
                                            name="Actual Spent"
                                            fill="#0d6efd"
                                        />

                                    </BarChart>

                                </ResponsiveContainer>

                            </div>

                        </div>

                    </div>

                </div>


                {/* EXPENSE DISTRIBUTION */}

                <div className="col-lg-5 mb-4">

                    <div className="card shadow-sm h-100">

                        <div className="card-body">

                            <h5 className="mb-4">
                                Expense Distribution
                            </h5>


                            {pieData.length === 0 ? (

                                <div className="alert alert-info">

                                    Record some expenses
                                    to view your spending
                                    distribution.

                                </div>

                            ) : (

                                <div
                                    style={{
                                        width: "100%",
                                        height: "350px",
                                    }}
                                >

                                    <ResponsiveContainer>

                                        <PieChart>

                                            <Pie
                                                data={pieData}
                                                dataKey="spent"
                                                nameKey="category"
                                                cx="50%"
                                                cy="45%"
                                                outerRadius={100}
                                                label={({
                                                    category,
                                                }) =>
                                                    category
                                                }
                                            >

                                                {pieData.map(
                                                    (
                                                        entry,
                                                        index
                                                    ) => (

                                                        <Cell
                                                            key={
                                                                `cell-${entry.category}`
                                                            }
                                                            fill={
                                                                COLORS[
                                                                    index %
                                                                    COLORS.length
                                                                ]
                                                            }
                                                        />

                                                    )
                                                )}

                                            </Pie>

                                            <Tooltip
                                                formatter={
                                                    formatCurrency
                                                }
                                            />

                                            <Legend />

                                        </PieChart>

                                    </ResponsiveContainer>

                                </div>

                            )}

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}


export default SpendingCharts;
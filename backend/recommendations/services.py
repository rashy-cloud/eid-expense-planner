from datetime import date
from decimal import Decimal

from expenses.services import get_category_spending


def generate_category_recommendation(category_data):
    """
    Analyse actual spending against the planned
    allocation for one category.
    """

    category = category_data["category"]
    planned = Decimal(str(category_data["planned"]))
    spent = Decimal(str(category_data["spent"]))
    remaining = Decimal(str(category_data["remaining"]))
    percentage_used = Decimal(
        str(category_data["percentage_used"])
    )

    if percentage_used > 100:
        overspent = spent - planned

        return {
            "category": category,
            "type": "OVERSPENDING",
            "severity": "HIGH",
            "message": (
                f"You have exceeded your {category} "
                f"budget by £{overspent:.2f}. "
                f"Consider reducing further spending "
                f"in this category."
            ),
        }

    if percentage_used >= 80:
        return {
            "category": category,
            "type": "WARNING",
            "severity": "MEDIUM",
            "message": (
                f"You have used {percentage_used:.1f}% "
                f"of your {category} allocation. "
                f"Only £{remaining:.2f} remains."
            ),
        }

    if percentage_used >= 60:
        return {
            "category": category,
            "type": "MODERATE",
            "severity": "LOW",
            "message": (
                f"Your {category} spending has reached "
                f"{percentage_used:.1f}% of its allocation. "
                f"Continue monitoring this category."
            ),
        }

    return {
        "category": category,
        "type": "HEALTHY",
        "severity": "LOW",
        "message": (
            f"Your {category} spending is currently "
            f"within a healthy range."
        ),
    }


def generate_allocation_recommendations(budget):
    """
    Detect categories consuming a large proportion
    of the household's total Eid budget.

    The 40% threshold is a configurable prototype
    decision rule rather than a universal financial rule.
    """

    recommendations = []

    total_budget = budget.total_budget

    if not total_budget or total_budget <= 0:
        return recommendations

    for allocation in budget.allocations.select_related(
        "category"
    ).all():

        share = (
            allocation.allocated_amount
            / total_budget
        ) * Decimal("100")

        if share >= Decimal("40"):
            recommendations.append({
                "category": allocation.category.name,
                "type": "ALLOCATION_CONCENTRATION",
                "severity": "MEDIUM",
                "message": (
                    f"{allocation.category.name} accounts for "
                    f"{share:.1f}% of your total Eid budget. "
                    f"Consider reviewing whether this category "
                    f"is taking too large a share of your budget."
                ),
            })

    return recommendations


def generate_savings_recommendation(budget):
    """
    Compare actual savings progress with the progress
    expected between the date the budget was created
    and the target date.
    """

    savings_goal = Decimal(
        str(budget.savings_goal or 0)
    )

    current_savings = Decimal(
        str(budget.current_savings or 0)
    )

    if savings_goal <= 0:
        return None

    today = date.today()
    target_date = budget.target_date
    start_date = budget.created_at.date()

    if current_savings >= savings_goal:
        return {
            "category": "Savings",
            "type": "SAVINGS_COMPLETE",
            "severity": "LOW",
            "message": (
                f"You have reached your Eid savings "
                f"goal of £{savings_goal:.2f}."
            ),
        }

    if target_date <= today:
        remaining = savings_goal - current_savings

        return {
            "category": "Savings",
            "type": "TARGET_DATE_PASSED",
            "severity": "HIGH",
            "message": (
                f"Your savings target date has passed "
                f"and £{remaining:.2f} is still required. "
                f"Consider reviewing your target date "
                f"or savings goal."
            ),
        }

    total_days = max(
        (target_date - start_date).days,
        1
    )

    elapsed_days = max(
        (today - start_date).days,
        0
    )

    expected_progress = min(
        Decimal(elapsed_days)
        / Decimal(total_days)
        * Decimal("100"),
        Decimal("100")
    )

    actual_progress = (
        current_savings
        / savings_goal
        * Decimal("100")
    )

    remaining = (
        savings_goal - current_savings
    )

    days_remaining = (
        target_date - today
    ).days

    weeks_remaining = max(
        Decimal(days_remaining)
        / Decimal("7"),
        Decimal("1")
    )

    weekly_required = (
        remaining / weeks_remaining
    )

    # More than 10 percentage points behind
    if (
        actual_progress + Decimal("10")
        < expected_progress
    ):
        return {
            "category": "Savings",
            "type": "SAVINGS_BEHIND",
            "severity": "MEDIUM",
            "message": (
                f"You are behind your expected savings "
                f"progress. You have saved "
                f"{actual_progress:.1f}% of your goal, "
                f"while approximately "
                f"{expected_progress:.1f}% would be "
                f"expected by this point. Aim to save "
                f"about £{weekly_required:.2f} per week."
            ),
        }

    return {
        "category": "Savings",
        "type": "SAVINGS_ON_TRACK",
        "severity": "LOW",
        "message": (
            f"Your Eid savings are currently on track. "
            f"You have saved {actual_progress:.1f}% "
            f"of your goal. Continue saving approximately "
            f"£{weekly_required:.2f} per week."
        ),
    }


def generate_reallocation_recommendations(
    category_data
):
    """
    Suggest reallocation when one category is over budget
    while another category still has substantial unused funds.
    """

    recommendations = []

    overspent_categories = [
        item
        for item in category_data
        if Decimal(
            str(item["percentage_used"])
        ) > 100
    ]

    donor_categories = [
        item
        for item in category_data
        if (
            Decimal(
                str(item["percentage_used"])
            ) <= Decimal("50")
            and Decimal(
                str(item["remaining"])
            ) > 0
        )
    ]

    donor_categories.sort(
        key=lambda item: Decimal(
            str(item["remaining"])
        ),
        reverse=True
    )

    for overspent in overspent_categories:

        if not donor_categories:
            break

        donor = donor_categories[0]

        planned = Decimal(
            str(overspent["planned"])
        )

        spent = Decimal(
            str(overspent["spent"])
        )

        overspent_amount = (
            spent - planned
        )

        donor_remaining = Decimal(
            str(donor["remaining"])
        )

        suggested_amount = min(
            overspent_amount,
            donor_remaining
        )

        if suggested_amount <= 0:
            continue

        recommendations.append({
            "category": overspent["category"],
            "type": "REALLOCATION",
            "severity": "MEDIUM",
            "message": (
                f"Your {overspent['category']} category "
                f"is over budget. You currently have "
                f"£{donor_remaining:.2f} remaining in "
                f"{donor['category']}. Consider reallocating "
                f"up to £{suggested_amount:.2f} from "
                f"{donor['category']} if that reflects "
                f"your remaining spending priorities."
            ),
        })

    return recommendations


def generate_budget_recommendations(budget):
    """
    Generate all intelligent recommendations
    for an Eid budget.
    """

    category_data = get_category_spending(
        budget
    )

    recommendations = []

    # 1. Spending recommendations
    for data in category_data:
        recommendations.append(
            generate_category_recommendation(
                data
            )
        )

    # 2. Budget allocation analysis
    recommendations.extend(
        generate_allocation_recommendations(
            budget
        )
    )

    # 3. Savings analysis
    savings_recommendation = (
        generate_savings_recommendation(
            budget
        )
    )

    if savings_recommendation:
        recommendations.append(
            savings_recommendation
        )

    # 4. Reallocation suggestions
    recommendations.extend(
        generate_reallocation_recommendations(
            category_data
        )
    )

    return recommendations
from decimal import Decimal

from django.db.models import Sum

from budgets.models import BudgetAllocation
from .models import Expense


def get_category_spending(budget):

    results = []

    allocations = BudgetAllocation.objects.filter(
        budget=budget
    )

    for allocation in allocations:

        total_spent = Expense.objects.filter(
            budget=budget,
            category=allocation.category
        ).aggregate(
            total=Sum("amount")
        )["total"] or Decimal("0.00")

        remaining = (
            allocation.allocated_amount
            - total_spent
        )

        percentage_used = (
            (
                total_spent /
                allocation.allocated_amount
            ) * 100
            if allocation.allocated_amount > 0
            else Decimal("0")
        )

        results.append({
            "category":
                allocation.category.name,

            "planned":
                allocation.allocated_amount,

            "spent":
                total_spent,

            "remaining":
                remaining,

            "percentage_used":
                percentage_used,
        })

    return results
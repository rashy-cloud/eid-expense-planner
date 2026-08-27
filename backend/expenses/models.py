from django.db import models
from budgets.models import Budget, Category


class Expense(models.Model):
    budget = models.ForeignKey(
        Budget,
        on_delete=models.CASCADE,
        related_name='expenses'
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='expenses'
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    description = models.CharField(
        max_length=255,
        blank=True
    )

    expense_date = models.DateField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.category.name} - £{self.amount}"
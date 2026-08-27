from django.db import models
from django.contrib.auth.models import User


class Budget(models.Model):

    EID_CHOICES = [
        ('FITR', 'Eid al-Fitr'),
        ('ADHA', 'Eid al-Adha'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='budgets'
    )

    eid_type = models.CharField(
        max_length=10,
        choices=EID_CHOICES
    )

    total_budget = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    savings_goal = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    current_savings = models.DecimalField(
    max_digits=10,
    decimal_places=2,
    default=0

    )

    target_date = models.DateField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.get_eid_type_display()}"
    

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    is_adha_only = models.BooleanField(default=False)

    def __str__(self):
        return self.name
    
class BudgetAllocation(models.Model):

    budget = models.ForeignKey(
        Budget,
        on_delete=models.CASCADE,
        related_name='allocations'
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE
    )

    allocated_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    class Meta:
        unique_together = ('budget', 'category')

    def __str__(self):
        return f"{self.category.name} - {self.allocated_amount}"
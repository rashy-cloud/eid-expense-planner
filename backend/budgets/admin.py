from django.contrib import admin
from .models import Budget, Category, BudgetAllocation

admin.site.register(Budget)
admin.site.register(Category)
admin.site.register(BudgetAllocation)
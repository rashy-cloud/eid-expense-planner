from rest_framework import serializers
from .models import Expense


class ExpenseSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(
        source="category.name",
        read_only=True
    )

    class Meta:
        model = Expense
        fields = [
            "id",
            "budget",
            "category",
            "category_name",
            "amount",
            "description",
            "expense_date",
            "created_at",
        ]

        read_only_fields = ["id", "created_at"]
from datetime import date

from rest_framework import serializers

from .models import Budget, Category, BudgetAllocation


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "description",
            "is_adha_only",
        ]


class BudgetAllocationSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(
        source="category.name",
        read_only=True
    )

    class Meta:
        model = BudgetAllocation
        fields = [
            "id",
            "budget",
            "category",
            "category_name",
            "allocated_amount",
        ]

    def validate(self, attrs):
        request = self.context.get("request")

        budget = attrs.get(
            "budget",
            getattr(
                self.instance,
                "budget",
                None
            )
        )

        category = attrs.get(
            "category",
            getattr(
                self.instance,
                "category",
                None
            )
        )

        amount = attrs.get(
            "allocated_amount",
            getattr(
                self.instance,
                "allocated_amount",
                None
            )
        )

        # Security check
        if (
            request
            and budget
            and budget.user != request.user
        ):
            raise serializers.ValidationError(
                "You cannot modify another user's budget."
            )

        # Allocation must be positive
        if (
            amount is not None
            and amount <= 0
        ):
            raise serializers.ValidationError({
                "allocated_amount":
                    "Allocation must be greater than zero."
            })

        # Prevent duplicate category allocation
        duplicate = (
            BudgetAllocation.objects.filter(
                budget=budget,
                category=category
            )
        )

        if self.instance:
            duplicate = duplicate.exclude(
                id=self.instance.id
            )

        if duplicate.exists():
            raise serializers.ValidationError(
                "This category has already been allocated."
            )

        # Calculate existing allocations
        existing = (
            BudgetAllocation.objects.filter(
                budget=budget
            )
        )

        if self.instance:
            existing = existing.exclude(
                id=self.instance.id
            )

        current_total = sum(
            allocation.allocated_amount
            for allocation in existing
        )

        # Prevent allocations exceeding budget
        if (
            amount is not None
            and current_total + amount >
            budget.total_budget
        ):
            raise serializers.ValidationError(
                "Total allocations cannot exceed the total budget."
            )

        return attrs


class BudgetSerializer(serializers.ModelSerializer):
    allocations = BudgetAllocationSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Budget
        fields = [
            "id",
            "eid_type",
            "total_budget",
            "savings_goal",
            "current_savings",
            "target_date",
            "created_at",
            "allocations",
        ]

        read_only_fields = [
            "id",
            "created_at",
        ]

    def validate(self, attrs):
        total_budget = attrs.get(
            "total_budget",
            getattr(
                self.instance,
                "total_budget",
                None
            )
        )

        savings_goal = attrs.get(
            "savings_goal",
            getattr(
                self.instance,
                "savings_goal",
                0
            )
        )

        current_savings = attrs.get(
            "current_savings",
            getattr(
                self.instance,
                "current_savings",
                0
            )
        )

        target_date = attrs.get(
            "target_date",
            getattr(
                self.instance,
                "target_date",
                None
            )
        )

        # Total budget validation
        if (
            total_budget is not None
            and total_budget <= 0
        ):
            raise serializers.ValidationError({
                "total_budget":
                    "Total budget must be greater than zero."
            })

        # Savings goal validation
        if (
            savings_goal is not None
            and savings_goal < 0
        ):
            raise serializers.ValidationError({
                "savings_goal":
                    "Savings goal cannot be negative."
            })

        # Current savings validation
        if (
            current_savings is not None
            and current_savings < 0
        ):
            raise serializers.ValidationError({
                "current_savings":
                    "Current savings cannot be negative."
            })

        # Savings cannot exceed goal
        if (
            savings_goal is not None
            and current_savings is not None
            and current_savings > savings_goal
        ):
            raise serializers.ValidationError({
                "current_savings":
                    (
                        "Current savings cannot exceed "
                        "the savings goal."
                    )
            })

        # Target date must be future
        if (
            target_date is not None
            and target_date <= date.today()
        ):
            raise serializers.ValidationError({
                "target_date":
                    "Target date must be in the future."
            })

        # Existing allocations cannot exceed
        # a newly reduced total budget
        if (
            self.instance
            and total_budget is not None
        ):
            allocated_total = sum(
                allocation.allocated_amount
                for allocation
                in self.instance.allocations.all()
            )

            if total_budget < allocated_total:
                raise serializers.ValidationError({
                    "total_budget":
                        (
                            "Total budget cannot be lower "
                            "than the amount already allocated."
                        )
                })

        return attrs
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Expense
from .serializers import ExpenseSerializer
from .services import get_category_spending


class ExpenseViewSet(viewsets.ModelViewSet):

    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Expense.objects.filter(
            budget__user=self.request.user
        )

    @action(
        detail=False,
        methods=["get"],
        url_path=r"category-summary/(?P<budget_id>\d+)"
    )
    def category_summary(self, request, budget_id):

        from budgets.models import Budget

        try:
            budget = Budget.objects.get(
                id=budget_id,
                user=request.user
            )

        except Budget.DoesNotExist:
            return Response(
                {"error": "Budget not found."},
                status=404
            )

        data = get_category_spending(budget)

        return Response(data)
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from budgets.models import Budget

from .services import (
    generate_budget_recommendations
)


class BudgetRecommendationView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(
        self,
        request,
        budget_id
    ):

        try:

            budget = Budget.objects.get(
                id=budget_id,
                user=request.user
            )

        except Budget.DoesNotExist:

            return Response(
                {
                    "error": "Budget not found."
                },
                status=404
            )

        recommendations = (
            generate_budget_recommendations(
                budget
            )
        )

        return Response({
            "budget_id": budget.id,
            "recommendations":
                recommendations
        })
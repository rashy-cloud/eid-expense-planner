from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import (
    Budget,
    Category,
    BudgetAllocation,
)

from .serializers import (
    BudgetSerializer,
    CategorySerializer,
    BudgetAllocationSerializer,
)


class BudgetViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Budget.objects.filter(
            user=self.request.user
        )

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user
        )


class CategoryViewSet(
    viewsets.ReadOnlyModelViewSet
):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Category.objects.all()

        eid_type = self.request.query_params.get(
            "eid_type"
        )

        # Hide Qurbani / Adha-only categories
        # when planning Eid al-Fitr
        if eid_type == "FITR":
            queryset = queryset.filter(
                is_adha_only=False
            )

        return queryset


class BudgetAllocationViewSet(
    viewsets.ModelViewSet
):
    serializer_class = BudgetAllocationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = BudgetAllocation.objects.filter(
            budget__user=self.request.user
        )

        budget_id = self.request.query_params.get(
            "budget"
        )

        if budget_id:
            queryset = queryset.filter(
                budget_id=budget_id
            )

        return queryset
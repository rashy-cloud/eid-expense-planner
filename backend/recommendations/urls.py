from django.urls import path

from .views import BudgetRecommendationView


urlpatterns = [
    path(
        "budget/<int:budget_id>/",
        BudgetRecommendationView.as_view(),
        name="budget-recommendations"
    ),
]
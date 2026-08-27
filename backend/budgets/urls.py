from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    BudgetViewSet,
    CategoryViewSet,
    BudgetAllocationViewSet,
)


router = DefaultRouter()

# Register these BEFORE the empty route.
router.register(
    r"categories",
    CategoryViewSet,
    basename="category"
)

router.register(
    r"allocations",
    BudgetAllocationViewSet,
    basename="allocation"
)

router.register(
    r"",
    BudgetViewSet,
    basename="budget"
)


urlpatterns = [
    path("", include(router.urls)),
]
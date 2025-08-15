from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, TaskViewSet, ContextEntryViewSet, ai_suggest
from . import views

router = DefaultRouter()

# Register the viewsets with the router
router.register(r'categories', CategoryViewSet)
router.register(r'tasks', TaskViewSet)
router.register(r'context', ContextEntryViewSet)

urlpatterns = [
    path('ai/suggest/', ai_suggest, name='ai_suggest'),
    path('', include(router.urls)),
]

from rest_framework import viewsets, mixins, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count
from django.http import HttpResponse
from .serializers import SuggestionRequestSerializer

from core.models import Task, Category, ContextEntry
from .serializers import TaskSerializer, CategorySerializer, ContextEntrySerializer
from .pagination import DefaultPagination
from django.shortcuts import render
from ai.service import AISuggester

def homepage(request):
    return render(request, 'smarttodo/home.html')

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all().order_by("-priority_score", "deadline")
    serializer_class = TaskSerializer
    pagination_class = DefaultPagination

    @action(detail=False, methods=["get"])  # /api/tasks/stats/
    def stats(self, request):
        data = {
            "by_status": Task.objects.values("status").annotate(count=Count("id")),
        }
        return Response(data)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by("-usage_count", "name")
    serializer_class = CategorySerializer

class ContextEntryViewSet(mixins.CreateModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = ContextEntry.objects.all().order_by("-created_at")
    serializer_class = ContextEntrySerializer
    pagination_class = DefaultPagination

@api_view(['POST'])
def ai_suggest(request):
    if request.method == 'POST':
        task = request.data.get('task', None)
        priority = request.data.get('priority', None)
        deadline = request.data.get('deadline', None)
        context = request.data.get('context', None)

        if not task or not priority or not deadline or not context:
            return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Perform AI task suggestion logic here
        
        return Response({"message": "Task suggestions generated successfully"}, status=status.HTTP_200_OK)


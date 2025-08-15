from rest_framework import serializers
from core.models import Task, Category, ContextEntry

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug", "usage_count", "created_at"]

class TaskSerializer(serializers.ModelSerializer):
    categories = CategorySerializer(many=True, read_only=True)
    category_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Category.objects.all(), write_only=True, source="categories"
    )

    class Meta:
        model = Task
        fields = [
            "id", "title", "description", "categories", "category_ids",
            "priority_score", "deadline", "status", "ai_metadata",
            "created_at", "updated_at",
        ]

class ContextEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = ContextEntry
        fields = ["id", "source_type", "content", "attachment", "processed_insights", "created_at"]

class SuggestionRequestSerializer(serializers.Serializer):
    task = serializers.CharField(max_length=200)
    priority = serializers.CharField(max_length=50)
    deadline = serializers.DateTimeField()
    context = serializers.CharField()
from django.contrib import admin
from .models import Task, Category, ContextEntry

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("title", "status", "priority_score", "deadline", "created_at")
    list_filter = ("status",)
    search_fields = ("title", "description")

admin.site.register(Category)
admin.site.register(ContextEntry)
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from api.views import homepage  # Import homepage view from api/views.py

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema')),
    path('api/', include('api.urls')),  # Include the api URLs
    path('', homepage),  # Map the root URL to homepage view
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

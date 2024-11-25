from django.contrib import admin
from django.urls import path, include
from django.conf import settings  # Add this import
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('pong.urls')),  # Include URLs from pong app
]

urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

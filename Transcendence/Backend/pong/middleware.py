import logging
from django.utils import timezone

logger = logging.getLogger(__name__)

class UpdateLastActivityMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if hasattr(request, 'user') and request.user.is_authenticated:
            now = timezone.now()
            profile = request.user.profile
            profile.last_activity = now
            if not profile.isOnline:
                profile.isOnline = True  # Set isOnline to True if the user was previously offline
            profile.save()
        response = self.get_response(request)
        return response
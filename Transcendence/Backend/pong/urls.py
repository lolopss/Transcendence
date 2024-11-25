from django.urls import include, path
from .views import *

urlpatterns = [
    path('api/client-id/', GetClientIdView.as_view(), name='get_client_id'),
    path('api/login/', UserLogin.as_view(), name='user-login'),
    path('api/register/', UserRegister.as_view(), name='user-register'),
    path('api/logout/', UserLogout.as_view(), name='user-logout'),
    path('api/callback', CallbackView.as_view(), name='callback'),
    path('api/update-language/', UpdateLanguage.as_view(), name='update-language'),
    path('api/join-queue/', JoinQueue.as_view(), name='join_queue'),
    path('api/check-game/', CheckJoinGame.as_view(), name='check_game'),
    path('api/exit-queue/', ExitQueue.as_view(), name='exit_queue'),
    path('api/user-details/', UserDetails.as_view(), name='user-details'),
    path('api/toggle-2fa/', Toggle2FA.as_view(), name='toggle-2fa'),
    path('api/verify-2fa/', Verify2FA.as_view(), name='verify-2fa'),
    path('api/translations/<str:language_code>/', GetTranslations.as_view(), name='get-translations'),
    path('api/update-goals/', update_goals, name='update-goals'),
    path('pong/', pong, name='pong'),
    path('profile/', profile_view, name='profile'),
    path('profile/edit/', edit_profile_view, name='edit_profile'),
    path('register42', register42, name='register42'),
]

from django.urls import path
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
    path('api/validate-token/', validate_token, name='validate-token'),
    path('api/user-details/', UserDetails.as_view(), name='user-details'),  # Default user details
    path('api/user-details/<str:username>/', UserDetails.as_view(), name='user-details-with-username'),  # User details with username
    path('api/toggle-2fa/', Toggle2FA.as_view(), name='toggle-2fa'),
    path('api/verify-2fa/', Verify2FA.as_view(), name='verify-2fa'),
    path('api/translations/<str:language_code>/', GetTranslations.as_view(), name='get-translations'),
    # path('api/update-goals/', update_goals, name='update-goals'),
    path('pong/', pong, name='pong'),
    path('profile/', profile_view, name='profile'),
    path('api/edit-account/', edit_account, name='edit-account'),
    path('register42', register42, name='register42'),
    path('api/delete-account/', DeleteAccount.as_view(), name='delete-account'),
    path('api/anonymize-account/', AnonymizeAccount.as_view(), name='anonymize-account'),
    path('api/save-match-result/', SaveMatchResult.as_view(), name='save-match-result'),
    path('api/friend-list/', FriendListView.as_view(), name='friend-list'),
    path('api/add-friend/', AddFriendView.as_view(), name='add-friend'),
    # path('api/update-win-loss/', update_win_loss, name='update-win-loss'),

]

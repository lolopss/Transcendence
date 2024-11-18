from django.urls import include, path
from . import views
from .views import *

urlpatterns = [
    path('api/client-id/', GetClientIdView.as_view(), name='get_client_id'),
    path('api/login/', views.UserLogin.as_view(), name='user-login'),  # Updated class name
    path('api/register/', views.UserRegister.as_view(), name='user-register'),  # Change to class-based view if applicable
    path('api/logout/', views.UserLogout.as_view(), name='user-logout'),  # Change to class-based view if applicable
    path('register42', views.register42, name='register42'),
    path('api/callback', views.CallbackView.as_view(), name='callback'),
    path('pong/',     views.pong, name='pong'),
    path('profile/', views.profile_view, name='profile'),  # Profile view
    path('profile/edit/', views.edit_profile_view, name='edit_profile'),  # Edit profile view
    path('api/join-queue/', views.JoinQueue.as_view(), name='join_queue'),  # JoinQueue view
    path('api/check-game/', views.CheckJoinGame.as_view(), name='check_game'),  # CheckJoinGame view
    path('api/exit-queue/', views.ExitQueue.as_view(), name='exit_queue'),  # ExitQueue view
    path('api/user-details/', views.UserDetails.as_view(), name='user-details'),
]

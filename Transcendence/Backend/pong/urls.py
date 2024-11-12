from django.urls import include, path
from . import views
from .views import *

urlpatterns = [
    path('api/client-id/', GetClientIdView.as_view(), name='get_client_id'),
    path('api/login/', UserLoginView.as_view(), name='user-login'),
    path('api/register/', user_register, name='user-register'),
    path('api/logout/', user_logout, name='user-logout'),
    path('api/matchmaking/', matchmaking, name='matchmaking'),
    path('pong/',     views.pong, name='pong'),
    path('',          UserLoginView.as_view(), name='user-login'),
    path('profile/',  profile_view, name='profile'),
    path('profile/edit/', edit_profile_view, name='edit_profile'),
    path('auth/callback', views.oauth_callback, name='oauth_callback'),
]

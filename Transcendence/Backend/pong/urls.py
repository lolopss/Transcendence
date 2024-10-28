from django.urls import path
from . import views
from .views import UserLoginView, user_register, user_logout, pong, profile_view, edit_profile_view


urlpatterns = [
    path('api/login/', UserLoginView.as_view(), name='user-login'),
    path('api/register/', user_register, name='user-register'),
    path('api/logout/', user_logout, name='user-logout'),
    path('pong/',     views.pong, name='pong'),
    path('',          UserLoginView.as_view(), name='user-login'),
    path('profile/',  profile_view, name='profile'),
    path('profile/edit/', edit_profile_view, name='edit_profile'),
]

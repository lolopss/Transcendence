from django.urls import path
from .views import register, user_login, pong

urlpatterns = [
    path('register/', register, name='register'),
    path('login/', user_login, name='login'),
    path('pong/', pong, name='pong'),
]

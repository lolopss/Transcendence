from django.urls import path
from . import views
from .views import register, user_login, pong

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.user_login, name='login'),
    path('pong/', views.pong, name='pong'),
]

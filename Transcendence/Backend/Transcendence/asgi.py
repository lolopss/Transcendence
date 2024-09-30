import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import path
from pong import consumers

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Transcendence.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            [
                path("ws/some_endpoint/", consumers.GameConsumer.as_asgi()),
            ]
        ),
    ),
})

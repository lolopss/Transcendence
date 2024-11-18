from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate, get_user_model
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from django.core.exceptions import ValidationError
from .forms import RegistrationForm, ProfileForm
from .models import Profile, GameServerModel, WaitingPlayerModel
from django.db.models import Q
from .serializers import UserRegisterSerializer, UserLoginSerializer
import os
import ssl
from .utils import custom_validation, valid_email, valid_password, create_user_token, ManageGameQueue
import json
import urllib.parse
import urllib.request
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

UserModel = get_user_model()
import logging
import random  # For simulating matchmaking
import json

User = get_user_model()
API_URL = 'https://api.intra.42.fr'
logger = logging.getLogger(__name__)

class GetClientIdView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return JsonResponse({'client_id': settings.SOCIAL_AUTH_42_KEY})

import json
import os
import logging
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)

from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
import requests, os, json
import logging

logger = logging.getLogger(__name__)

def register42(request):
    # Extract code and state from the query parameters
    code = request.GET.get('code')
    state = request.GET.get('state')

    if not code or not state:
        return JsonResponse({'error': 'Missing code or state in the callback.'}, status=400)

    # Validate the state (ensure it matches the one stored in the session or database)
    saved_state = request.session.get('oauth_state')
    if state != saved_state:
        return JsonResponse({'error': 'State mismatch. Potential CSRF attack.'}, status=400)

    # Exchange the authorization code for access tokens
    token_url = 'https://api.intra.42.fr/oauth/token'
    payload = {
        'grant_type': 'authorization_code',
        'client_id': os.getenv("CLIENT_ID"),
        'client_secret': os.getenv("CLIENT_SECRET"),
        'redirect_uri': 'https://localhost:8000/register42',  # Ensure this matches the frontend redirect URL
        'code': code
    }

    response = requests.post(token_url, data=payload)
    if response.status_code == 200:
        data = response.json()
        access_token = data.get('access_token')
        refresh_token = data.get('refresh_token')

        # Save tokens (session, database, etc.)
        request.session['access_token'] = access_token
        request.session['refresh_token'] = refresh_token

        # Redirect to /menu or the desired page
        return redirect('/menu')  # Or another redirect URL you want to use
    else:
        return JsonResponse({'error': 'Failed to exchange code for token.'}, status=500)

class CallbackView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        logger.info("OAuth callback received with authorization code.")
        code = request.query_params.get('code')
        # Token request parameters
        token_params = {
            "client_id": os.getenv("CLIENT_ID"),
            "client_secret": os.getenv("CLIENT_SECRET"),
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": 'https://localhost:8000/register42',
        }
        # Exchange authorization code for access token
        try:
            token_response = requests.post(
                "https://api.intra.42.fr/oauth/token",
                data=token_params,
                headers={'User-Agent': 'Mozilla/5.0'}
            )
            if token_response.status_code == 200:
                token_data = token_response.json()
                access_token = token_data.get('access_token')
                # Fetch user profile with the obtained access token
                profile_url = "https://api.intra.42.fr/v2/me"
                headers = {"Authorization": f"Bearer {access_token}"}
                profile_response = requests.get(profile_url, headers=headers)
                if profile_response.status_code == 200:
                    user_data = profile_response.json()
                    # Try to get or create the user in the app
                    user, created = UserModel.objects.get_or_create(
                        username=user_data['login'],
                        defaults={'email': user_data['email']}
                    )
                    # Generate JWT tokens
                    refresh = RefreshToken.for_user(user)
                    access = str(refresh.access_token)
                    refresh_token = str(refresh)
                    # Respond with tokens for the frontend
                    return Response({
                        "access": access,
                        "refresh": refresh_token,
                        "detail": "User logged in successfully."
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({'error': 'Unable to fetch user profile'}, status=status.HTTP_504_GATEWAY_TIMEOUT)
            else:
                return Response({'error': 'Unable to obtain access token'}, status=status.HTTP_502_BAD_GATEWAY)
        except requests.RequestException as e:
            logger.error(f"Error during token exchange: {str(e)}")
            return Response({'error': 'Error during token exchange'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)


# Register new user
class UserRegister(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # Clean data using the custom validation function
        try:
            clean_data = custom_validation(request.data)
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Serialize and save user data
        serializer = UserRegisterSerializer(data=clean_data)
        if serializer.is_valid(raise_exception=True):
            user = serializer.save()  # save() calls create() in the serializer
            return Response({
                "message": "User successfully registered",
                "user": {
                    "username": user.username,
                    "email": user.email,
                },
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Login user and generate JWT token
class UserLogin(APIView):
    permission_classes = [AllowAny]

    @csrf_exempt
    def post(self, request):
        data = request.data
        identifier = data.get("identifier")  # Use identifier for email or username
        password = data.get("password")

        # Log identifier and password for debugging
        logger.info(f"!!!!!!!!!!!!!!!!!!!!identifier is : {identifier}")
        logger.info(f"!!!!!!!!!!!!!!!!!!!!password is : {password}")

        # Check if identifier and password are provided
        if not identifier or not password:
            return Response({"error": "Identifier and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        # Attempt to retrieve user by email or username
        try:
            user = UserModel.objects.get(Q(email=identifier) | Q(username=identifier))
        except UserModel.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        # Check password correctness
        if not user.check_password(password):
            return Response({'error': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

        # Generate the JWT tokens (access and refresh)
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        # Add `user_id` to the access token
        refresh.access_token["user_id"] = user.id

        # Set user to online (if your app has an 'isOnline' field in the profile model)
        if hasattr(user, 'profile'):
            user.profile.isOnline = True
            user.profile.save()

        return Response({
            "access": access_token,
            "refresh": refresh_token
        }, status=status.HTTP_200_OK)


# Logout user and update online status

class UserLogout(APIView):
    permission_classes = [IsAuthenticated]  # Ensure the user is authenticated with JWT

    def post(self, request):
        # Get the JWT token from the request headers
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return Response({'error': 'Authorization header missing'}, status=status.HTTP_400_BAD_REQUEST)

        # Extract the token (it will be in the form of "Bearer <token>")
        token = auth_header.split(' ')[1]

        try:
            # Decode the token to get the user
            access_token = AccessToken(token)
            user_id = access_token["user_id"]  # Get the user_id from the token

            # Log the extracted user_id to check if it's correct
            logger.info(f"Extracted user_id: {user_id}")

            # Retrieve the user object using the user_id
            user_obj = UserModel.objects.get(pk=user_id)
            if user_obj.profile:
                user_obj.profile.isOnline = False  # Set user to offline
                user_obj.profile.save()

            # Successfully logged out
            logger.info(f"User {user_obj.username} logged out successfully.")

        except Exception as e:
            # Log the error message for debugging
            logger.error(f"Error during logout: {e}")
            return Response({'error': 'Failed to logout or user not found'}, status=status.HTTP_404_NOT_FOUND)

        # Log out the user from the session
        logout(request)
        return Response(status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def some_protected_view(request):
    # This view requires the user to be authenticated with a JWT token
    return Response({'message': 'You have access to this view.'})

@login_required
def pong(request):
    return render(request, 'index.html')


@login_required
def profile_view(request):
    profile = request.user.profile
    return render(request, 'profile.html', {'profile': profile})

@login_required
def edit_profile_view(request):
    profile = request.user.profile
    if request.method == 'POST':
        form = ProfileForm(request.POST, instance=profile)
        if form.is_valid():
            form.save()
            return redirect('profile')  # Redirect to the profile view
    else:
        form = ProfileForm(instance=profile)
    return render(request, 'edit_profile.html', {'form': form})



# # This will hold your matchmaking queue
# matchmaking_queue = []

# @api_view(['POST'])
# async def matchmaking(request):
#     user_id = request.data.get('user_id')
#     matchmaking_queue.append(user_id)

#     if len(matchmaking_queue) >= 2:
#         player1_id = matchmaking_queue.pop(0)
#         player2_id = matchmaking_queue.pop(0)

#         player1 = Profile.objects.get(user_id=player1_id)
#         player2 = Profile.objects.get(user_id=player2_id)

#         # Return the nicknames instead of just user IDs
#         return Response({
#             'message': 'Match found',
#             'players': [player1.nickname, player2.nickname]
#         })

#     return Response({'message': 'Waiting for another player...'})

class JoinQueue(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # Extract the JWT token from the Authorization header
        auth_header = request.headers.get('Authorization')
        token = auth_header.split(" ")[1] if auth_header and " " in auth_header else None

        # Decode the token to get the user_id
        validated_token = JWTAuthentication().get_validated_token(token)
        user_id = validated_token['user_id']  # Extract user_id from the token payload

        # Check if the player is already in the queue
        if not WaitingPlayerModel.objects.filter(player_id=user_id).exists():
            # Add player to the waiting queue if they aren't already in it
            WaitingPlayerModel.objects.create(player_id=user_id)
            return Response({'message': 'You have joined the queue.'}, status=status.HTTP_200_OK)
        else:
            return Response({'message': 'You are already in the queue.'}, status=status.HTTP_200_OK)


class CheckJoinGame(APIView):
    permission_classes = (permissions.AllowAny,)


    def post(self, request):
        # Initialize logging
        logger = logging.getLogger(__name__)

        # Manage the game queue
        ManageGameQueue()

        # Extract JWT token from Authorization header
        auth_header = request.headers.get('Authorization')

        token = auth_header.split(" ")[1] if auth_header and " " in auth_header else None

        # Decode the token to get the user_id
        validated_token = JWTAuthentication().get_validated_token(token)
        user_id = validated_token['user_id']

        # Query the GameServerModel to check if the user is in an existing game
        game_server = GameServerModel.objects.filter(Q(firstPlayerId=user_id) | Q(secondPlayerId=user_id)).first()

        # Check game state and return appropriate response
        if game_server:
            if game_server.state == 'full':
                return Response({'gameId': game_server.serverId}, status=status.HTTP_200_OK)
            else:
                return Response({'message': 'Searching for a game.'}, status=status.HTTP_200_OK)
        else:
            return Response({'message': 'Searching for a game.'}, status=status.HTTP_200_OK)

class ExitQueue(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        logger = logging.getLogger(__name__)
        auth_header = request.headers.get('Authorization')
        token = auth_header.split(" ")[1] if auth_header and " " in auth_header else None

        # Decode the token to get the user_id
        validated_token = JWTAuthentication().get_validated_token(token)
        user_id = validated_token['user_id']  # Extract user_id from the token payload
        logger.info(f"User ID for exit queue: {user_id}")

        # Attempt to find the game server; handle the case where no match is found
        game_server = GameServerModel.objects.filter(Q(firstPlayerId=user_id) | Q(secondPlayerId=user_id)).first()

        # Remove the player from the waiting queue
        try:
            waiting_player = WaitingPlayerModel.objects.get(player_id=user_id)
            waiting_player.delete()
            logger.info(f"Player {user_id} removed from waiting queue.")
        except WaitingPlayerModel.DoesNotExist:
            logger.info(f"Player {user_id} not found in waiting queue.")

        # If a matching game server exists, reset the player slot and state
        if game_server:
            if int(game_server.firstPlayerId) == int(user_id):
                game_server.firstPlayerId = -1
            if int(game_server.secondPlayerId) == int(user_id):
                game_server.secondPlayerId = -1

            # Update state back to 'waiting' only if both slots are empty
            if game_server.firstPlayerId == -1 and game_server.secondPlayerId == -1:
                game_server.state = 'waiting'

            game_server.save()
            logger.info(f"Game server {game_server.serverId} updated: {game_server.firstPlayerId}, {game_server.secondPlayerId}, state: {game_server.state}")
        else:
            logger.info(f"No game server found for player {user_id}.")

        return Response({"message": 'You left the queue'}, status=status.HTTP_200_OK)


#to check if properly connected
class UserDetails(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user  # Get the currently authenticated user

        # Assuming the user has a 'nickname' field in the profile model
        nickname = user.profile.nickname if hasattr(user, 'profile') else None

        # Return the user details
        return Response({
            'username': user.username,
            'email': user.email,
            'nickname': nickname,
            # Note: Never send the hashed password to the frontend!
        })

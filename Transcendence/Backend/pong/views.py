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
from django.utils.translation import get_language
from django.contrib.auth import login, logout, authenticate, get_user_model
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from django.core.exceptions import ValidationError
from .forms import RegistrationForm, ProfileForm, AnonymizationRequestForm, DeletionRequestForm
from .models import Profile, GameServerModel, WaitingPlayerModel
from django.db.models import Q
from .serializers import UserRegisterSerializer, UserLoginSerializer
import os
from .utils import custom_validation, valid_email, valid_password, create_user_token, ManageGameQueue, check_inactive_users, update_user_profile
import json
import urllib.parse
import urllib.request
import requests
import logging
import pyotp  # For generating 2FA tokens
from datetime import timedelta


UserModel = get_user_model()
API_URL = 'https://api.intra.42.fr'
logger = logging.getLogger(__name__)

class GetClientIdView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return JsonResponse({'client_id': settings.SOCIAL_AUTH_42_KEY})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def validate_token(request):
    return Response({'message': 'Token is valid'}, status=status.HTTP_200_OK)

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

    if request.get_host().startswith('localhost'):
        redirect_uri = 'https://localhost:8000/register42'
    else:
        redirect_uri = 'https://10.12.2.4:8000/register42'

    # Exchange the authorization code for access tokens
    token_url = 'https://api.intra.42.fr/oauth/token'
    payload = {
        'grant_type': 'authorization_code',
        'client_id': os.getenv("CLIENT_ID"),
        'client_secret': os.getenv("CLIENT_SECRET"),
        'redirect_uri': redirect_uri,  # Ensure this matches the frontend redirect URL
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
        if request.get_host().startswith('localhost'):
            redirect_uri = 'https://localhost:8000/register42'
        else:
            redirect_uri = 'https://10.12.2.4:8000/register42'

        token_params = {
            "client_id": os.getenv("CLIENT_ID"),
            "client_secret": os.getenv("CLIENT_SECRET"),
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": redirect_uri,
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
                    # Check if 2FA is enabled
                    if user.profile.is_2fa_enabled:
                        return Response({
                            "requires_2fa": True,
                            "user_id": user.id
                        }, status=status.HTTP_200_OK)

                    # Generate JWT tokens
                    refresh = RefreshToken.for_user(user)
                    access = str(refresh.access_token)
                    refresh_token = str(refresh)

                    # Add `user_id` to the access token
                    refresh.access_token["user_id"] = user.id

                    # Set user to online (if your app has an 'isOnline' field in the profile model)
                    if hasattr(user, 'profile'):
                        user.profile.isOnline = True
                        user.profile.connected_from_42_api = True
                        user.profile.save()

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

        # Check if 2FA is enabled
        if user.profile.is_2fa_enabled:
            return Response({
                "requires_2fa": True,
                "user_id": user.id
            }, status=status.HTTP_200_OK)

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
            "refresh": refresh_token,
            "isOnline": user.profile.isOnline
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

class Toggle2FA(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        profile = user.profile

        if not profile.is_2fa_enabled:
            # Generate a new secret key for 2FA only if it doesn't already exist
            if not profile.two_fa_secret:
                profile.two_fa_secret = pyotp.random_base32()
            # Generate a provisioning URI for Google Authenticator
            totp = pyotp.TOTP(profile.two_fa_secret)
            provisioning_uri = totp.provisioning_uri(name=user.username, issuer_name="Transcendence")
        else:
            # Clear the secret key when 2FA is disabled
            provisioning_uri = None

        profile.is_2fa_enabled = not profile.is_2fa_enabled
        profile.save()

        return Response({
            'is_2fa_enabled': profile.is_2fa_enabled,
            'two_fa_secret': profile.two_fa_secret if profile.is_2fa_enabled else None,
            'provisioning_uri': provisioning_uri
        })

class Verify2FA(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        user_id = request.data.get('user_id')
        otp = request.data.get('otp')

        if not user_id or not otp:
            return Response({'error': 'User ID and OTP are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = UserModel.objects.get(pk=user_id)
        except UserModel.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        profile = user.profile
        if not profile.is_2fa_enabled or not profile.two_fa_secret:
            return Response({'error': '2FA is not enabled for this user'}, status=status.HTTP_400_BAD_REQUEST)

        totp = pyotp.TOTP(profile.two_fa_secret)
        if totp.verify(otp):
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
        else:
            return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

# @api_view(['POST'])
# def update_goals(request):
#     user = request.user
#     if not user.is_authenticated:
#         return Response({'error': 'User not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

#     profile = user.profile
#     data = request.data

#     if 'goals' in data:
#         profile.goals += data['goals']
#     if 'goals_taken' in data:
#         profile.goals_taken += data['goals_taken']
#     if 'longuest_exchange' in data:
#         profile.longuest_exchange = max(profile.longuest_exchange, data['longuest_exchange'])
#     # Check if ace is more than 0, if so, increment the ace count
#     if 'ace' in data and data['ace'] > 0:
#         profile.ace += 1

#     profile.save()
#     return Response({'message': 'Profile updated successfully'}, status=status.HTTP_200_OK)

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

class UpdateLanguage(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        language = request.data.get('language')

        if language not in ['en', 'es', 'fr']:
            return Response({'error': 'Invalid language'}, status=status.HTTP_400_BAD_REQUEST)

        profile = user.profile
        profile.language = language
        profile.save()

        return Response({'message': 'Language updated successfully'}, status=status.HTTP_200_OK)

import json
import os
from django.conf import settings
from django.http import JsonResponse
from rest_framework.views import APIView
import logging

logger = logging.getLogger(__name__)

class GetTranslations(APIView):
    permission_classes = [IsAuthenticated]  # Ensure the user is authenticated with JWT

    def get(self, request, language_code):
        if language_code not in ['en', 'es', 'fr']:
            return JsonResponse({'error': 'Invalid language code'}, status=400)

        # Construct the path relative to the project root
        translations_dir = os.path.abspath(os.path.join(settings.BASE_DIR, 'translations'))
        file_path = os.path.join(translations_dir, f'{language_code}.json')

        # Log the current working directory
        logger.info(f"Current working directory: {os.getcwd()}")
        logger.info(f"Translations directory: {translations_dir}")
        logger.info(f"Translation file path: {file_path}")

        # Check if the directory exists
        if not os.path.isdir(translations_dir):
            logger.error(f"Translations directory does not exist: {translations_dir}")
            return JsonResponse({'error': 'Translations directory not found'}, status=404)

        # Check if the file exists
        if not os.path.exists(file_path):
            logger.error(f"Translation file does not exist: {file_path}")
            return JsonResponse({'error': 'Translation file not found'}, status=404)

        # Check file permissions
        if not os.access(file_path, os.R_OK):
            logger.error(f"Translation file is not readable: {file_path}")
            return JsonResponse({'error': 'Translation file is not readable'}, status=403)

        with open(file_path, 'r', encoding='utf-8') as file:
            translations = json.load(file)

        return JsonResponse(translations)


# class JoinQueue(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         # Extract the JWT token from the Authorization header
#         auth_header = request.headers.get('Authorization')
#         token = auth_header.split(" ")[1] if auth_header and " " in auth_header else None

#         # Decode the token to get the user_id
#         validated_token = JWTAuthentication().get_validated_token(token)
#         user_id = validated_token['user_id']  # Extract user_id from the token payload

#         # Check if the player is already in the queue
#         if not WaitingPlayerModel.objects.filter(player_id=user_id).exists():
#             # Add player to the waiting queue if they aren't already in it
#             WaitingPlayerModel.objects.create(player_id=user_id)
#             return Response({'message': 'You have joined the queue.'}, status=status.HTTP_200_OK)
#         else:
#             return Response({'message': 'You are already in the queue.'}, status=status.HTTP_200_OK)


# class CheckJoinGame(APIView):
#     permission_classes = (permissions.AllowAny,)


#     def post(self, request):
#         # Initialize logging
#         logger = logging.getLogger(__name__)

#         # Manage the game queue
#         ManageGameQueue()

#         # Extract JWT token from Authorization header
#         auth_header = request.headers.get('Authorization')

#         token = auth_header.split(" ")[1] if auth_header and " " in auth_header else None

#         # Decode the token to get the user_id
#         validated_token = JWTAuthentication().get_validated_token(token)
#         user_id = validated_token['user_id']

#         # Query the GameServerModel to check if the user is in an existing game
#         game_server = GameServerModel.objects.filter(Q(firstPlayerId=user_id) | Q(secondPlayerId=user_id)).first()

#         # Check game state and return appropriate response
#         if game_server:
#             if game_server.state == 'full':
#                 return Response({'gameId': game_server.serverId}, status=status.HTTP_200_OK)
#             else:
#                 return Response({'message': 'Searching for a game.'}, status=status.HTTP_200_OK)
#         else:
#             return Response({'message': 'Searching for a game.'}, status=status.HTTP_200_OK)

# class ExitQueue(APIView):
#     permission_classes = [permissions.AllowAny]

#     def post(self, request):
#         logger = logging.getLogger(__name__)
#         auth_header = request.headers.get('Authorization')
#         token = auth_header.split(" ")[1] if auth_header and " " in auth_header else None

#         # Decode the token to get the user_id
#         validated_token = JWTAuthentication().get_validated_token(token)
#         user_id = validated_token['user_id']  # Extract user_id from the token payload
#         logger.info(f"User ID for exit queue: {user_id}")

#         # Attempt to find the game server; handle the case where no match is found
#         game_server = GameServerModel.objects.filter(Q(firstPlayerId=user_id) | Q(secondPlayerId=user_id)).first()

#         # Remove the player from the waiting queue
#         try:
#             waiting_player = WaitingPlayerModel.objects.get(player_id=user_id)
#             waiting_player.delete()
#             logger.info(f"Player {user_id} removed from waiting queue.")
#         except WaitingPlayerModel.DoesNotExist:
#             logger.info(f"Player {user_id} not found in waiting queue.")

#         # If a matching game server exists, reset the player slot and state
#         if game_server:
#             if int(game_server.firstPlayerId) == int(user_id):
#                 game_server.firstPlayerId = -1
#             if int(game_server.secondPlayerId) == int(user_id):
#                 game_server.secondPlayerId = -1

#             # Update state back to 'waiting' only if both slots are empty
#             if game_server.firstPlayerId == -1 and game_server.secondPlayerId == -1:
#                 game_server.state = 'waiting'

#             game_server.save()
#             logger.info(f"Game server {game_server.serverId} updated: {game_server.firstPlayerId}, {game_server.secondPlayerId}, state: {game_server.state}")
#         else:
#             logger.info(f"No game server found for player {user_id}.")

#         return Response({"message": 'You left the queue'}, status=status.HTTP_200_OK)

#to check if properly connected
class UserDetails(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username=None):
        if username:
            try:
                user = User.objects.get(username=username)  # Get the user by username
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            user = request.user  # Get the currently authenticated user

        # Update the user profile
        update_user_profile(user)

        # Assuming the user has a 'nickname' field in the profile model
        nickname = user.profile.nickname if hasattr(user, 'profile') else None
        # Generate a provisioning URI for Google Authenticator if 2FA is enabled
        provisioning_uri = None
        if user.profile.is_2fa_enabled:
            totp = pyotp.TOTP(user.profile.two_fa_secret)
            provisioning_uri = totp.provisioning_uri(name=user.username, issuer_name="Transcendence")
        profile_picture_url = user.profile.profile_picture.url if user.profile.profile_picture else '/media/profile_pictures/pepe.png'

        # For match history
        matches_as_player1 = Match.objects.filter(player1=user)
        match_history = list(matches_as_player1)
        match_history.sort(key=lambda x: x.date, reverse=True)
        match_history_data = [
            {
                'player1': match.player1.username,
                'player2': match.player2_nickname,  # Use player2_nickname instead of player2
                'winner': match.winner_nickname,
                'date': match.date,
                'score_player1': match.score_player1,
                'score_player2': match.score_player2,
                'duration': match.duration,  # Time spent in seconds

            }   
            for match in match_history
        ]

        # Calculate stats based on match history
        wins = sum(1 for match in match_history if match.score_player1 > match.score_player2)
        losses = sum(1 for match in match_history if match.score_player1 < match.score_player2)
        goals = sum(match.score_player1 for match in match_history)
        goals_taken = sum(match.score_player2 for match in match_history)
        longuest_exchange = max((match.score_player1 + match.score_player2) for match in match_history) if match_history else 0
        ace = sum(1 for match in match_history if match.ace)
        total_games = wins + losses
        winrate = (wins / total_games) * 100 if total_games > 0 else 0
        total_time_spent = sum(match.duration for match in match_history) # Total time spent in seconds
        # Return the user details
        return Response({
            'username': user.username,
            'email': user.email,
            'nickname': nickname,
            'is_2fa_enabled': user.profile.is_2fa_enabled,
            'two_fa_secret': user.profile.two_fa_secret if user.profile.is_2fa_enabled else None,
            'provisioning_uri': provisioning_uri,
            'language': user.profile.language,
            'profile_picture': profile_picture_url,
            'connected_from_42_api': user.profile.connected_from_42_api,
            'match_history': match_history_data,
            'wins': wins,
            'losses': losses,
            'goals': goals,
            'goals_taken': goals_taken,
            'longuest_exchange': longuest_exchange,
            'ace': ace,
            'winrate': winrate,
            'total_time_spent': total_time_spent,
        })

# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def update_win_loss(request):
#     user = request.user
#     data = request.data
#     winningPlayer = data.get('winningPlayer')

#     if winningPlayer == 'Player1':
#         user.profile.wins += 1
#     elif winningPlayer == 'Player2':
#         user.profile.losses += 1
#     else:
#         return Response({'error': 'Invalid winner'}, status=status.HTTP_400_BAD_REQUEST)

#     user.profile.save()

#     return Response({'message': 'Profile updated successfully'}, status=status.HTTP_200_OK)


class DeleteAccount(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user
        user.delete()
        return Response({'message': 'User account deleted successfully'}, status=status.HTTP_200_OK)

class AnonymizeAccount(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        user.email = f'anonymized_{user.id}@example.com'
        user.username = f'anonymized_{user.id}'
        user.first_name = ''
        user.last_name = ''
        user.save()
        return Response({'message': 'User account anonymized successfully'}, status=status.HTTP_200_OK)


# views.py
from django.contrib.auth.models import User

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def edit_account(request):
    user = request.user
    data = request.data
    # Initialize a dictionary to collect errors
    errors = {}
    # Check if the user is connected with 42 API
    if not user.profile.connected_from_42_api:
        # Validate and update the username
        username = data.get('username')
        if username:
            if User.objects.exclude(pk=user.pk).filter(username=username).exists():
                errors['username'] = 'This username is already taken.'
            else:
                user.username = username

        # Validate and update the email
        email = data.get('email')
        if email:
            if User.objects.exclude(pk=user.pk).filter(email=email).exists():
                errors['email'] = 'This email is already in use.'
            else:
                user.email = email

    # Validate and update the profile picture
    try:
        profile_picture = request.FILES['profilePicture']
        if profile_picture:
            user.profile.profile_picture.save(profile_picture.name, profile_picture)
    except KeyError:
        profile_picture_url = data.get('profilePictureUrl')
        # List of default carousel images
        default_carousel_images = [
            'profile_pictures/pepe_boxe.png',
            'profile_pictures/pepe_glasses.png',
            'profile_pictures/pepe_thumbup.png',
            'profile_pictures/pepe-ohhh.png',
            'profile_pictures/pepe.png'
        ]
        if profile_picture_url:
            # Ensure the URL does not include the MEDIA_URL prefix twice
            if profile_picture_url.startswith(settings.MEDIA_URL):
                profile_picture_url = profile_picture_url[len(settings.MEDIA_URL):]
            # Check if the current profile picture is one of the default carousel images
            if user.profile.profile_picture.name in default_carousel_images:
                user.profile.profile_picture = profile_picture_url
            elif not user.profile.profile_picture:
                user.profile.profile_picture = profile_picture_url

    # If there are validation errors, return them
    if errors:
        return Response(errors, status=status.HTTP_400_BAD_REQUEST)

    # Save the updated user information
    user.save()
    user.profile.save()
    return Response({'message': 'Account updated successfully'}, status=status.HTTP_200_OK)


# views.py
from django.contrib.auth.models import User
from .models import Match

class SaveMatchResult(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        player1 = request.user  # Get the authenticated user
        player1_nickname = data.get('player1_nickname')
        # if not player1_nickname or player1_nickname.lower() in ['unknown', 'player1']:
        #     player1_nickname = player1.profile.nickname  # Get the authenticated user's profile nickname
        player2_nickname = data.get('player2_nickname', 'PaddleMan')  # Default nickname for player2
        winner_nickname = data.get('winner_nickname')
        score_player1 = data.get('score_player1')
        score_player2 = data.get('score_player2')
        duration = data.get('duration')

        if winner_nickname is None or score_player1 is None or score_player2 is None or duration is None:
            return Response({'error': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)

        ace = False
        if (score_player1 == 5 and score_player2 == 0):
            ace = True

        # Ensure winner_nickname is player1_nickname if player1 wins
        if winner_nickname == 'Player1':
            winner_nickname = player1_nickname
        elif winner_nickname == 'Player2':
            winner_nickname = player2_nickname
        match = Match.objects.create(
            player1=player1,  # Assign the User instance
            player2_nickname=player2_nickname,
            winner_nickname=winner_nickname,
            score_player1=score_player1,
            score_player2=score_player2,
            ace=ace,
            duration=duration
        )

        return Response({'message': 'Match result saved successfully', 'match_id': match.id}, status=status.HTTP_201_CREATED)

#Friend gestion

class AddFriendView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        username = request.data.get('username')
        if not username:
            return Response({'error': 'Username is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            friend = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        if friend == request.user:
            return Response({'error': 'You cannot add yourself as a friend'}, status=status.HTTP_400_BAD_REQUEST)

        request.user.profile.friends.add(friend.profile)
        return Response({'message': 'Friend added successfully'}, status=status.HTTP_200_OK)

from django.utils import timezone

class FriendListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Update last_activity and isOnline fields
        user = request.user
        now = timezone.now()
        user.profile.last_activity = now
        user.profile.isOnline = True
        user.profile.save()

        # Check for inactive users
        check_inactive_users()

        # Get the friend list for the current user
        friends = user.profile.friends.all()  # Assuming you have a friends relationship

        friend_list = [
            {
                'username': friend.user.username,  # Access username through the user relationship
                'nickname': friend.nickname,
                'profilePicture': friend.profile_picture.url,
                'isOnline': friend.isOnline,
                'last_activity': friend.last_activity,
            }
            for friend in friends
        ]

        return Response(friend_list)

from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.contrib.auth import login, get_user_model, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect  # Import redirect and render functions
from rest_framework.decorators import authentication_classes
from django.contrib.auth import login, logout, authenticate, get_user_model
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from django.core.exceptions import ValidationError

import logging
import random  # For simulating matchmaking
import logging


User = get_user_model()
API_URL = 'https://api.intra.42.fr'
logger = logging.getLogger(__name__)

class GetClientIdView(APIView):
    @permission_classes([permissions.AllowAny])

    def get(self, request):
        return JsonResponse({'client_id': settings.SOCIAL_AUTH_42_KEY})

def oauth_callback(request):
    # Step 1: Get authorization code
    code = request.GET.get('code')
    if not code:
        return JsonResponse({'error': 'Missing code parameter'}, status=400)

    # Step 2: Exchange code for an access token
    data = {
        'grant_type': 'authorization_code',
        'client_id': settings.SOCIAL_AUTH_42_KEY,
        'client_secret': settings.SOCIAL_AUTH_42_SECRET,
        'code': code,
        'redirect_uri': settings.SOCIAL_AUTH_42_REDIRECT_URI,
    }

    try:
        token_response = requests.post(f'{API_URL}/oauth/token', data=data)
        token_response.raise_for_status()  # Will raise an HTTPError for bad responses
    except requests.exceptions.RequestException as e:
        # Log the error and return a user-friendly error response
        logger.error(f"Error exchanging code for token: {e}")
        return JsonResponse({'error': 'Failed to exchange code for token'}, status=400)

    # Log the token response JSON for debugging
    logger.debug(f"Token response: {token_response.json()}")

    # Step 3: Retrieve access token from response
    token_data = token_response.json()
    access_token = token_data.get('access_token')
    if not access_token:
        return JsonResponse({'error': 'Access token not found in the response'}, status=400)

    headers = {'Authorization': f'Bearer {access_token}'}

    # Step 4: Fetch user info from 42 API
    try:
        user_info_response = requests.get(f'{API_URL}/v2/me', headers=headers)
        user_info_response.raise_for_status()
    except requests.exceptions.RequestException as e:
        # Log the error and return a user-friendly error response
        logger.error(f"Error fetching user info: {e}")
        return JsonResponse({'error': 'Failed to fetch user info'}, status=400)

    # Log the user info response JSON for debugging
    logger.debug(f"User info response: {user_info_response.json()}")

    user_info = user_info_response.json()
    username = user_info.get('login')
    email = user_info.get('email')

    if not username or not email:
        return JsonResponse({'error': 'User info is incomplete'}, status=400)

    # Step 5: Check if the user exists, create if not
    user, created = User.objects.get_or_create(username=username, defaults={'email': email})

    # Step 6: Authenticate and create JWT tokens
    if user is not None:
        # Log the user in
        login(request, user)

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        # Store tokens in the session (optional)
        request.session['access_token'] = str(refresh.access_token)
        request.session['refresh_token'] = str(refresh)

        # Log successful login
        logger.info(f"User {username} logged in successfully.")

        # Redirect to /menu after successful login
        return redirect('/menu')

    return JsonResponse({'error': 'Authentication failed.'}, status=401)


from .forms import RegistrationForm, ProfileForm
from .models import Profile, GameServerModel, WaitingPlayerModel
from django.db.models import Q

from .serializers import UserRegisterSerializer, UserLoginSerializer
from .utils import custom_validation, valid_email, valid_password, create_user_token
import json

UserModel = get_user_model()
logger = logging.getLogger(__name__)

# Register new user
class UserRegister(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # Clean data using the custom validation function
        print("Request data:", request.data)
        logger.info(f"!!!!!!!!!!!!!!!!!!!!Data is : {request.data}")
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
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        user_id = request.data.get("userId")
        if not user_id:
            return Response({"message": "User ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Add player to waiting queue
        WaitingPlayerModel.objects.create(player_id=user_id)
        return Response({'message': 'You have joined the queue.'}, status=status.HTTP_200_OK)


def manage_game_queue():
    # Get players in queue
    waiting_players = WaitingPlayerModel.objects.all()
    if waiting_players.count() >= 2:
        # Retrieve and delete two players from the queue
        player1 = waiting_players[0]
        player2 = waiting_players[1]

        # Remove players from waiting queue
        player1.delete()
        player2.delete()

        # Create new game
        new_game = GameServerModel.objects.create(
            firstPlayerId=player1.player_id,
            secondPlayerId=player2.player_id,
            state='full'
        )
        return new_game
    return None

class CheckJoinGame(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        user_id = request.data.get("userId")

        # Check and assign game if two players are available
        new_game = manage_game_queue()

        # Check if the user is already assigned to a game
        game_server = GameServerModel.objects.filter(
            Q(firstPlayerId=user_id) | Q(secondPlayerId=user_id)
        ).first()

        if game_server and game_server.state == 'full':
            return Response({'gameId': game_server.serverId}, status=status.HTTP_200_OK)

        return Response({'message': 'Searching for a game.'}, status=status.HTTP_200_OK)

class ExitQueue(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        user_id = request.data.get("userId")

        # Remove player from waiting queue
        WaitingPlayerModel.objects.filter(player_id=user_id).delete()

        # Update game server if player was in a game
        game_server = GameServerModel.objects.filter(
            Q(firstPlayerId=user_id) | Q(secondPlayerId=user_id)
        ).first()

        if game_server:
            if game_server.firstPlayerId == user_id:
                game_server.firstPlayerId = -1
            elif game_server.secondPlayerId == user_id:
                game_server.secondPlayerId = -1
            game_server.state = 'waiting'
            game_server.save()

        return Response({"message": 'You left the queue'}, status=status.HTTP_200_OK)

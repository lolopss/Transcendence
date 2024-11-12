from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.contrib.auth import login, get_user_model, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect  # Import redirect and render functions
from rest_framework.decorators import authentication_classes
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from .forms import RegistrationForm
from .forms import ProfileForm
from .models import Profile
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


@api_view(['POST'])
@permission_classes([permissions.AllowAny])  # Allows anyone to access this view
def user_register(request):
    form = RegistrationForm(request.data)
    if form.is_valid():
        user = form.save()
        login(request, user)
        return Response({'message': 'User registered successfully.'}, status=status.HTTP_201_CREATED)

    return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)


@authentication_classes([])
class UserLoginView(APIView):

    permission_classes = [permissions.AllowAny]
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        # Authenticate the user
        user = authenticate(username=username, password=password)

        if user is not None:
            # Generate JWT token
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'Login successful.',
                'token': str(refresh.access_token),  # Access token for authorization
                'refresh_token': str(refresh)        # Refresh token to get a new access token when it expires
            }, status=status.HTTP_200_OK)

        return Response({'error': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
def user_logout(request):
    logout(request)
    return Response({'message': 'Logged out successfully.'})

from rest_framework.permissions import IsAuthenticated

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

# This will hold your matchmaking queue
matchmaking_queue = []

@api_view(['POST'])
def matchmaking(request):
    try:
        user_id = request.data.get('user_id')
        matchmaking_queue.append(user_id)

        if len(matchmaking_queue) >= 2:
            player1 = matchmaking_queue.pop(0)
            player2 = matchmaking_queue.pop(0)
            return Response({'message': 'Match found', 'players': [player1, player2]})

        return Response({'message': 'Waiting for another player...'})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

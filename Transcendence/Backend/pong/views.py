from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect  # Import redirect and render functions
from django.shortcuts import render
from rest_framework.decorators import authentication_classes
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from .forms import RegistrationForm
from .forms import ProfileForm
from .models import Profile

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

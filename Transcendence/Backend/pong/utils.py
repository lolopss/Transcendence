from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

UserModel = get_user_model()

def custom_validation(data):
    email = data['email'].strip()
    username = data['username'].strip()
    password = data['password1'].strip()

    # Check if email is valid and unique
    if not email or UserModel.objects.filter(email=email).exists():
        raise ValidationError('Choose another email')

    # Check if password meets minimum length requirements
    if not password or len(password) < 8:
        raise ValidationError('Password must be at least 8 characters')

    # Check if username is provided
    if not username:
        raise ValidationError('Choose a username')
    return data



def valid_email(data):
    email = data['email'].strip()
    if not email:
        raise ValidationError('an email is needed')
    return True

def valid_username(data):
    username = data['username'].strip()
    if not username:
        raise ValidationError('choose another username')
    return True

def valid_password(data):
    password = data['password1'].strip()
    if not password:
        raise ValidationError('a password is needed')
    return True

def create_user_token(user):
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh)
    }
from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.core.exceptions import ValidationError
from .models import Profile
from .utils import custom_validation

import re


UserModel = get_user_model()


class UserLoginSerializer(serializers.Serializer):
    identifier = serializers.CharField()  # Can be either email or username
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        identifier = data['identifier']
        password = data['password']

        # Check if identifier is email by regex, otherwise treat it as username
        if re.match(r"[^@]+@[^@]+\.[^@]+", identifier):
            user = authenticate(email=identifier, password=password)
        else:
            user = authenticate(username=identifier, password=password)

        if not user:
            raise serializers.ValidationError('Invalid credentials')
        return user

class UserRegisterSerializer(serializers.ModelSerializer):
    password1 = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = UserModel
        fields = ['email', 'username', 'password1', 'password2']

    def validate(self, data):
        # Custom validation to check for matching passwords and other conditions
        custom_validation(data)

        # Ensure passwords match
        if data['password1'] != data['password2']:
            raise ValidationError("Passwords don't match.")
        return data

    def create(self, validated_data):
        # Create the user and set their password
        user = UserModel.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password1']
        )
        return user
from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm


#Used for the registration
class RegistrationForm(UserCreationForm):
    email = forms.EmailField(required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']
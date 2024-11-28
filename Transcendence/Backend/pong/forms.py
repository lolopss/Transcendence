from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import Profile

class RegistrationForm(UserCreationForm):
    nickname = forms.CharField(max_length=15, required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2', 'nickname')

    def save(self, commit=True):
        user = super().save(commit=commit)
        if commit:
            user.profile.nickname = self.cleaned_data['nickname']
            user.profile.save()
        return user


class ProfileForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ['nickname', 'wins', 'losses', 'profile_picture']
        
    def save(self, commit=True):
        user = super(ProfileForm, self).save(commit=False)
        if self.cleaned_data['profile_picture']:
            user.profile_picture = self.cleaned_data['profile_picture']
        if commit:
            user.save()
        return user

class AnonymizationRequestForm(forms.Form):
    confirm = forms.BooleanField(label="I confirm that I want to anonymize my data")

class DeletionRequestForm(forms.Form):
    confirm = forms.BooleanField(label="I confirm that I want to delete my account")
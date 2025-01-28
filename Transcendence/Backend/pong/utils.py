from django.contrib.auth.password_validation import validate_password
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

    # Delegate password validation to Django's built-in validators
    try:
        validate_password(password)
    except ValidationError as e:
        raise ValidationError(e.messages)

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

def create_user_token(user):
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh)
    }

import logging
from django.conf import settings

def ManageGameQueue():
    logger = logging.getLogger(__name__)
    if not settings.IS_SEARCHING:
        settings.IS_SEARCHING = True
        from . models import GameServerModel, WaitingPlayerModel
        # Attempt to find a game server with a 'waiting' state
        game_server = GameServerModel.objects.filter(state='waiting').first()

        if game_server:
            if game_server.firstPlayerId == -1:
                player1 = WaitingPlayerModel.objects.first()
                if player1:
                    game_server.firstPlayerId = player1.player_id
                    game_server.save()
                    player1.delete()

            if game_server.secondPlayerId == -1:
                player2 = WaitingPlayerModel.objects.first()
                if player2:
                    game_server.secondPlayerId = player2.player_id
                    game_server.save()
                    player2.delete()

            # If both players are assigned, set the game server state to 'full'
            if game_server.firstPlayerId != -1 and game_server.secondPlayerId != -1:
                game_server.state = 'full'
                game_server.save()
                logger.info(f"Game server {game_server.serverId} is now full")

        else:
            # Create a new game server if none is available
            GameServerModel.objects.create()
            logger.info("No waiting game server found. Creating a new game server.")

        settings.IS_SEARCHING = False
    else:
        settings.IS_SEARCHING = False

from django.utils import timezone
from django.contrib.auth.models import User
from datetime import timedelta

def check_inactive_users():
    now = timezone.now()
    twentytwo_seconds_ago = now - timedelta(seconds=22)
    inactive_users = User.objects.filter(profile__last_activity__lt=twentytwo_seconds_ago, profile__isOnline=True)

    for user in inactive_users:
        user.profile.isOnline = False
        user.profile.save()

from .models import Profile, Match

def update_user_profile(user):
    profile = user.profile

    # Fetch match history
    matches_as_player1 = Match.objects.filter(player1=user)
    match_history = list(matches_as_player1)
    match_history.sort(key=lambda x: x.date, reverse=True)

    # Calculate stats based on match history
    wins = sum(1 for match in match_history if match.score_player1 > match.score_player2)
    losses = sum(1 for match in match_history if match.score_player1 < match.score_player2)
    goals = sum(match.score_player1 for match in match_history)
    goals_taken = sum(match.score_player2 for match in match_history)
    longest_exchange = max((match.score_player1 + match.score_player2) for match in match_history) if match_history else 0
    ace = sum(1 for match in match_history if match.ace)
    total_time_spent = sum(match.duration for match in match_history)  # Total time spent in seconds

    # Update profile fields
    profile.wins = wins
    profile.losses = losses
    profile.goals = goals
    profile.goals_taken = goals_taken
    profile.longuest_exchange = longest_exchange
    profile.ace = ace
    profile.total_time_in_game = total_time_spent

    # Save the updated profile
    profile.save()

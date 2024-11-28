from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User  # Import Django's built-in User model
from django.utils import timezone

class Profile(models.Model):
    # Establish a one-to-one relationship with the Django built-in User model
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')

    nickname = models.CharField(max_length=15)
    wins = models.IntegerField(default=0)  # Track the number of wins
    losses = models.IntegerField(default=0)  # Track the number of losses
    goals = models.IntegerField(default=0)  # Track the number of goals done
    goals_taken = models.IntegerField(default=0)  # Track the number of goals taken
    longuest_exchange = models.IntegerField(default=0)  # Track the longuest exchange
    ace = models.IntegerField(default=0)  # Track the number of ace
    isOnline = models.BooleanField(default=False)  # Add this line
    is_2fa_enabled = models.BooleanField(default=False)
    two_fa_secret = models.CharField(max_length=32, blank=True, null=True)
    anonymized = models.BooleanField(default=False) #RGPD
    deletion_requested = models.BooleanField(default=False) #RGPD
    last_activity = models.DateTimeField(default=timezone.now)  # Add this line
    language = models.CharField(max_length=2, default='en')
    profile_picture = models.ImageField(upload_to='profile_pictures/', default='profile_pictures/pepe.png')
    connected_from_42_api = models.BooleanField(default=False)  # New field
    friends = models.ManyToManyField('self', blank=True)

    @property
    def winrate(self):
        # Calculate winrate as a percentage
        total_games = self.wins + self.losses
        if total_games == 0:
            return 0
        return (self.wins / total_games) * 100

    def __str__(self):
        return f"{self.user.username} Profile"
# Signal handler to create or update the Profile whenever the User is saved
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

class GameServerModel(models.Model):
	serverId = models.AutoField(primary_key=True)
	firstPlayerId = models.IntegerField(default=-1)
	secondPlayerId = models.IntegerField(default=-1)
	state = models.CharField(max_length=10, default="waiting")
	def __str__(self):
		return f"{self.serverId}"

class WaitingPlayerModel(models.Model):
	player_id = models.IntegerField()

class Match(models.Model):
    player1 = models.ForeignKey(User, related_name='matches_as_player1', on_delete=models.CASCADE)
    player2 = models.ForeignKey(User, related_name='matches_as_player2', on_delete=models.CASCADE)
    winner = models.ForeignKey(User, related_name='matches_won', on_delete=models.CASCADE)
    date = models.DateTimeField(auto_now_add=True)
    score_player1 = models.IntegerField()
    score_player2 = models.IntegerField()

    def __str__(self):
        return f"Match {self.id} - {self.player1.username} vs {self.player2.username}"
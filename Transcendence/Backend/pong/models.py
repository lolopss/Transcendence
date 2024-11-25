from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User  # Import Django's built-in User model

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
    is_2fa_enabled = models.BooleanField(default=False)
    two_fa_secret = models.CharField(max_length=32, blank=True, null=True)
    anonymized = models.BooleanField(default=False) #RGPD
    deletion_requested = models.BooleanField(default=False) #RGPD
    language = models.CharField(max_length=2, default='en')
    profile_picture = models.ImageField(upload_to='profile_pictures/', default='profile_pictures/pepe.jpg')

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

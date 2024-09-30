from django.contrib import admin
from .models import Profile
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'nickname', 'wins', 'losses', 'winrate_display')  # Ensure fields are correct

    def winrate_display(self, obj):
        # Use obj to access the profile instance
        return f"{obj.winrate:.2f}%"  # Format winrate to 2 decimal places

    winrate_display.short_description = 'Winrate (%)'  # Set column name in the admin interface

admin.site.register(Profile, ProfileAdmin)

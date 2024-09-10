from django.contrib import admin
from .models import User

class UserAdmin(admin.ModelAdmin):
    list_display = ('nickname', 'email', 'wins', 'losses', 'winrate_display')

    def winrate_display(self, obj):
        # Format winrate as a percentage with 2 decimal places
        return f"{obj.winrate:.2f}%"
    winrate_display.short_description = 'Winrate'

admin.site.register(User, UserAdmin)

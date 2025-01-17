# Generated by Django 5.1 on 2024-11-08 13:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pong', '0004_profile_ace_profile_goals_profile_goals_taken_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='GameServerModel',
            fields=[
                ('serverId', models.AutoField(primary_key=True, serialize=False)),
                ('firstPlayerId', models.IntegerField(default=-1)),
                ('secondPlayerId', models.IntegerField(default=-1)),
                ('state', models.CharField(default='waiting', max_length=10)),
            ],
        ),
        migrations.CreateModel(
            name='WaitingPlayerModel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('player_id', models.IntegerField()),
            ],
        ),
    ]

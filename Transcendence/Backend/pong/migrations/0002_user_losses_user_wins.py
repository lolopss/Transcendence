# Generated by Django 5.1 on 2024-09-10 13:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pong', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='losses',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='user',
            name='wins',
            field=models.IntegerField(default=0),
        ),
    ]
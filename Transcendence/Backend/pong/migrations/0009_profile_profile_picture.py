# Generated by Django 5.1 on 2024-11-25 14:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pong', '0008_profile_anonymized_profile_deletion_requested'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='profile_picture',
            field=models.ImageField(blank=True, null=True, upload_to='profile_pictures/'),
        ),
    ]
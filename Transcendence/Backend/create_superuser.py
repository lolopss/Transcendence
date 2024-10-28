import os
import sys
from django.core.management import execute_from_command_line

# To automate the creation of the django admin (Superuser) 
if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "your_project_name.settings")
    try:
        import django
        django.setup()
    except ImportError:
        raise ImportError("Could not import Django. Make sure it is installed and accessible.")

    from django.contrib.auth import get_user_model
    from django.core.management import call_command

    User = get_user_model()

    username = os.getenv('DJANGO_SUPERUSER_USERNAME')
    email = os.getenv('DJANGO_SUPERUSER_EMAIL')
    password = os.getenv('DJANGO_SUPERUSER_PASSWORD')

    if username and email and password:
        if not User.objects.filter(username=username).exists():
            User.objects.create_superuser(username=username, email=email, password=password)
            print(f"Superuser '{username}' created successfully.")
        else:
            print(f"Superuser '{username}' already exists.")
    else:
        print("Superuser environment variables not set.")

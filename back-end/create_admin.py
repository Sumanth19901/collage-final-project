import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'acia_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()
username = 'admin'
email = 'admin@example.com'
password = 'admin_password_2026'

if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username, email, password)
    print('Superuser created successfully.')
else:
    print('Superuser already exists. Setting password.')
    user = User.objects.get(username=username)
    user.set_password(password)
    user.save()

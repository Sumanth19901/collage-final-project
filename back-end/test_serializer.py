import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'acia_backend.settings')
django.setup()

from api.serializers import RegisterSerializer

data = {
    'username': 'newuser123@example.com',
    'email': 'newuser123@example.com',
    'password': '123Password!@#'
}

s = RegisterSerializer(data=data)
if s.is_valid():
    print("Valid!")
else:
    print("Errors:", s.errors)

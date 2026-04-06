import requests

res = requests.post('http://localhost:8000/api/auth/login/', json={
    'email': 'test1@example.com',
    'password': '123Password!@#'
})

print(res.status_code)
print(res.text)

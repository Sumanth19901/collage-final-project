import requests

def run():
    # Test Demo Login
    res = requests.post('http://localhost:8000/api/auth/login/', json={
        'email': 'kasisumanth8@gmail.com',
        'password': 'admin_password_2026'
    })

    print("Demo Login:")
    print(res.status_code)
    print(res.text)

    # Test generic login failure
    res = requests.post('http://localhost:8000/api/auth/login/', json={
        'email': 'user_does_not_exist@example.com',
        'password': 'password123'
    })

    print("\nGeneric Login:")
    print(res.status_code)
    print(res.text)


if __name__ == '__main__':
    run()

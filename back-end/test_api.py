import requests

def run():
    res = requests.post('http://localhost:8000/api/auth/register/', json={
        'username': 'test1@example.com',
        'email': 'test1@example.com',
        'password': '123Password!@#'
    })

    print(res.status_code)
    print(res.text)


if __name__ == '__main__':
    run()

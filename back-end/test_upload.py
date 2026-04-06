import requests
import json

def test():
    r = requests.post('http://localhost:8000/api/auth/login/', json={'email':'admin@demo.acia','password':'admin_password_2026'})
    token = r.json().get('token')
    print('Login:', r.status_code)
    
    # create a dummy PDF file
    with open('dummy.pdf', 'wb') as f:
        f.write(b'%PDF-1.4\n%EOF\n')
        
    with open('dummy.pdf', 'rb') as f:
        r2 = requests.post('http://localhost:8000/api/resume/upload/', 
                          headers={'Authorization': 'Bearer ' + token}, 
                          files={'resume': ('dummy.pdf', f, 'application/pdf')})
        print('Upload:', r2.status_code, r2.text)

if __name__ == '__main__':
    test()

import requests
res = requests.post('http://localhost:8001/auth/login', json={'email': 'admin@agri.gov', 'password': 'admin123'})
token = res.json().get('access_token')
print("Token:", token[:10])
res2 = requests.get('http://localhost:8001/auth/me', headers={'Authorization': f'Bearer {token}'})
print("Me:", res2.status_code, res2.json())

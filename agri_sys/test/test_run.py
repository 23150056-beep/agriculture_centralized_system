import requests

try:
    res = requests.post('http://localhost:8001/auth/login', json={'email': 'admin@agri.gov', 'password': 'admin123'})
    print("Login:", res.status_code, res.json())
    token = res.json().get('access_token')
    
    headers = {'Authorization': f'Bearer {token}'}
    res2 = requests.get('http://localhost:8001/analytics/distributions/by-month', headers=headers)
    print("Analytics:", res2.status_code, res2.text)
except Exception as e:
    print(e)

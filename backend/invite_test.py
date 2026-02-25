import requests, json
url = 'http://127.0.0.1:8000/users/invite'
payload = {
    "email": "teststudent@example.com",
    "full_name": "Test Student",
    "class_name": "10A"
}
resp = requests.post(url, json=payload)
print('Status:', resp.status_code)
print('Response:', resp.text)

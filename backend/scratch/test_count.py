import urllib.request
import json

req = urllib.request.Request(
    "http://127.0.0.1:8000/api/accounts/login/",
    data=json.dumps({"email": "nithinkumarreddy1538@gmail.com", "password": "Nithin@1538"}).encode("utf-8"),
    headers={"Content-Type": "application/json"}
)
with urllib.request.urlopen(req) as resp:
    token = json.loads(resp.read().decode("utf-8"))["token"]

req_m = urllib.request.Request(
    "http://127.0.0.1:8000/api/pharmacy/medicines/",
    headers={"Authorization": f"Token {token}"}
)
with urllib.request.urlopen(req_m) as r:
    meds = json.loads(r.read().decode("utf-8"))
    print(f"Verified API returns {len(meds)} medicines!")


# Ini untuk mengelola proses Login dengan Meta menggunakan OAuth.
import json
import os
import secrets
import time
import urllib.parse
import urllib.request
import urllib.error

from dotenv import load_dotenv
from fastapi import APIRouter, Cookie
from fastapi.responses import RedirectResponse, JSONResponse

# Ini untuk membaca konfigurasi rahasia dari file .env lokal.
load_dotenv()

router = APIRouter(prefix="/api/auth/meta", tags=["Meta Authentication"])

# Ini untuk menyimpan state OAuth dan sesi sementara selama tahap pengembangan.
OAUTH_STATES = {}
USER_SESSIONS = {}

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
GRAPH_VERSION = os.getenv("META_GRAPH_VERSION", "v25.0")
REDIRECT_URI = os.getenv(
    "META_REDIRECT_URI",
    "http://127.0.0.1:8000/api/auth/meta/callback",
)


# Ini untuk membaca JSON dari Meta Graph API.
def meta_get(url):
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "OneDashboard/1.0"},
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


# Ini untuk mengarahkan pengguna ke halaman persetujuan Meta.
@router.get("/login")
def meta_login():
    app_id = os.getenv("META_APP_ID")

    if not app_id:
        return RedirectResponse(
            f"{FRONTEND_URL}/login?meta=not_configured",
            status_code=302,
        )

    state = secrets.token_urlsafe(32)
    OAUTH_STATES[state] = time.time() + 600

    params = urllib.parse.urlencode({
        "client_id": app_id,
        "redirect_uri": REDIRECT_URI,
        "state": state,
        "response_type": "code",
        "scope": ",".join([
            "pages_show_list",
            "pages_read_engagement",
            "instagram_basic",
            "instagram_manage_insights",
        ]),
    })

    return RedirectResponse(
        f"https://www.facebook.com/{GRAPH_VERSION}/dialog/oauth?{params}",
        status_code=302,
    )


# Ini untuk menerima authorization code dari Meta dan mencari akun Instagram profesional.
@router.get("/callback")
def meta_callback(
    code: str = "",
    state: str = "",
    error: str = "",
    error_description: str = "",
):
    if error:
        return RedirectResponse(
            f"{FRONTEND_URL}/login?meta=denied",
            status_code=302,
        )

    expires_at = OAUTH_STATES.pop(state, None)
    if not state or not expires_at or expires_at < time.time() or not code:
        return RedirectResponse(
            f"{FRONTEND_URL}/login?meta=invalid_state",
            status_code=302,
        )

    app_id = os.getenv("META_APP_ID")
    app_secret = os.getenv("META_APP_SECRET")

    if not app_id or not app_secret:
        return RedirectResponse(
            f"{FRONTEND_URL}/login?meta=not_configured",
            status_code=302,
        )

    # Ini untuk menukar authorization code menjadi user access token.
    token_params = urllib.parse.urlencode({
        "client_id": app_id,
        "client_secret": app_secret,
        "redirect_uri": REDIRECT_URI,
        "code": code,
    })
    token_url = (
        f"https://graph.facebook.com/{GRAPH_VERSION}/oauth/access_token?"
        f"{token_params}"
    )

    try:
        token_data = meta_get(token_url)
        user_token = token_data["access_token"]

        # Ini untuk menukar token awal menjadi token jangka panjang Meta.
        long_token_params = urllib.parse.urlencode({
            "grant_type": "fb_exchange_token",
            "client_id": app_id,
            "client_secret": app_secret,
            "fb_exchange_token": user_token,
        })
        long_token_url = (
            f"https://graph.facebook.com/{GRAPH_VERSION}/oauth/access_token?"
            f"{long_token_params}"
        )
        long_token_data = meta_get(long_token_url)
        user_token = long_token_data.get("access_token", user_token)

        # Ini untuk mengambil Facebook Page yang terhubung dengan Instagram profesional.
        account_params = urllib.parse.urlencode({
            "fields": "id,name,access_token,instagram_business_account{id,username}",
            "access_token": user_token,
        })
        accounts_url = (
            f"https://graph.facebook.com/{GRAPH_VERSION}/me/accounts?"
            f"{account_params}"
        )
        accounts_data = meta_get(accounts_url)

        connected_page = None
        for page in accounts_data.get("data", []):
            instagram_account = page.get("instagram_business_account")
            if instagram_account:
                connected_page = {
                    "page_id": page.get("id"),
                    "page_name": page.get("name"),
                    "instagram_user_id": instagram_account.get("id"),
                    "instagram_username": instagram_account.get("username"),
                    "page_access_token": page.get("access_token"),
                    "user_access_token": user_token,
                }
                break

        if not connected_page:
            return RedirectResponse(
                f"{FRONTEND_URL}/login?meta=no_instagram",
                status_code=302,
            )

        # Ini untuk membuat sesi login tanpa mengirim token ke browser.
        session_id = secrets.token_urlsafe(32)
        USER_SESSIONS[session_id] = connected_page

        response = RedirectResponse(
            f"{FRONTEND_URL}/login?meta=connected",
            status_code=302,
        )
        response.set_cookie(
            key="one_dashboard_session",
            value=session_id,
            httponly=True,
            secure=os.getenv("META_COOKIE_SECURE", "false").lower() == "true",
            samesite="lax",
            max_age=86400,
            path="/",
        )
        return response

    except (urllib.error.HTTPError, urllib.error.URLError, KeyError, ValueError):
        return RedirectResponse(
            f"{FRONTEND_URL}/login?meta=failed",
            status_code=302,
        )


# Ini untuk memeriksa status koneksi Meta tanpa membocorkan access token.
@router.get("/status")
def meta_status(
    one_dashboard_session: str | None = Cookie(default=None),
):
    session = USER_SESSIONS.get(one_dashboard_session or "")
    if not session:
        return {"connected": False, "account": None}

    return {
        "connected": True,
        "account": {
            "username": session.get("instagram_username"),
            "instagram_user_id": session.get("instagram_user_id"),
            "page_name": session.get("page_name"),
        },
    }


# Ini untuk menghapus sesi Meta dari One Dashboard.
@router.post("/logout")
def meta_logout(
    one_dashboard_session: str | None = Cookie(default=None),
):
    if one_dashboard_session:
        USER_SESSIONS.pop(one_dashboard_session, None)

    response = JSONResponse({"connected": False, "message": "Meta berhasil diputus."})
    response.delete_cookie("one_dashboard_session", path="/")
    return response

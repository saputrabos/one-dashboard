
# Ini untuk mengambil konfigurasi dan mengirim HTTP request ke Meta Graph API.
import os
import json
import re
import urllib.parse
import urllib.request
import urllib.error

from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/competitors", tags=["Competitor Intelligence"])


# Ini untuk mengambil profil dan konten publik akun Instagram profesional.
@router.get("/{username}")
def analyze_competitor(username: str):
    username = username.strip().replace("@", "")

    # Ini untuk memastikan format username valid.
    if not re.fullmatch(r"[A-Za-z0-9._]{1,30}", username):
        raise HTTPException(status_code=400, detail="Format username tidak valid.")

    # Ini untuk membaca kredensial Meta dari environment backend.
    access_token = os.getenv("IG_ACCESS_TOKEN")
    instagram_user_id = os.getenv("IG_USER_ID")
    graph_version = os.getenv("META_GRAPH_VERSION", "v27.0")

    if not access_token or not instagram_user_id:
        raise HTTPException(
            status_code=503,
            detail=(
                "Meta API belum dikonfigurasi. "
                "Atur IG_ACCESS_TOKEN dan IG_USER_ID pada environment backend."
            ),
        )

    # Ini untuk menentukan data profil dan 12 konten terbaru yang diminta.
    fields = (
        f"business_discovery.username({username})"
        "{username,name,biography,website,profile_picture_url,"
        "followers_count,follows_count,media_count,"
        "media.limit(12){id,caption,media_type,permalink,"
        "timestamp,like_count,comments_count}}"
    )

    params = urllib.parse.urlencode({
        "fields": fields,
        "access_token": access_token,
    })

    url = (
        f"https://graph.facebook.com/{graph_version}/"
        f"{instagram_user_id}?{params}"
    )

    # Ini untuk meminta data kepada Meta Graph API.
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "OneDashboard/1.0"},
    )

    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            result = json.loads(response.read().decode("utf-8"))

    except urllib.error.HTTPError as error:
        try:
            error_data = json.loads(error.read().decode("utf-8"))
            message = error_data.get("error", {}).get(
                "message", "Meta API menolak permintaan."
            )
        except Exception:
            message = "Tidak dapat mengambil data dari Meta API."

        raise HTTPException(status_code=502, detail=message)

    except urllib.error.URLError:
        raise HTTPException(
            status_code=503,
            detail="Tidak dapat terhubung ke Meta Graph API.",
        )

    # Ini untuk mengambil objek business_discovery dari respons Meta.
    profile = result.get("business_discovery")

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Akun tidak ditemukan atau tidak tersedia melalui Business Discovery.",
        )

    media = profile.get("media", {}).get("data", [])

    # Ini untuk menghitung interaksi publik pada setiap konten.
    analyzed_media = []

    for item in media:
        likes = item.get("like_count", 0)
        comments = item.get("comments_count", 0)

        analyzed_media.append({
            "id": item.get("id"),
            "caption": item.get("caption", ""),
            "media_type": item.get("media_type"),
            "permalink": item.get("permalink"),
            "timestamp": item.get("timestamp"),
            "likes": likes,
            "comments": comments,
            "engagement": likes + comments,
        })

    # Ini untuk mengembalikan data profil dan konten ke frontend.
    return {
        "source": "Meta Graph API - Business Discovery",
        "profile": {
            "username": profile.get("username"),
            "name": profile.get("name"),
            "biography": profile.get("biography"),
            "website": profile.get("website"),
            "profile_picture_url": profile.get("profile_picture_url"),
            "followers_count": profile.get("followers_count"),
            "follows_count": profile.get("follows_count"),
            "media_count": profile.get("media_count"),
        },
        "media": analyzed_media,
        "media_analyzed": len(analyzed_media),
    }

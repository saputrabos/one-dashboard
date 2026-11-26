
from competitor import router as competitor_router
from auth import router as meta_auth_router
from followers import router as followers_router

# Ini untuk mengimpor FastAPI sebagai framework backend.
from fastapi import FastAPI, Query

# Ini untuk mengizinkan komunikasi antara Next.js dan FastAPI.
from fastapi.middleware.cors import CORSMiddleware

# Ini untuk menentukan tipe data pilihan konten.
from typing import Literal


# Ini untuk membuat aplikasi backend.
app = FastAPI(
    title="IG Growth Intelligence API",
    description="Backend untuk Instagram Growth Intelligence Dashboard",
    version="1.0.0",
)


# Ini untuk mengizinkan frontend Next.js mengakses backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ini untuk mengaktifkan endpoint analisis akun kompetitor.
app.include_router(competitor_router)
app.include_router(meta_auth_router)
app.include_router(followers_router)

# Ini untuk menyediakan data konten contoh.
# Nantinya data ini akan diganti dengan data dari database dan Instagram API.
CONTENT_DATA = [
    {
        "id": 1,
        "title": "Tips Membuat Konten Viral",
        "type": "Reels",
        "reach": 8200,
        "impressions": 12400,
        "likes": 1200,
        "comments": 180,
        "shares": 320,
        "saves": 450,
        "non_followers": 68,
        "profile_visits": 210,
        "follows": 42,
        "days_ago": 2,
    },
    {
        "id": 2,
        "title": "Strategi Instagram Marketing",
        "type": "Carousel",
        "reach": 6100,
        "impressions": 9100,
        "likes": 850,
        "comments": 120,
        "shares": 210,
        "saves": 380,
        "non_followers": 54,
        "profile_visits": 145,
        "follows": 28,
        "days_ago": 3,
    },
    {
        "id": 3,
        "title": "Di Balik Layar Produksi",
        "type": "Reels",
        "reach": 4300,
        "impressions": 5700,
        "likes": 510,
        "comments": 65,
        "shares": 90,
        "saves": 110,
        "non_followers": 42,
        "profile_visits": 85,
        "follows": 12,
        "days_ago": 4,
    },
    {
        "id": 4,
        "title": "Panduan Memilih Produk",
        "type": "Foto",
        "reach": 2800,
        "impressions": 3900,
        "likes": 320,
        "comments": 40,
        "shares": 35,
        "saves": 75,
        "non_followers": 30,
        "profile_visits": 55,
        "follows": 8,
        "days_ago": 5,
    },
    {
        "id": 5,
        "title": "Cara Meningkatkan Engagement",
        "type": "Carousel",
        "reach": 5200,
        "impressions": 7600,
        "likes": 690,
        "comments": 95,
        "shares": 155,
        "saves": 290,
        "non_followers": 59,
        "profile_visits": 130,
        "follows": 24,
        "days_ago": 7,
    },
    {
        "id": 6,
        "title": "Kesalahan dalam Membuat Konten",
        "type": "Reels",
        "reach": 3900,
        "impressions": 5400,
        "likes": 430,
        "comments": 55,
        "shares": 70,
        "saves": 95,
        "non_followers": 48,
        "profile_visits": 72,
        "follows": 10,
        "days_ago": 10,
    },
    {
        "id": 7,
        "title": "Panduan Membuat Caption",
        "type": "Foto",
        "reach": 2100,
        "impressions": 2900,
        "likes": 240,
        "comments": 32,
        "shares": 20,
        "saves": 65,
        "non_followers": 27,
        "profile_visits": 42,
        "follows": 5,
        "days_ago": 14,
    },
    {
        "id": 8,
        "title": "Strategi Membangun Brand",
        "type": "Carousel",
        "reach": 7400,
        "impressions": 10300,
        "likes": 980,
        "comments": 145,
        "shares": 250,
        "saves": 410,
        "non_followers": 62,
        "profile_visits": 180,
        "follows": 35,
        "days_ago": 19,
    },
    {
        "id": 9,
        "title": "Behind The Scene Tim Marketing",
        "type": "Reels",
        "reach": 4800,
        "impressions": 6400,
        "likes": 560,
        "comments": 75,
        "shares": 110,
        "saves": 130,
        "non_followers": 51,
        "profile_visits": 95,
        "follows": 17,
        "days_ago": 25,
    },
    {
        "id": 10,
        "title": "Inspirasi Desain Feed",
        "type": "Foto",
        "reach": 1900,
        "impressions": 2500,
        "likes": 210,
        "comments": 25,
        "shares": 18,
        "saves": 42,
        "non_followers": 24,
        "profile_visits": 30,
        "follows": 3,
        "days_ago": 33,
    },
    {
        "id": 11,
        "title": "Cara Membaca Insight Instagram",
        "type": "Carousel",
        "reach": 6800,
        "impressions": 9400,
        "likes": 790,
        "comments": 105,
        "shares": 185,
        "saves": 340,
        "non_followers": 57,
        "profile_visits": 155,
        "follows": 29,
        "days_ago": 46,
    },
    {
        "id": 12,
        "title": "Konten Promosi Produk",
        "type": "Foto",
        "reach": 1500,
        "impressions": 2100,
        "likes": 145,
        "comments": 18,
        "shares": 12,
        "saves": 28,
        "non_followers": 21,
        "profile_visits": 24,
        "follows": 2,
        "days_ago": 65,
    },
]


# Ini untuk menghitung total interaksi sebuah konten.
def calculate_engagement(content):
    return (
        content["likes"]
        + content["comments"]
        + content["shares"]
        + content["saves"]
    )


# Ini untuk menghitung engagement rate berdasarkan jangkauan.
def calculate_engagement_rate(content):
    if content["reach"] == 0:
        return 0

    return round(
        calculate_engagement(content) / content["reach"] * 100,
        2,
    )


# Ini untuk menghitung share rate berdasarkan jangkauan.
def calculate_share_rate(content):
    if content["reach"] == 0:
        return 0

    return round(
        content["shares"] / content["reach"] * 100,
        2,
    )


# Ini untuk menghitung save rate berdasarkan jangkauan.
def calculate_save_rate(content):
    if content["reach"] == 0:
        return 0

    return round(
        content["saves"] / content["reach"] * 100,
        2,
    )


# Ini untuk menambahkan hasil perhitungan ke setiap konten.
def enrich_content(content):
    return {
        **content,
        "engagement": calculate_engagement(content),
        "engagement_rate": calculate_engagement_rate(content),
        "share_rate": calculate_share_rate(content),
        "save_rate": calculate_save_rate(content),
    }


# Ini untuk menyaring data berdasarkan periode dan jenis konten.
def filter_content(period, content_type):
    result = [
        item
        for item in CONTENT_DATA
        if item["days_ago"] <= period
    ]

    if content_type != "all":
        result = [
            item
            for item in result
            if item["type"].lower() == content_type.lower()
        ]

    return [enrich_content(item) for item in result]


# Ini untuk memeriksa apakah server backend berjalan.
@app.get("/")
def home():
    return {
        "message": "IG Growth Intelligence API is running",
        "docs": "/docs",
    }


# Ini untuk memeriksa status server.
@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "message": "Backend is running",
    }


# Ini untuk mengambil daftar konten berdasarkan filter.
@app.get("/api/analytics/content")
def get_content(
    period: int = Query(default=30, ge=1, le=90),
    content_type: Literal["all", "reels", "carousel", "foto"] = "all",
    search: str = "",
):
    result = filter_content(period, content_type)

    # Ini untuk mencari konten berdasarkan judul.
    if search:
        result = [
            item
            for item in result
            if search.lower() in item["title"].lower()
        ]

    return {
        "total": len(result),
        "data": result,
    }


# Ini untuk mengambil ringkasan statistik dashboard.
@app.get("/api/analytics/overview")
def get_overview(
    period: int = Query(default=30, ge=1, le=90),
    content_type: Literal["all", "reels", "carousel", "foto"] = "all",
):
    data = filter_content(period, content_type)

    # Ini untuk menjumlahkan semua metrik.
    totals = {
        "reach": sum(item["reach"] for item in data),
        "impressions": sum(item["impressions"] for item in data),
        "engagement": sum(item["engagement"] for item in data),
        "likes": sum(item["likes"] for item in data),
        "comments": sum(item["comments"] for item in data),
        "shares": sum(item["shares"] for item in data),
        "saves": sum(item["saves"] for item in data),
        "profile_visits": sum(item["profile_visits"] for item in data),
        "follows": sum(item["follows"] for item in data),
    }

    # Ini untuk menghitung rata-rata engagement rate.
    average_engagement_rate = (
        round(
            sum(item["engagement_rate"] for item in data) / len(data),
            2,
        )
        if data
        else 0
    )

    # Ini untuk menghitung rata-rata persentase non-pengikut.
    average_non_followers = (
        round(
            sum(item["non_followers"] for item in data) / len(data),
            2,
        )
        if data
        else 0
    )

    return {
        "period": period,
        "content_type": content_type,
        "content_count": len(data),
        "totals": totals,
        "average": {
            "reach": round(totals["reach"] / len(data)) if data else 0,
            "engagement_rate": average_engagement_rate,
            "non_followers": average_non_followers,
        },
    }


# Ini untuk membandingkan performa Reels, Carousel, dan Foto.
@app.get("/api/analytics/compare")
def compare_content(
    period: int = Query(default=30, ge=1, le=90),
):
    data = filter_content(period, "all")

    result = []

    # Ini untuk mengelompokkan data berdasarkan jenis konten.
    for content_type in ["Reels", "Carousel", "Foto"]:
        group = [
            item
            for item in data
            if item["type"] == content_type
        ]

        result.append({
            "type": content_type,
            "post_count": len(group),
            "reach": sum(item["reach"] for item in group),
            "engagement": sum(item["engagement"] for item in group),
            "likes": sum(item["likes"] for item in group),
            "comments": sum(item["comments"] for item in group),
            "shares": sum(item["shares"] for item in group),
            "saves": sum(item["saves"] for item in group),
        })

    return {
        "period": period,
        "data": result,
    }


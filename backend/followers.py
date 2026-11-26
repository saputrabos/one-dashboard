# Ini untuk membaca data ekspor Instagram dan menghitung perubahan followers.
import io
import json
import os
import sqlite3
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import APIRouter, File, Form, HTTPException, Query, UploadFile

router = APIRouter(prefix="/api/followers", tags=["Follower Intelligence"])

# Ini untuk menentukan lokasi database snapshot yang persisten.
DB_PATH = Path(os.getenv("FOLLOWERS_DB_PATH", str(Path(__file__).parent / "followers.db")))


def get_connection():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    # Ini untuk membuat tabel penyimpanan snapshot jika belum tersedia.
    with get_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS follower_snapshots (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                account TEXT NOT NULL,
                created_at TEXT NOT NULL,
                followers_json TEXT NOT NULL,
                following_json TEXT NOT NULL
            )
            """
        )
        connection.execute(
            "CREATE INDEX IF NOT EXISTS idx_follower_snapshots_account "
            "ON follower_snapshots(account, id DESC)"
        )


initialize_database()


def normalize_account(account: str) -> str:
    # Ini untuk menyamakan format username agar pencarian konsisten.
    value = account.strip().lstrip("@").lower()
    if not value or len(value) > 100:
        raise HTTPException(status_code=400, detail="Username akun tidak valid.")
    return value


def collect_usernames(value: Any) -> set[str]:
    # Ini untuk mengambil username dari struktur JSON ekspor Instagram.
    usernames: set[str] = set()

    def walk(node: Any):
        if isinstance(node, list):
            for item in node:
                walk(item)
            return

        if not isinstance(node, dict):
            return

        string_items = node.get("string_list_data")
        if isinstance(string_items, list):
            for entry in string_items:
                if isinstance(entry, dict) and entry.get("value"):
                    usernames.add(str(entry["value"]).strip().lstrip("@").lower())

        # Format ekspor Instagram bisa menggunakan nama properti yang berbeda.
        for key in ("relationships_following", "relationships_followers", "followers", "following"):
            child = node.get(key)
            if isinstance(child, (list, dict)):
                walk(child)

    walk(value)
    return {name for name in usernames if name}


def read_json_file(raw: bytes, label: str) -> Any:
    # Ini untuk membaca JSON dengan penanganan error yang mudah dipahami.
    try:
        return json.loads(raw.decode("utf-8-sig"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        raise HTTPException(
            status_code=400,
            detail=f"File {label} bukan JSON Instagram yang valid.",
        )


async def parse_uploads(
    zip_file: UploadFile | None,
    followers_file: UploadFile | None,
    following_file: UploadFile | None,
) -> tuple[set[str], set[str]]:
    followers_payload = None
    following_payload = None

    if zip_file is not None:
        raw_zip = await zip_file.read()
        try:
            with zipfile.ZipFile(io.BytesIO(raw_zip)) as archive:
                names = archive.namelist()
                follower_path = next(
                    (name for name in names if Path(name).name.lower().startswith("followers_")
                     and name.lower().endswith(".json")),
                    None,
                )
                following_path = next(
                    (name for name in names if Path(name).name.lower() == "following.json"),
                    None,
                )
                if not follower_path or not following_path:
                    raise HTTPException(
                        status_code=400,
                        detail="ZIP tidak menemukan followers_1.json dan following.json. "
                               "Pastikan ekspor Instagram menggunakan format JSON.",
                    )
                followers_payload = read_json_file(archive.read(follower_path), "followers")
                following_payload = read_json_file(archive.read(following_path), "following")
        except zipfile.BadZipFile:
            raise HTTPException(status_code=400, detail="File yang diunggah bukan ZIP yang valid.")
    else:
        if followers_file is None or following_file is None:
            raise HTTPException(
                status_code=400,
                detail="Unggah satu file ZIP, atau unggah kedua file followers dan following JSON.",
            )
        followers_payload = read_json_file(await followers_file.read(), "followers")
        following_payload = read_json_file(await following_file.read(), "following")

    followers = collect_usernames(followers_payload)
    following = collect_usernames(following_payload)

    if not followers and not following:
        raise HTTPException(
            status_code=400,
            detail="Tidak ada username yang terbaca. Gunakan ekspor Instagram format JSON.",
        )

    return followers, following


def fetch_snapshots(account: str, limit: int = 2):
    # Ini untuk mengambil snapshot terbaru milik username yang dipilih.
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT id, account, created_at, followers_json, following_json
            FROM follower_snapshots
            WHERE account = ?
            ORDER BY id DESC
            LIMIT ?
            """,
            (account, limit),
        ).fetchall()
    return [dict(row) for row in rows]


def decode_snapshot(row: dict):
    return {
        **row,
        "followers": set(json.loads(row["followers_json"])),
        "following": set(json.loads(row["following_json"])),
    }


@router.post("/import")
async def import_snapshot(
    account: str = Form(...),
    zip_file: UploadFile | None = File(default=None),
    followers_file: UploadFile | None = File(default=None),
    following_file: UploadFile | None = File(default=None),
):
    # Ini untuk membaca file ekspor lalu menyimpan snapshot baru.
    account_name = normalize_account(account)
    followers, following = await parse_uploads(zip_file, followers_file, following_file)
    created_at = datetime.now(timezone.utc).isoformat()

    with get_connection() as connection:
        cursor = connection.execute(
            """
            INSERT INTO follower_snapshots
                (account, created_at, followers_json, following_json)
            VALUES (?, ?, ?, ?)
            """,
            (
                account_name,
                created_at,
                json.dumps(sorted(followers)),
                json.dumps(sorted(following)),
            ),
        )
        snapshot_id = cursor.lastrowid

    previous_rows = fetch_snapshots(account_name, 2)
    comparison_ready = len(previous_rows) > 1
    new_followers = 0
    unfollowers = 0
    if comparison_ready:
        current = decode_snapshot(previous_rows[0])
        previous = decode_snapshot(previous_rows[1])
        new_followers = len(current["followers"] - previous["followers"])
        unfollowers = len(previous["followers"] - current["followers"])

    return {
        "success": True,
        "snapshot_id": snapshot_id,
        "account": account_name,
        "created_at": created_at,
        "followers_count": len(followers),
        "following_count": len(following),
        "comparison_ready": comparison_ready,
        "new_followers": new_followers,
        "unfollowers": unfollowers,
        "message": (
            "Snapshot berhasil disimpan dan dibandingkan."
            if comparison_ready
            else "Snapshot awal berhasil disimpan. Unggah ekspor berikutnya untuk mendeteksi perubahan."
        ),
    }


@router.get("/summary")
def follower_summary(account: str = Query(...)):
    # Ini untuk memberikan ringkasan jumlah followers dan perubahan akun.
    account_name = normalize_account(account)
    rows = fetch_snapshots(account_name, 2)
    if not rows:
        return {
            "account": account_name,
            "has_data": False,
            "comparison_ready": False,
            "followers": 0,
            "following": 0,
            "not_following_back": 0,
            "new_followers": 0,
            "unfollowers": 0,
            "last_import": None,
        }

    current = decode_snapshot(rows[0])
    not_following_back = current["following"] - current["followers"]
    new_followers: set[str] = set()
    unfollowers: set[str] = set()
    comparison_ready = len(rows) > 1

    if comparison_ready:
        previous = decode_snapshot(rows[1])
        new_followers = current["followers"] - previous["followers"]
        unfollowers = previous["followers"] - current["followers"]

    return {
        "account": account_name,
        "has_data": True,
        "comparison_ready": comparison_ready,
        "followers": len(current["followers"]),
        "following": len(current["following"]),
        "not_following_back": len(not_following_back),
        "new_followers": len(new_followers),
        "unfollowers": len(unfollowers),
        "last_import": current["created_at"],
        "previous_import": rows[1]["created_at"] if comparison_ready else None,
    }


@router.get("/list")
def follower_list(
    account: str = Query(...),
    category: str = Query("followers"),
    search: str = Query(""),
):
    # Ini untuk menampilkan daftar akun berdasarkan kategori yang dipilih.
    account_name = normalize_account(account)
    rows = fetch_snapshots(account_name, 2)
    if not rows:
        raise HTTPException(status_code=404, detail="Belum ada snapshot. Unggah ekspor Instagram terlebih dahulu.")

    current = decode_snapshot(rows[0])
    previous = decode_snapshot(rows[1]) if len(rows) > 1 else None

    datasets = {
        "followers": current["followers"],
        "following": current["following"],
        "not_following_back": current["following"] - current["followers"],
        "new_followers": (
            current["followers"] - previous["followers"] if previous else set()
        ),
        "unfollowers": (
            previous["followers"] - current["followers"] if previous else set()
        ),
    }
    if category not in datasets:
        raise HTTPException(status_code=400, detail="Kategori daftar tidak dikenal.")

    query = search.strip().lower().lstrip("@")
    result = sorted(name for name in datasets[category] if query in name.lower())
    return {
        "account": account_name,
        "category": category,
        "count": len(result),
        "comparison_ready": previous is not None,
        "data": [{"username": name} for name in result],
    }


@router.get("/history")
def follower_history(account: str = Query(...)):
    # Ini untuk menampilkan histori jumlah followers dari setiap snapshot.
    account_name = normalize_account(account)
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT id, created_at, followers_json, following_json
            FROM follower_snapshots
            WHERE account = ?
            ORDER BY id DESC
            """,
            (account_name,),
        ).fetchall()

    return {
        "account": account_name,
        "data": [
            {
                "id": row["id"],
                "created_at": row["created_at"],
                "followers": len(json.loads(row["followers_json"])),
                "following": len(json.loads(row["following_json"])),
            }
            for row in rows
        ],
    }

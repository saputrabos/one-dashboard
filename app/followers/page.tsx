"use client";

// Ini untuk mengelola data, pencarian, dan proses unggah ekspor Instagram.
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  UserRoundPlus,
  UserMinus,
  UserCheck,
  RefreshCw,
  Search,
  Upload,
  History,
  FileArchive,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import styles from "./followers.module.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

type Category =
  | "followers"
  | "following"
  | "not_following_back"
  | "unfollowers"
  | "new_followers";

type Summary = {
  account: string;
  has_data: boolean;
  comparison_ready: boolean;
  followers: number;
  following: number;
  not_following_back: number;
  new_followers: number;
  unfollowers: number;
  last_import: string | null;
};

type FollowerItem = { username: string };
type HistoryItem = {
  id: number;
  created_at: string;
  followers: number;
  following: number;
};

const tabs: { id: Category; label: string; icon: typeof Users }[] = [
  { id: "followers", label: "Followers", icon: Users },
  { id: "following", label: "Following", icon: UserCheck },
  { id: "not_following_back", label: "Tidak Follow Back", icon: UserMinus },
  { id: "unfollowers", label: "Unfollowers", icon: UserMinus },
  { id: "new_followers", label: "New Followers", icon: UserRoundPlus },
];

const emptySummary: Summary = {
  account: "",
  has_data: false,
  comparison_ready: false,
  followers: 0,
  following: 0,
  not_following_back: 0,
  new_followers: 0,
  unfollowers: 0,
  last_import: null,
};

// Ini untuk memformat angka dan tanggal agar mudah dibaca.
function numberFormat(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

function dateFormat(value: string | null) {
  if (!value) return "Belum ada data";
  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function FollowerIntelligencePage() {
  const [account, setAccount] = useState("");
  const [summary, setSummary] = useState<Summary>(emptySummary);
  const [activeTab, setActiveTab] = useState<Category>("followers");
  const [items, setItems] = useState<FollowerItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [followersFile, setFollowersFile] = useState<File | null>(null);
  const [followingFile, setFollowingFile] = useState<File | null>(null);

  // Ini untuk memuat username terakhir yang dipakai di browser.
  useEffect(() => {
    const saved = localStorage.getItem("one-dashboard-follower-account");
    if (saved) setAccount(saved);
  }, []);

  // Ini untuk mengambil daftar akun pada tab aktif.
  const loadList = useCallback(async (username: string, category: Category, queryText: string) => {
    const query = new URLSearchParams({
      account: username,
      category,
      search: queryText,
    });
    const response = await fetch(`${API_BASE}/api/followers/list?${query}`);
    if (!response.ok) {
      if (response.status === 404) {
        setItems([]);
        return;
      }
      throw new Error("Gagal mengambil daftar akun.");
    }
    const data = await response.json();
    setItems(data.data ?? []);
  };


  const loadDashboard = useCallback(async (username: string) => {
    const clean = username.trim().replace(/^@/, "");
    if (!clean) return;
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams({ account: clean });
      const [summaryResponse, historyResponse] = await Promise.all([
        fetch(`${API_BASE}/api/followers/summary?${query}`),
        fetch(`${API_BASE}/api/followers/history?${query}`),
      ]);
      if (!summaryResponse.ok || !historyResponse.ok) {
        throw new Error("Backend tidak dapat mengambil data followers.");
      }
      const summaryData = (await summaryResponse.json()) as Summary;
      const historyData = await historyResponse.json();
      setSummary(summaryData);
      setHistory(historyData.data ?? []);
      localStorage.setItem("one-dashboard-follower-account", clean);
      await loadList(clean, activeTab, search);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  }, [activeTab, search, loadList]);

  // Ini untuk memuat ulang ringkasan dan daftar saat akun, tab, atau pencarian berubah.
  useEffect(() => {
    if (account.trim()) void loadDashboard(account);
  }, [account, loadDashboard]);

  // Ini untuk menangani pemilihan file ZIP.
  const handleZipChange = (event: ChangeEvent<HTMLInputElement>) => {
    setZipFile(event.target.files?.[0] ?? null);
    setFollowersFile(null);
    setFollowingFile(null);
  };

  // Ini untuk menangani pemilihan dua file JSON Instagram.
  const handleFollowersChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFollowersFile(event.target.files?.[0] ?? null);
    setZipFile(null);
  };
  const handleFollowingChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFollowingFile(event.target.files?.[0] ?? null);
    setZipFile(null);
  };

  // Ini untuk mengirim file ke backend dan menyimpan snapshot baru.
  const handleImport = async () => {
    const clean = account.trim().replace(/^@/, "");
    if (!clean) {
      setError("Masukkan username Instagram terlebih dahulu.");
      return;
    }
    if (!zipFile && (!followersFile || !followingFile)) {
      setError("Pilih satu file ZIP atau lengkapi kedua file JSON.");
      return;
    }

    setUploading(true);
    setError("");
    setNotice("");
    try {
      const formData = new FormData();
      formData.append("account", clean);
      if (zipFile) {
        formData.append("zip_file", zipFile);
      } else {
        formData.append("followers_file", followersFile as File);
        formData.append("following_file", followingFile as File);
      }

      const response = await fetch(`${API_BASE}/api/followers/import`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Gagal mengimpor file Instagram.");
      }
      setNotice(data.message);
      setZipFile(null);
      setFollowersFile(null);
      setFollowingFile(null);
      await loadDashboard(clean);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Gagal mengimpor data.");
    } finally {
      setUploading(false);
    }
  };

  // Ini untuk menghitung tab yang sedang dipilih.
  const activeLabel = useMemo(
    () => tabs.find((tab) => tab.id === activeTab)?.label ?? "Followers",
    [activeTab],
  );

  const counts: Record<Category, number> = {
    followers: summary.followers,
    following: summary.following,
    not_following_back: summary.not_following_back,
    unfollowers: summary.unfollowers,
    new_followers: summary.new_followers,
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={16} /> Kembali ke Dashboard
          </Link>
          <div className={styles.eyebrow}>ACCOUNT INTELLIGENCE</div>
          <h1>Follower Intelligence</h1>
          <p>Kenali followers, following, akun yang tidak follow back, dan perubahan pengikut.</p>
        </div>
        <button className={styles.refreshButton} onClick={() => void loadDashboard(account)} disabled={!account || loading}>
          <RefreshCw size={16} /> Perbarui
        </button>
      </header>

      <section className={styles.importPanel}>
        <div className={styles.importTitle}>
          <div className={styles.importIcon}><FileArchive size={22} /></div>
          <div>
            <h2>Impor data Instagram</h2>
            <p>Gunakan file ekspor Instagram format JSON. Password Instagram tidak diperlukan.</p>
          </div>
        </div>

        <label className={styles.fieldLabel} htmlFor="instagram-account">Username Instagram</label>
        <div className={styles.accountInput}>
          <span>@</span>
          <input
            id="instagram-account"
            value={account}
            onChange={(event) => setAccount(event.target.value)}
            placeholder="username"
            autoComplete="off"
          />
        </div>

        <div className={styles.fileGrid}>
          <label className={styles.fileChoice}>
            <FileArchive size={20} />
            <strong>Upload ZIP (disarankan)</strong>
            <span>{zipFile?.name ?? "Pilih file ZIP ekspor Instagram"}</span>
            <input type="file" accept=".zip,application/zip" onChange={handleZipChange} />
          </label>
          <div className={styles.orText}>ATAU UPLOAD JSON TERPISAH</div>
          <label className={styles.fileChoice}>
            <Upload size={20} />
            <strong>File followers_1.json</strong>
            <span>{followersFile?.name ?? "Pilih file followers"}</span>
            <input type="file" accept=".json,application/json" onChange={handleFollowersChange} />
          </label>
          <label className={styles.fileChoice}>
            <Upload size={20} />
            <strong>File following.json</strong>
            <span>{followingFile?.name ?? "Pilih file following"}</span>
            <input type="file" accept=".json,application/json" onChange={handleFollowingChange} />
          </label>
        </div>
        <button className={styles.importButton} onClick={() => void handleImport()} disabled={uploading}>
          {uploading ? <LoaderCircle className={styles.spin} size={18} /> : <Upload size={18} />}
          {uploading ? "Memproses data..." : "Impor dan Simpan Snapshot"}
        </button>
        <p className={styles.privacyNote}>Data disimpan di database backend lokal One Dashboard. Jangan unggah file ekspor ke perangkat yang tidak kamu percaya.</p>
        {error && <div className={styles.alertError}><AlertCircle size={17} /> {error}</div>}
        {notice && <div className={styles.alertSuccess}><CheckCircle2 size={17} /> {notice}</div>}
      </section>

      {!summary.comparison_ready && summary.has_data && (
        <div className={styles.infoNotice}>
          Snapshot pertama sudah tersimpan. Unggah ekspor berikutnya untuk mulai mendeteksi New Followers dan Unfollowers.
        </div>
      )}

      <section className={styles.statGrid}>
        <article className={styles.statCard}>
          <span><Users size={17} /> Followers</span>
          <strong>{numberFormat(summary.followers)}</strong>
        </article>
        <article className={styles.statCard}>
          <span><UserCheck size={17} /> Following</span>
          <strong>{numberFormat(summary.following)}</strong>
        </article>
        <article className={styles.statCard}>
          <span><UserMinus size={17} /> Tidak Follow Back</span>
          <strong>{numberFormat(summary.not_following_back)}</strong>
        </article>
        <article className={styles.statCard}>
          <span><UserRoundPlus size={17} /> New Followers</span>
          <strong>{numberFormat(summary.new_followers)}</strong>
        </article>
        <article className={styles.statCard}>
          <span><UserMinus size={17} /> Unfollowers</span>
          <strong>{numberFormat(summary.unfollowers)}</strong>
        </article>
      </section>

      <section className={styles.dataPanel}>
        <div className={styles.panelHeading}>
          <div>
            <h2>Daftar akun</h2>
            <p>{activeLabel} · {numberFormat(counts[activeTab])} akun</p>
          </div>
          <div className={styles.searchBox}>
            <Search size={17} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari username..." />
          </div>
        </div>
        <div className={styles.tabs}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} className={activeTab === tab.id ? styles.activeTab : ""} onClick={() => setActiveTab(tab.id)}>
                <Icon size={16} /> {tab.label}
              </button>
            );
          })}
        </div>
        <div className={styles.accountList}>
          {loading ? (
            <div className={styles.emptyState}>Memuat data...</div>
          ) : items.length ? (
            items.map((item) => (
              <div className={styles.accountRow} key={item.username}>
                <div className={styles.avatar}>{item.username.slice(0, 1).toUpperCase()}</div>
                <a href={`https://www.instagram.com/${encodeURIComponent(item.username)}/`} target="_blank" rel="noreferrer">@{item.username}</a>
                <span>Instagram</span>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              {summary.has_data ? "Tidak ada akun pada kategori ini." : "Belum ada data. Impor file ekspor Instagram terlebih dahulu."}
            </div>
          )}
        </div>
      </section>

      <section className={styles.historyPanel}>
        <div className={styles.panelHeading}>
          <div>
            <h2><History size={19} /> Riwayat Snapshot</h2>
            <p>Setiap impor menyimpan kondisi followers dan following saat itu.</p>
          </div>
        </div>
        {history.length ? (
          <div className={styles.historyList}>
            {history.map((entry, index) => (
              <div className={styles.historyRow} key={entry.id}>
                <div className={styles.historyMarker}>{history.length - index}</div>
                <div><strong>{dateFormat(entry.created_at)}</strong><span>{numberFormat(entry.followers)} followers · {numberFormat(entry.following)} following</span></div>
                <span className={styles.snapshotTag}>{index === 0 ? "Terbaru" : "Snapshot"}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>Riwayat akan muncul setelah impor pertama.</div>
        )}
      </section>
    </main>
  );
}

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
  Trash2,
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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);

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
  }, []);

  // Ini untuk memuat ringkasan dan daftar akun berdasarkan username aktif.
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

  // Satu pemilih file untuk ZIP atau dua file JSON sekaligus.
  const handleFilesChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(Array.from(event.target.files ?? []));
    setError("");
    setNotice("");
  };

  // Ini untuk mengirim file ke backend dan menyimpan snapshot baru.
  const handleImport = async () => {
    const clean = account.trim().replace(/^@/, "");
    if (!clean) {
      setError("Masukkan username Instagram terlebih dahulu.");
      return;
    }
    const zipFile = selectedFiles.find((file) => file.name.toLowerCase().endsWith(".zip"));
    const followersFile = selectedFiles.find((file) => /^followers(?:_\d+)?\.json$/i.test(file.name));
    const followingFile = selectedFiles.find((file) => file.name.toLowerCase() === "following.json");

    if (zipFile && selectedFiles.length !== 1) {
      setError("Jika menggunakan ZIP, pilih ZIP saja.");
      return;
    }
    if (!zipFile && (!followersFile || !followingFile || selectedFiles.length < 2)) {
      setError("Pilih satu ZIP, atau pilih followers_1.json dan following.json sekaligus.");
      return;
    }
    if (selectedFiles.some((file) => !file.name.toLowerCase().endsWith(".zip") && !file.name.toLowerCase().endsWith(".json"))) {
      setError("Format file harus ZIP atau JSON dari Instagram.");
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
      setSelectedFiles([]);
      await loadDashboard(clean);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Gagal mengimpor data.");
    } finally {
      setUploading(false);
    }
  };


  // Ini untuk menghapus satu snapshot berdasarkan ID.
  const handleDeleteSnapshot = async (snapshotId: number) => {
    const clean = account.trim().replace(/^@/, "");
    if (!clean || !window.confirm("Hapus snapshot ini? Perhitungan New Followers dan Unfollowers dapat berubah.")) return;
    setDeletingId(snapshotId);
    setError("");
    setNotice("");
    try {
      const query = new URLSearchParams({ account: clean });
      const response = await fetch(`${API_BASE}/api/followers/snapshot/${snapshotId}?${query}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Gagal menghapus snapshot.");
      setNotice(data.message || "Snapshot berhasil dihapus.");
      await loadDashboard(clean);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Gagal menghapus snapshot.");
    } finally {
      setDeletingId(null);
    }
  };

  // Ini untuk menghapus seluruh riwayat data akun yang sedang dipilih.
  const handleDeleteAll = async () => {
    const clean = account.trim().replace(/^@/, "");
    if (!clean || !window.confirm(`Hapus SEMUA data followers dan riwayat untuk @${clean}? Tindakan ini tidak bisa dibatalkan.`)) return;
    setDeletingAll(true);
    setError("");
    setNotice("");
    try {
      const query = new URLSearchParams({ account: clean });
      const response = await fetch(`${API_BASE}/api/followers/all?${query}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Gagal menghapus seluruh data.");
      setNotice(data.message || "Seluruh data akun berhasil dihapus.");
      await loadDashboard(clean);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Gagal menghapus seluruh data.");
    } finally {
      setDeletingAll(false);
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

        <label className={styles.fileChoice}>
          <FileArchive size={20} />
          <strong>Pilih file ekspor Instagram</strong>
          <span>{selectedFiles.length ? selectedFiles.map((file) => file.name).join(", ") : "Pilih ZIP atau dua file JSON sekaligus (followers_1.json + following.json)"}</span>
          <input
            type="file"
            accept=".zip,.json,application/zip,application/json"
            multiple
            onChange={handleFilesChange}
          />
        </label>
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
          <button className={styles.deleteAllButton} onClick={() => void handleDeleteAll()} disabled={!summary.has_data || deletingAll || deletingId !== null}>
            {deletingAll ? <LoaderCircle className={styles.spin} size={15} /> : <Trash2 size={15} />}
            {deletingAll ? "Menghapus..." : "Hapus Semua Data"}
          </button>
        </div>
        {history.length ? (
          <div className={styles.historyList}>
            {history.map((entry, index) => (
              <div className={styles.historyRow} key={entry.id}>
                <div className={styles.historyMarker}>{history.length - index}</div>
                <div><strong>{dateFormat(entry.created_at)}</strong><span>{numberFormat(entry.followers)} followers · {numberFormat(entry.following)} following</span></div>
                <span className={styles.snapshotTag}>{index === 0 ? "Terbaru" : "Snapshot"}</span>
                <button className={styles.deleteSnapshotButton} onClick={() => void handleDeleteSnapshot(entry.id)} disabled={deletingAll || deletingId !== null} aria-label="Hapus snapshot">
                  {deletingId === entry.id ? <LoaderCircle className={styles.spin} size={15} /> : <Trash2 size={15} />}
                </button>
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

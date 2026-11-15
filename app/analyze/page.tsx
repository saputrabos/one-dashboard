
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Image,
  Heart,
  MessageCircle,
  ExternalLink,
  Search,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";
import styles from "./analyze.module.css";

type Media = {
  id: string;
  caption: string;
  media_type: string;
  permalink: string;
  timestamp: string;
  likes: number;
  comments: number;
  engagement: number;
};

type Profile = {
  username: string;
  name?: string;
  biography?: string;
  website?: string;
  profile_picture_url?: string;
  followers_count: number;
  follows_count: number;
  media_count: number;
};

type AnalysisResult = {
  source: string;
  profile: Profile;
  media: Media[];
  media_analyzed: number;
};

export default function AnalyzePage() {
  const [username, setUsername] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Ini untuk membaca username dari URL saat halaman dibuka.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialUsername = params.get("username");

    if (initialUsername) {
      setUsername(initialUsername);
      fetchAnalysis(initialUsername);
    }
  }, []);

  // Ini untuk mengambil data akun melalui backend FastAPI.
  async function fetchAnalysis(value: string) {
    const cleanUsername = value.trim().replace(/^@/, "");

    if (!cleanUsername) {
      setError("Masukkan username Instagram terlebih dahulu.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

      const response = await fetch(
        `${apiUrl}/api/competitors/${encodeURIComponent(cleanUsername)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Gagal mengambil data akun.");
      }

      setResult(data);
      window.history.replaceState(
        null,
        "",
        `/analyze?username=${encodeURIComponent(cleanUsername)}`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengambil data."
      );
    } finally {
      setLoading(false);
    }
  }

  // Ini untuk memformat angka agar lebih mudah dibaca.
  function formatNumber(value?: number) {
    return new Intl.NumberFormat("id-ID").format(value || 0);
  }

  // Ini untuk menghitung rata-rata interaksi konten yang berhasil diambil.
  const averageEngagement = result?.media.length
    ? Math.round(
        result.media.reduce((total, item) => total + item.engagement, 0) /
          result.media.length
      )
    : 0;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <Link href="/login" className={styles.back}>
            <ArrowLeft size={17} />
            Kembali
          </Link>

          <div className={styles.brand}>ONE DASHBOARD</div>
          <span className={styles.headerLabel}>COMPETITOR INTELLIGENCE</span>
        </header>

        <section className={styles.hero}>
          <span className={styles.eyebrow}>INSTAGRAM PUBLIC ANALYSIS</span>
          <h1>Analisis Akun Lain</h1>
          <p>
            Pelajari profil, aktivitas konten, dan interaksi publik akun
            Instagram profesional.
          </p>

          <form
            className={styles.searchForm}
            onSubmit={(event) => {
              event.preventDefault();
              fetchAnalysis(username);
            }}
          >
            <span>@</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Masukkan username Instagram"
              aria-label="Username Instagram"
            />
            <button type="submit" disabled={loading}>
              {loading ? (
                <LoaderCircle className={styles.spin} size={18} />
              ) : (
                <Search size={18} />
              )}
              {loading ? "Menganalisis..." : "Analisis"}
            </button>
          </form>

          <div className={styles.helper}>
            <AlertCircle size={14} />
            Tidak membutuhkan password akun target. Hanya data publik yang
            tersedia melalui Meta API.
          </div>
        </section>

        {loading && (
          <div className={styles.loading}>
            <LoaderCircle className={styles.spin} size={28} />
            <p>Sedang mengambil data akun Instagram...</p>
          </div>
        )}

        {error && !loading && (
          <div className={styles.error}>
            <AlertCircle size={20} />
            <div>
              <strong>Analisis belum berhasil</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {result && !loading && (
          <section className={styles.results}>
            <div className={styles.resultHeading}>
              <div>
                <span className={styles.eyebrow}>HASIL ANALISIS</span>
                <h2>Profil Instagram</h2>
              </div>
              <span className={styles.source}>Data dari Meta API</span>
            </div>

            <div className={styles.profileCard}>
              <div className={styles.profileMain}>
                {result.profile.profile_picture_url ? (
                  <img
                    src={result.profile.profile_picture_url}
                    alt={`Foto profil ${result.profile.username}`}
                    className={styles.avatar}
                  />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    <Users size={28} />
                  </div>
                )}

                <div className={styles.profileInfo}>
                  <h3>{result.profile.name || result.profile.username}</h3>
                  <a
                    href={`https://www.instagram.com/${result.profile.username}/`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    @{result.profile.username}
                    <ExternalLink size={13} />
                  </a>
                  <p>{result.profile.biography || "Tidak ada bio."}</p>
                  {result.profile.website && (
                    <a
                      href={result.profile.website}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {result.profile.website}
                    </a>
                  )}
                </div>
              </div>

              <div className={styles.stats}>
                <div className={styles.stat}>
                  <Users size={19} />
                  <strong>{formatNumber(result.profile.followers_count)}</strong>
                  <span>Followers</span>
                </div>
                <div className={styles.stat}>
                  <Users size={19} />
                  <strong>{formatNumber(result.profile.follows_count)}</strong>
                  <span>Following</span>
                </div>
                <div className={styles.stat}>
                  <Image size={19} />
                  <strong>{formatNumber(result.profile.media_count)}</strong>
                  <span>Total Konten</span>
                </div>
                <div className={styles.stat}>
                  <Heart size={19} />
                  <strong>{formatNumber(averageEngagement)}</strong>
                  <span>Rata-rata Interaksi</span>
                </div>
              </div>
            </div>

            <div className={styles.resultHeading}>
              <div>
                <h2>Konten Terbaru</h2>
                <p>
                  {result.media_analyzed} konten berhasil dianalisis.
                </p>
              </div>
            </div>

            {result.media.length === 0 ? (
              <div className={styles.empty}>
                Belum ada data konten yang dapat ditampilkan.
              </div>
            ) : (
              <div className={styles.mediaGrid}>
                {result.media.map((item) => (
                  <article className={styles.mediaCard} key={item.id}>
                    <div className={styles.mediaType}>
                      {item.media_type || "CONTENT"}
                    </div>

                    <p className={styles.caption}>
                      {item.caption || "Tidak ada caption."}
                    </p>

                    <div className={styles.mediaStats}>
                      <span>
                        <Heart size={15} />
                        {formatNumber(item.likes)}
                      </span>
                      <span>
                        <MessageCircle size={15} />
                        {formatNumber(item.comments)}
                      </span>
                      <strong>
                        {formatNumber(item.engagement)} interaksi
                      </strong>
                    </div>

                    <div className={styles.mediaFooter}>
                      <span>
                        {item.timestamp
                          ? new Date(item.timestamp).toLocaleDateString("id-ID")
                          : "-"}
                      </span>
                      {item.permalink && (
                        <a
                          href={item.permalink}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Lihat konten <ExternalLink size={13} />
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}

            <p className={styles.disclaimer}>
              Data interaksi merupakan jumlah likes dan komentar yang
              tersedia secara publik. Ini bukan data reach, impressions,
              watch time, atau Instagram Insights pribadi pemilik akun.
            </p>
          </section>
        )}

        <footer className={styles.footer}>
          ONE DASHBOARD © 2026 · INSTAGRAM GROWTH INTELLIGENCE
        </footer>
      </div>
    </main>
  );
}

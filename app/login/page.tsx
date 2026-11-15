
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Camera,
  Search,
  FileSpreadsheet,
  ArrowRight,
  LockKeyhole,
  BarChart3,
} from "lucide-react";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [metaMessage, setMetaMessage] = useState("");
  const [metaAccount, setMetaAccount] = useState("");

  // Ini untuk membaca status koneksi Meta setelah pengguna kembali dari halaman OAuth.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const metaStatus = params.get("meta");

    const messages: Record<string, string> = {
      connected: "Akun Instagram berhasil dihubungkan dengan Meta.",
      not_configured: "Meta App belum dikonfigurasi di backend.",
      denied: "Login Meta dibatalkan.",
      invalid_state: "Sesi keamanan OAuth tidak valid. Silakan coba lagi.",
      no_instagram: "Tidak ditemukan Instagram profesional yang terhubung ke Facebook Page.",
      failed: "Login Meta gagal. Periksa konfigurasi App dan izin API.",
    };

    if (metaStatus && messages[metaStatus]) {
      setMetaMessage(messages[metaStatus]);
      window.history.replaceState({}, "", "/login");
    }

    // Ini untuk mengambil informasi akun yang sudah terhubung tanpa meminta token ke frontend.
    fetch("http://127.0.0.1:8000/api/auth/meta/status", {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.connected && data.account?.username) {
          setMetaAccount("@" + data.account.username);
        }
      })
      .catch(() => {
        setMetaMessage("Backend belum dapat dihubungi.");
      });
  }, []);

  // Ini untuk memulai proses OAuth Login dengan Meta melalui backend.
  const handleMetaLogin = () => {
    window.location.href = "http://127.0.0.1:8000/api/auth/meta/login";
  };

// Ini untuk mengarahkan username ke halaman analisis kompetitor.
const handleUsernameLogin = () => {
  const cleanUsername = username.trim().replace(/^@/, "");

  if (!cleanUsername) {
    alert("Masukkan username Instagram terlebih dahulu.");
    return;
  }

  router.push(
    `/analyze?username=${encodeURIComponent(cleanUsername)}`
  );
};

  return (
    <main className={styles.page}>
      <div className={styles.backgroundShape} />

      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <BarChart3 size={25} />
            </div>
            <span>ONE<span className={styles.logoAccent}>DASHBOARD</span></span>
          </div>
          <div className={styles.headerLabel}>
            <span className={styles.statusDot} />
            INSTAGRAM GROWTH INTELLIGENCE
          </div>
        </header>

        <section className={styles.hero}>
          <div className={styles.heroBadge}>
            <Camera size={14} />
            INSTAGRAM ANALYTICS PLATFORM
          </div>

          <h1>
            Understand Your
            <span> Instagram Growth.</span>
          </h1>

          <p>
            Analisis performa akun, pelajari kompetitor, dan temukan
            peluang pertumbuhan melalui satu dashboard.
          </p>
        </section>

        <section className={styles.content}>
          <div className={styles.sectionHeading}>
            <h2>Pilih sumber data</h2>
            <p>Bagaimana kamu ingin menggunakan One Dashboard?</p>
          </div>

          <div className={styles.options}>
            {/* Opsi 1: Login akun Instagram sendiri melalui Meta */}
            <div className={styles.optionCard}>
              <div className={styles.cardTop}>
                <div className={`${styles.optionIcon} ${styles.instagramIcon}`}>
                  <Camera size={24} />
                </div>
                <span className={styles.optionNumber}>01</span>
              </div>

              <h3>Login dengan Meta</h3>
              <p>
                Hubungkan akun Instagram milikmu melalui Meta untuk
                melihat Insights dan performa akun sendiri.
              </p>

              <div className={styles.featureList}>
                <span><span className={styles.check}>✓</span> Data akun sendiri</span>
                <span><span className={styles.check}>✓</span> Instagram Insights</span>
                <span><span className={styles.check}>✓</span> Analisis performa konten</span>
              </div>

              {metaMessage && <p role="status">{metaMessage}</p>}
              {metaAccount && <p role="status">Terhubung sebagai {metaAccount}</p>}

              <button
                className={`${styles.actionButton} ${styles.metaButton}`}
                onClick={handleMetaLogin}
              >
                <LockKeyhole size={17} />
                {metaAccount ? "Hubungkan Ulang Meta" : "Login dengan Meta"}
                <ArrowRight size={17} />
              </button>
            </div>

            {/* Opsi 2: Masukkan username akun Instagram publik */}
            <div className={styles.optionCard}>
              <div className={styles.cardTop}>
                <div className={`${styles.optionIcon} ${styles.searchIcon}`}>
                  <Search size={24} />
                </div>
                <span className={styles.optionNumber}>02</span>
              </div>

              <h3>Analisis Akun Lain</h3>
              <p>
                Masukkan username Instagram untuk mempelajari akun
                publik dan membandingkan kontennya.
              </p>

              <div className={styles.usernameInput}>
                <span>@</span>
                <input
                  type="text"
                  placeholder="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleUsernameLogin();
                  }}
                  aria-label="Username Instagram"
                />
              </div>

              <div className={styles.inputNote}>
                Tidak perlu memasukkan password Instagram.
              </div>

              <button
                className={`${styles.actionButton} ${styles.searchButton}`}
                onClick={handleUsernameLogin}
              >
                Analisis Username
                <ArrowRight size={17} />
              </button>
            </div>

            {/* Opsi 3: Menggunakan halaman upload yang sudah dibuat */}
            <div className={styles.optionCard}>
              <div className={styles.cardTop}>
                <div className={`${styles.optionIcon} ${styles.excelIcon}`}>
                  <FileSpreadsheet size={24} />
                </div>
                <span className={styles.optionNumber}>03</span>
              </div>

              <h3>Upload CSV / Excel</h3>
              <p>
                Unggah data Insights Instagram yang sudah kamu ekspor
                untuk melihat laporan performa konten.
              </p>

              <div className={styles.featureList}>
                <span><span className={styles.check}>✓</span> File CSV</span>
                <span><span className={styles.check}>✓</span> File Excel XLS / XLSX</span>
                <span><span className={styles.check}>✓</span> Analisis melalui dashboard</span>
              </div>

              <Link
                href="/upload"
                className={`${styles.actionButton} ${styles.uploadButton}`}
              >
                Upload Data
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>

        <footer className={styles.footer}>
          <span>ONE DASHBOARD © 2026</span>
          <span>Instagram Growth Intelligence Platform</span>
        </footer>
      </div>
    </main>
  );
}

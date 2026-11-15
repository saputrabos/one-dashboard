
"use client";

import { useState } from "react";
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

  // Ini untuk memberi informasi bahwa koneksi Meta belum diaktifkan.
  const handleMetaLogin = () => {
    alert(
      "Login Meta belum diaktifkan. Kita perlu menyelesaikan integrasi Meta OAuth terlebih dahulu."
    );
  };

  // Ini untuk memvalidasi username sebelum fitur analisis publik dihubungkan.
  const handleUsernameLogin = () => {
    const cleanUsername = username.trim().replace(/^@/, "");

    if (!cleanUsername) {
      alert("Masukkan username Instagram terlebih dahulu.");
      return;
    }

    alert(
      `Username @${cleanUsername} sudah dimasukkan. Fitur pengambilan dan analisis data publik perlu dihubungkan ke backend terlebih dahulu.`
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

              <button
                className={`${styles.actionButton} ${styles.metaButton}`}
                onClick={handleMetaLogin}
              >
                <LockKeyhole size={17} />
                Login dengan Meta
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

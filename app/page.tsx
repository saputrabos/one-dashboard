
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from "recharts";

import {
  Activity, Eye, Heart, MessageCircle, Share2, Bookmark,
  Users, UserPlus, Trophy, TrendingDown, TrendingUp,
  BarChart3, Search, CalendarDays, Image, Video,
  LayoutDashboard, Menu, X, ChevronDown
} from "lucide-react";


type Language = "id" | "en";

const translations = {
  id: {
    brand: "Dasbor Pertumbuhan",
    menuLabel: "MENU ANALISIS",
    menus: [
      "Ringkasan",
      "Konten Terbaik",
      "Konten Terburuk",
      "Peringkat Konten",
      "Analisis Interaksi",
      "Analisis Jangkauan",
      "Analisis Non-Pengikut",
      "Analisis Rasio Bagikan",
      "Analisis Rasio Simpan",
      "Analisis Komentar",
      "Analisis Kunjungan Profil",
      "Konversi Pengikut",
      "Perbandingan Pertumbuhan Konten",
    ],
    description: "Pantau dan analisis performa konten Instagram Anda.",
    demo: "Data Contoh",
    period: "Periode Analisis",
    periods: ["7 Hari Terakhir", "30 Hari Terakhir", "90 Hari Terakhir"],
    types: ["Semua Konten", "Reels", "Carousel", "Foto"],
    summary: "Ringkasan Performa",
    summaryDesc: "Statistik keseluruhan konten yang dianalisis",
    metrics: [
      "Total Jangkauan", "Total Tayangan", "Total Interaksi",
      "Total Suka", "Total Komentar", "Total Dibagikan",
      "Total Disimpan", "Kunjungan Profil"
    ],
    accumulation: "Akumulasi data konten",
    trend: "Tren Performa Konten",
    trendDesc: "Perkembangan jangkauan dan interaksi",
    reach: "Jangkauan",
    interactions: "Interaksi",
    interactionDetail: "Rincian Interaksi",
    interactionDesc: "Jenis interaksi dari seluruh konten",
    totalInteractions: "Total Interaksi",
    likes: "Suka",
    comments: "Komentar",
    shares: "Dibagikan",
    saves: "Disimpan",
    ranking: "Peringkat Performa Konten",
    rankingDesc: "Urutan konten berdasarkan jumlah interaksi",
    search: "Cari konten...",
    rank: "PERINGKAT",
    content: "KONTEN",
    type: "JENIS",
    reachCol: "JANGKAUAN",
    interactionCol: "INTERAKSI",
    rate: "RASIO INTERAKSI",
    sharesCol: "DIBAGIKAN",
    savesCol: "DISIMPAN",
    noContent: "Konten tidak ditemukan.",
    best: "Konten Terbaik",
    bestDesc: "Konten dengan interaksi tertinggi",
    worst: "Konten Terburuk",
    worstDesc: "Konten dengan interaksi terendah",
    interactionCount: "interaksi",
    account: "Akun Instagram",
    footer: "Dasbor Analisis Instagram",
    footerDesc: "Analisis konten lebih cerdas dan terukur.",
  },
  en: {
    brand: "Growth Dashboard",
    menuLabel: "ANALYTICS MENU",
    menus: [
      "Overview",
      "Best Performing Content",
      "Worst Performing Content",
      "Content Ranking",
      "Engagement Analyzer",
      "Reach Analyzer",
      "Non-Follower Analyzer",
      "Share Rate Analyzer",
      "Save Rate Analyzer",
      "Comment Analyzer",
      "Profile Visit Analyzer",
      "Follow Conversion",
      "Content Growth Comparison",
    ],
    description: "Monitor and analyze your Instagram content performance.",
    demo: "Demo Data",
    period: "Analytics Period",
    periods: ["Last 7 Days", "Last 30 Days", "Last 90 Days"],
    types: ["All Content", "Reels", "Carousel", "Photo"],
    summary: "Performance Overview",
    summaryDesc: "Overall statistics of analyzed content",
    metrics: [
      "Total Reach", "Total Impressions", "Total Engagement",
      "Total Likes", "Total Comments", "Total Shares",
      "Total Saves", "Profile Visits"
    ],
    accumulation: "Accumulated content data",
    trend: "Content Performance Trend",
    trendDesc: "Reach and engagement development",
    reach: "Reach",
    interactions: "Engagement",
    interactionDetail: "Engagement Breakdown",
    interactionDesc: "Interaction types across all content",
    totalInteractions: "Total Engagement",
    likes: "Likes",
    comments: "Comments",
    shares: "Shares",
    saves: "Saves",
    ranking: "Content Performance Ranking",
    rankingDesc: "Content ranked by total interactions",
    search: "Search content...",
    rank: "RANK",
    content: "CONTENT",
    type: "TYPE",
    reachCol: "REACH",
    interactionCol: "ENGAGEMENT",
    rate: "ENGAGEMENT RATE",
    sharesCol: "SHARES",
    savesCol: "SAVES",
    noContent: "No content found.",
    best: "Best Performing Content",
    bestDesc: "Content with the highest engagement",
    worst: "Worst Performing Content",
    worstDesc: "Content with the lowest engagement",
    interactionCount: "interactions",
    account: "Instagram Account",
    footer: "Instagram Analytics Dashboard",
    footerDesc: "Smarter and measurable content analytics.",
  },
};


const menu = [
  { key: "overview", icon: LayoutDashboard },
  { key: "best-content", icon: Trophy },
  { key: "worst-content", icon: TrendingDown },
  { key: "content-ranking", icon: BarChart3 },
  { key: "engagement-analysis", icon: Heart },
  { key: "reach-analysis", icon: Eye },
  { key: "non-followers", icon: Users },
  { key: "share-rate", icon: Share2 },
  { key: "save-rate", icon: Bookmark },
  { key: "comment-analysis", icon: MessageCircle },
  { key: "profile-visits", icon: Search },
  { key: "follow-conversion", icon: UserPlus },
  { key: "content-growth", icon: TrendingUp },
];

const languageOptions: Language[] = ["id", "en"];

const dataGrafik = [
  { hari: "Sen", jangkauan: 1200, interaksi: 180 },
  { hari: "Sel", jangkauan: 1800, interaksi: 250 },
  { hari: "Rab", jangkauan: 1500, interaksi: 220 },
  { hari: "Kam", jangkauan: 2400, interaksi: 350 },
  { hari: "Jum", jangkauan: 2100, interaksi: 310 },
  { hari: "Sab", jangkauan: 3200, interaksi: 460 },
  { hari: "Min", jangkauan: 3800, interaksi: 520 },
];

const konten = [
  {
    id: 1,
    judul: "Tips Membuat Konten Viral",
    jenis: "Reels",
    tanggal: "10 Nov 2026",
    jangkauan: 8200,
    tayangan: 12400,
    suka: 1200,
    komentar: 180,
    bagikan: 320,
    simpan: 450,
    nonPengikut: 68,
    kunjungan: 210,
    pengikut: 42,
    gambar: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=300",
  },
  {
    id: 2,
    judul: "Strategi Instagram Marketing",
    jenis: "Carousel",
    tanggal: "09 Nov 2026",
    jangkauan: 6100,
    tayangan: 9100,
    suka: 850,
    komentar: 120,
    bagikan: 210,
    simpan: 380,
    nonPengikut: 54,
    kunjungan: 145,
    pengikut: 28,
    gambar: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=300",
  },
  {
    id: 3,
    judul: "Di Balik Layar Produksi",
    jenis: "Reels",
    tanggal: "08 Nov 2026",
    jangkauan: 4300,
    tayangan: 5700,
    suka: 510,
    komentar: 65,
    bagikan: 90,
    simpan: 110,
    nonPengikut: 42,
    kunjungan: 85,
    pengikut: 12,
    gambar: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=300",
  },
  {
    id: 4,
    judul: "Panduan Memilih Produk",
    jenis: "Foto",
    tanggal: "07 Nov 2026",
    jangkauan: 2800,
    tayangan: 3900,
    suka: 320,
    komentar: 40,
    bagikan: 35,
    simpan: 75,
    nonPengikut: 30,
    kunjungan: 55,
    pengikut: 8,
    gambar: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300",
  },
];

const formatAngka = (angka: number, locale: Language = "id") =>
  angka.toLocaleString(locale === "en" ? "en-US" : "id-ID");

function hitungInteraksi(item: typeof konten[number]) {
  return item.suka + item.komentar + item.bagikan + item.simpan;
}

function hitungEngagement(item: typeof konten[number]) {
  return item.jangkauan
    ? (hitungInteraksi(item) / item.jangkauan) * 100
    : 0;
}

export default function Dashboard() {
  const [language, setLanguage] = useState<Language>("id");
  const [menuAktif, setMenuAktif] = useState("overview");
  const [periode, setPeriode] = useState(0);
  const [jenisKonten, setJenisKonten] = useState<"Semua" | "Reels" | "Carousel" | "Foto">("Semua");
  const [pencarian, setPencarian] = useState("");
  const [sidebarTerbuka, setSidebarTerbuka] = useState(false);

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem("ig-dashboard-language");
    if (savedLanguage === "id" || savedLanguage === "en") {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("ig-dashboard-language", language);
  }, [language]);

  const t = translations[language];
  const menuItems = menu.map((item, index) => ({
    ...item,
    label: t.menus[index],
  }));
  const activeMenu = menuItems.find((item) => item.key === menuAktif) ?? menuItems[0];
  const periodeOptions = t.periods;
  const jenisOptions = [
    { value: "Semua", label: t.types[0] },
    { value: "Reels", label: t.types[1] },
    { value: "Carousel", label: t.types[2] },
    { value: "Foto", label: t.types[3] },
  ] as const;

  const kontenTersaring = useMemo(() => {
    return konten
      .filter((item) =>
        jenisKonten === "Semua" || item.jenis === jenisKonten
      )
      .filter((item) =>
        item.judul.toLowerCase().includes(pencarian.toLowerCase())
      );
  }, [jenisKonten, pencarian]);

  const total = useMemo(() => ({
    jangkauan: konten.reduce((a, b) => a + b.jangkauan, 0),
    tayangan: konten.reduce((a, b) => a + b.tayangan, 0),
    interaksi: konten.reduce((a, b) => a + hitungInteraksi(b), 0),
    suka: konten.reduce((a, b) => a + b.suka, 0),
    komentar: konten.reduce((a, b) => a + b.komentar, 0),
    bagikan: konten.reduce((a, b) => a + b.bagikan, 0),
    simpan: konten.reduce((a, b) => a + b.simpan, 0),
    kunjungan: konten.reduce((a, b) => a + b.kunjungan, 0),
    pengikut: konten.reduce((a, b) => a + b.pengikut, 0),
  }), []);

  const kontenTerbaik = [...kontenTersaring].sort(
    (a, b) => hitungInteraksi(b) - hitungInteraksi(a)
  );

  const kontenTerburuk = [...kontenTersaring].sort(
    (a, b) => hitungInteraksi(a) - hitungInteraksi(b)
  );

  const metrik = [
    { nama: t.metrics[0], nilai: formatAngka(total.jangkauan, language), icon: Eye },
    { nama: t.metrics[1], nilai: formatAngka(total.tayangan, language), icon: Activity },
    { nama: t.metrics[2], nilai: formatAngka(total.interaksi, language), icon: Heart },
    { nama: t.metrics[3], nilai: formatAngka(total.suka, language), icon: Heart },
    { nama: t.metrics[4], nilai: formatAngka(total.komentar, language), icon: MessageCircle },
    { nama: t.metrics[5], nilai: formatAngka(total.bagikan, language), icon: Share2 },
    { nama: t.metrics[6], nilai: formatAngka(total.simpan, language), icon: Bookmark },
    { nama: t.metrics[7], nilai: formatAngka(total.kunjungan, language), icon: Users },
  ];

  return (
    <main className="ig-dashboard">

      {sidebarTerbuka && (
        <button
          className="ig-overlay"
          onClick={() => setSidebarTerbuka(false)}
          aria-label={language === "id" ? "Tutup menu" : "Close menu"}
        />
      )}

      <aside className={`ig-sidebar ${sidebarTerbuka ? "ig-sidebar-open" : ""}`}>
        <div className="ig-brand">
          <div className="ig-brand-icon"><Activity size={23} /></div>
          <div>
            <h2>IG Intelligence</h2>
            <span>{t.brand}</span>
          </div>
          <button className="ig-close-menu" onClick={() => setSidebarTerbuka(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="ig-menu-label">{t.menuLabel}</div>

        <nav className="ig-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                className={`ig-menu-item ${menuAktif === item.key ? "aktif" : ""}`}
                onClick={() => {
                  setMenuAktif(item.key);
                  setSidebarTerbuka(false);
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="ig-sidebar-account">
          <div className="ig-avatar">FS</div>
          <div>
            <strong>{t.account}</strong>
            <span>@namaakun</span>
          </div>
        </div>
      </aside>

      <section className="ig-main">

        <header className="ig-topbar">
          <div className="ig-heading">
            <button
              className="ig-mobile-menu"
              onClick={() => setSidebarTerbuka(true)}
            >
              <Menu size={22} />
            </button>
            <div>
              <h1>{activeMenu.label}</h1>
              <p>{t.description}</p>
            </div>
          </div>

          <div className="ig-topbar-right">
            <div className="ig-language-switch" role="group" aria-label={language === "id" ? "Pilihan bahasa" : "Language selector"}>
              {languageOptions.map((option) => (
                <button
                  key={option}
                  className={language === option ? "active" : ""}
                  onClick={() => setLanguage(option)}
                  type="button"
                >
                  {option.toUpperCase()}
                </button>
              ))}
            </div>
            <span className="ig-demo-status">
              <i /> {t.demo}
            </span>
            <div className="ig-avatar">FS</div>
          </div>
        </header>

        <section className="ig-filter">
          <div className="ig-filter-left">
            <label>{t.period}</label>
            <select value={periode} onChange={(e) => setPeriode(Number(e.target.value))}>
              {periodeOptions.map((option, index) => (
                <option key={option} value={index}>{option}</option>
              ))}
            </select>

            <select value={jenisKonten} onChange={(e) => setJenisKonten(e.target.value as "Semua" | "Reels" | "Carousel" | "Foto")}>
              {jenisOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <span className="ig-filter-note">
            <CalendarDays size={15} /> {periodeOptions[periode]}
          </span>
        </section>

        <section className="ig-section-heading">
          <div>
            <h2>{t.summary}</h2>
            <p>{t.summaryDesc}</p>
          </div>
        </section>

        <section className="ig-metrics">
          {metrik.map((item) => {
            const Icon = item.icon;
            return (
              <article className="ig-metric-card" key={item.nama}>
                <div className="ig-metric-top">
                  <span>{item.nama}</span>
                  <div className="ig-metric-icon"><Icon size={19} /></div>
                </div>
                <h3>{item.nilai}</h3>
                <span className="ig-metric-caption">{t.accumulation}</span>
              </article>
            );
          })}
        </section>

        <section className="ig-chart-grid">
          <article className="ig-panel ig-trend-panel">
            <div className="ig-panel-heading">
              <div>
                <h2>{t.trend}</h2>
                <p>{t.trendDesc}</p>
              </div>
              <div className="ig-legend">
                <span><i className="jangkauan" /> {t.reach}</span>
                <span><i className="interaksi" /> {t.interactions}</span>
              </div>
            </div>

            <div className="ig-chart">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dataGrafik}>
                  <defs>
                    <linearGradient id="warnaJangkauan" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3978ed" stopOpacity={0.22} />
                      <stop offset="100%" stopColor="#3978ed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf0f5" />
                  <XAxis dataKey="hari" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="jangkauan"
                    name={t.reach}
                    stroke="#3978ed"
                    strokeWidth={3}
                    fill="url(#warnaJangkauan)"
                  />
                  <Area
                    type="monotone"
                    dataKey="interaksi"
                    name={t.interactions}
                    stroke="#19b98b"
                    strokeWidth={2}
                    fill="transparent"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="ig-panel">
            <div className="ig-panel-heading">
              <div>
                <h2>{t.interactionDetail}</h2>
                <p>{t.interactionDesc}</p>
              </div>
            </div>

            <div className="ig-interaction-total">
              <h3>{formatAngka(total.interaksi, language)}</h3>
              <span>{t.totalInteractions}</span>
            </div>

            {[
              { nama: t.likes, nilai: total.suka, icon: Heart },
              { nama: t.comments, nilai: total.komentar, icon: MessageCircle },
              { nama: t.shares, nilai: total.bagikan, icon: Share2 },
              { nama: t.saves, nilai: total.simpan, icon: Bookmark },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div className="ig-interaction-row" key={item.nama}>
                  <span><Icon size={16} /> {item.nama}</span>
                  <strong>{formatAngka(item.nilai, language)}</strong>
                </div>
              );
            })}
          </article>
        </section>

        <section className="ig-panel ig-ranking-panel">
          <div className="ig-panel-heading ig-ranking-heading">
            <div>
              <h2>{t.ranking}</h2>
              <p>{t.rankingDesc}</p>
            </div>
            <div className="ig-search">
              <Search size={16} />
              <input
                placeholder={t.search}
                value={pencarian}
                onChange={(e) => setPencarian(e.target.value)}
              />
            </div>
          </div>

          <div className="ig-table-wrap">
            <table className="ig-table">
              <thead>
                <tr>
                  <th>{t.rank}</th>
                  <th>{t.content}</th>
                  <th>{t.type}</th>
                  <th>{t.reachCol}</th>
                  <th>{t.interactionCol}</th>
                  <th>{t.rate}</th>
                  <th>{t.sharesCol}</th>
                  <th>{t.savesCol}</th>
                </tr>
              </thead>
              <tbody>
                {kontenTerbaik.map((item, index) => (
                  <tr key={item.id}>
                    <td>
                      <span className={`ig-rank ${index === 0 ? "juara" : ""}`}>
                        #{index + 1}
                      </span>
                    </td>
                    <td>
                      <div className="ig-content-info">
                        <img src={item.gambar} alt={item.judul} />
                        <div>
                          <strong>{item.judul}</strong>
                          <span>{item.tanggal}</span>
                        </div>
                      </div>
                    </td>
                    <td>{item.jenis}</td>
                    <td>{formatAngka(item.jangkauan, language)}</td>
                    <td>{formatAngka(hitungInteraksi(item), language)}</td>
                    <td>
                      <span className="ig-rate">
                        {hitungEngagement(item).toFixed(1)}%
                      </span>
                    </td>
                    <td>{formatAngka(item.bagikan, language)}</td>
                    <td>{formatAngka(item.simpan, language)}</td>
                  </tr>
                ))}
                {kontenTerbaik.length === 0 && (
                  <tr><td colSpan={8} className="ig-empty">{t.noContent}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="ig-bottom-grid">
          <article className="ig-panel">
            <div className="ig-panel-heading">
              <div>
                <h2>{t.best}</h2>
                <p>{t.bestDesc}</p>
              </div>
              <Trophy size={20} color="#e6a32c" />
            </div>
            {kontenTerbaik.slice(0, 3).map((item, index) => (
              <div className="ig-simple-content" key={item.id}>
                <span className="ig-simple-rank">{index + 1}</span>
                <div className="ig-simple-info">
                  <strong>{item.judul}</strong>
                  <span>{formatAngka(hitungInteraksi(item), language)} {t.interactionCount}</span>
                </div>
              </div>
            ))}
          </article>

          <article className="ig-panel">
            <div className="ig-panel-heading">
              <div>
                <h2>{t.worst}</h2>
                <p>{t.worstDesc}</p>
              </div>
              <TrendingDown size={20} color="#e16a6a" />
            </div>
            {kontenTerburuk.slice(0, 3).map((item, index) => (
              <div className="ig-simple-content" key={item.id}>
                <span className="ig-simple-rank rendah">{index + 1}</span>
                <div className="ig-simple-info">
                  <strong>{item.judul}</strong>
                  <span>{formatAngka(hitungInteraksi(item), language)} {t.interactionCount}</span>
                </div>
              </div>
            ))}
          </article>
        </section>

        <footer className="ig-footer">
          <span>{t.footer} © 2026</span>
          <span>{t.footerDesc}</span>
        </footer>

      </section>
    </main>
  );
}

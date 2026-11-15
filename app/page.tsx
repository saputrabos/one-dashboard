
"use client";

// Ini untuk menggunakan state, efek, dan memoization React.
import { useEffect, useMemo, useState } from "react";



// Ini untuk membuat grafik analisis.
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Ini untuk mengambil ikon dari Lucide React.
import {
  Activity,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Users,
  UserPlus,
  Trophy,
  TrendingDown,
  TrendingUp,
  BarChart3,
  Search,
  CalendarDays,
  Image as ImageIcon,
  LayoutDashboard,
  Menu,
  X,
  Upload, 
} from "lucide-react";

// Ini untuk menentukan pilihan bahasa dashboard.
type Language = "id" | "en";

// Ini untuk menentukan jenis konten Instagram.
type ContentType = "Reels" | "Carousel" | "Foto";
type ContentFilter = "Semua" | ContentType;

// Ini untuk menentukan daftar menu analisis.
type MenuKey =
  | "overview"
  | "best-content"
  | "worst-content"
  | "content-ranking"
  | "engagement-analysis"
  | "reach-analysis"
  | "non-followers"
  | "share-rate"
  | "save-rate"
  | "comment-analysis"
  | "profile-visits"
  | "follow-conversion"
  | "content-growth";

// Ini untuk menentukan struktur data setiap konten.
type Content = {
  id: number;
  judul: string;
  jenis: ContentType;
  tanggal: string;
  hariKe: number;
  jangkauan: number;
  tayangan: number;
  suka: number;
  komentar: number;
  bagikan: number;
  simpan: number;
  nonPengikut: number;
  kunjungan: number;
  pengikut: number;
  gambar: string;
};

// Ini untuk menentukan format setiap analisis.
type AnalysisConfig = {
  title: string;
  description: string;
  metric: string;
  format: "number" | "percent";
  getValue: (item: Content) => number;
};

// Ini untuk menyediakan teks dalam dua bahasa.
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
      "Total Jangkauan",
      "Total Tayangan",
      "Total Interaksi",
      "Total Suka",
      "Total Komentar",
      "Total Dibagikan",
      "Total Disimpan",
      "Kunjungan Profil",
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
    contentCount: "Jumlah Konten",
    average: "Rata-rata",
    averageReach: "Rata-rata Jangkauan",
    result: "Hasil Analisis Konten",
    resultDesc: "Data berdasarkan filter dan metrik yang dipilih",
    metricValue: "Nilai Analisis",
    formatComparison: "Perbandingan Jenis Konten",
    formatComparisonDesc: "Membandingkan performa setiap format konten",
    totalReach: "Total Jangkauan",
    totalEngagement: "Total Interaksi",
    postCount: "Jumlah Postingan",
    insight: "Ringkasan Analisis",
    topContent: "Konten dengan nilai tertinggi",
    bottomContent: "Konten dengan nilai terendah",
    noData: "Belum ada data untuk filter ini.",
    allContent: "Semua Konten",
    chartTitle: "Perbandingan Performa",
    chartDescription: "Perbandingan nilai berdasarkan setiap konten",
    nonFollowers: "Non-Pengikut",
    newFollowers: "Pengikut Baru",
    profileVisits: "Kunjungan Profil",
    engagementRate: "Engagement Rate",
    shareRate: "Share Rate",
    saveRate: "Save Rate",
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
      "Total Reach",
      "Total Impressions",
      "Total Engagement",
      "Total Likes",
      "Total Comments",
      "Total Shares",
      "Total Saves",
      "Profile Visits",
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
    contentCount: "Content Count",
    average: "Average",
    averageReach: "Average Reach",
    result: "Content Analysis Results",
    resultDesc: "Data based on selected filters and metrics",
    metricValue: "Analysis Value",
    formatComparison: "Content Type Comparison",
    formatComparisonDesc: "Compare the performance of each content format",
    totalReach: "Total Reach",
    totalEngagement: "Total Engagement",
    postCount: "Post Count",
    insight: "Analysis Summary",
    topContent: "Highest performing content",
    bottomContent: "Lowest performing content",
    noData: "No data available for these filters.",
    allContent: "All Content",
    chartTitle: "Performance Comparison",
    chartDescription: "Compare metric values across content",
    nonFollowers: "Non-Followers",
    newFollowers: "New Followers",
    profileVisits: "Profile Visits",
    engagementRate: "Engagement Rate",
    shareRate: "Share Rate",
    saveRate: "Save Rate",
  },
};

// Ini untuk menentukan ikon setiap menu.
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
] as const;

// Ini untuk menentukan pilihan bahasa.
const languageOptions: Language[] = ["id", "en"];

// Ini untuk menentukan alamat backend FastAPI.
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// Ini untuk menyediakan gambar cadangan karena API belum mengirim URL gambar.
const gambarCadangan = [
  "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=300",
  "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=300",
  "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=300",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?w=300",
  "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=300",
  "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=300",
  "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=300",
  "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=300",
  "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=300",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300",
  "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=300",
];

// Ini untuk mengubah data API menjadi format yang dipakai komponen dashboard.
function ubahDataApi(item: Record<string, unknown>): Content {
  const hariKe = Number(item.days_ago ?? 0);
  const tanggalKonten = new Date(Date.now() - hariKe * 24 * 60 * 60 * 1000);
  const jenisApi = String(item.type ?? "Foto").toLowerCase();
  const jenis: ContentType =
    jenisApi === "reels" ? "Reels" : jenisApi === "carousel" ? "Carousel" : "Foto";

  return {
    id: Number(item.id),
    judul: String(item.title ?? "Konten Instagram"),
    jenis,
    tanggal: tanggalKonten.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    hariKe,
    jangkauan: Number(item.reach ?? 0),
    tayangan: Number(item.impressions ?? 0),
    suka: Number(item.likes ?? 0),
    komentar: Number(item.comments ?? 0),
    bagikan: Number(item.shares ?? 0),
    simpan: Number(item.saves ?? 0),
    nonPengikut: Number(item.non_followers ?? 0),
    kunjungan: Number(item.profile_visits ?? 0),
    pengikut: Number(item.follows ?? 0),
    gambar: gambarCadangan[(Number(item.id) - 1) % gambarCadangan.length],
  };
}

// Ini untuk mengubah angka menjadi format yang mudah dibaca.
function formatAngka(angka: number, locale: Language = "id") {
  return angka.toLocaleString(locale === "en" ? "en-US" : "id-ID");
}

// Ini untuk menghitung total interaksi dari satu konten.
function hitungInteraksi(item: Content) {
  return item.suka + item.komentar + item.bagikan + item.simpan;
}

// Ini untuk menghitung engagement rate berdasarkan jangkauan.
function hitungEngagement(item: Content) {
  return item.jangkauan
    ? (hitungInteraksi(item) / item.jangkauan) * 100
    : 0;
}

// Ini untuk menghitung share rate berdasarkan jangkauan.
function hitungShareRate(item: Content) {
  return item.jangkauan
    ? (item.bagikan / item.jangkauan) * 100
    : 0;
}

// Ini untuk menghitung save rate berdasarkan jangkauan.
function hitungSaveRate(item: Content) {
  return item.jangkauan
    ? (item.simpan / item.jangkauan) * 100
    : 0;
}

// Ini untuk membuat nama menu berdasarkan bahasa yang dipilih.
export default function Dashboard() {
  const [language, setLanguage] = useState<Language>("id");
  const [menuAktif, setMenuAktif] = useState<MenuKey>("overview");
  const [periode, setPeriode] = useState(30);
  const [jenisKonten, setJenisKonten] = useState<ContentFilter>("Semua");
  const [pencarian, setPencarian] = useState("");
  const [sidebarTerbuka, setSidebarTerbuka] = useState(false);
  const [kontenTersaring, setKontenTersaring] = useState<Content[]>([]);
  const [sedangMemuat, setSedangMemuat] = useState(true);
  const [apiError, setApiError] = useState("");

  // Ini untuk mengambil bahasa yang sebelumnya dipilih pengguna.
  useEffect(() => {
    const savedLanguage = window.localStorage.getItem("ig-dashboard-language");

    if (savedLanguage === "id" || savedLanguage === "en") {
      setLanguage(savedLanguage);
    }
  }, []);

  // Ini untuk menyimpan bahasa yang dipilih pengguna.
  useEffect(() => {
    window.localStorage.setItem("ig-dashboard-language", language);
  }, [language]);

  // Ini untuk mengambil teks berdasarkan bahasa aktif.
  const t = translations[language];

  // Ini untuk menggabungkan ikon menu dengan nama menu.
  const menuItems = menu.map((item, index) => ({
    ...item,
    label: t.menus[index],
  }));

  // Ini untuk mencari menu yang sedang aktif.
  const activeMenu =
    menuItems.find((item) => item.key === menuAktif) ?? menuItems[0];
  
  // Ini untuk mengambil data upload atau mengambil data dari FastAPI.
  useEffect(() => {
    const controller = new AbortController();

    async function ambilKonten() {
      setSedangMemuat(true);
      setApiError("");

      try {
        // Ini untuk memeriksa apakah pengguna sudah mengunggah data.
        const uploadedRaw = localStorage.getItem(
          "one-dashboard-uploaded-data"
        );

        if (uploadedRaw) {
          const uploadedData = JSON.parse(uploadedRaw) as Record<
            string,
            unknown
          >[];

          // Ini untuk menerapkan filter pada data hasil upload.
          const filteredData = uploadedData.filter((item) => {
            const cocokPeriode =
              Number(item.days_ago ?? 0) <= periode;

            const cocokJenis =
              jenisKonten === "Semua" ||
              String(item.type ?? "").toLowerCase() ===
                jenisKonten.toLowerCase();

            const cocokPencarian = String(item.title ?? "")
              .toLowerCase()
              .includes(pencarian.trim().toLowerCase());

            return cocokPeriode && cocokJenis && cocokPencarian;
          });

          // Ini untuk mengubah data upload ke format dashboard.
          setKontenTersaring(filteredData.map(ubahDataApi));
          return;
        }

        // Ini untuk mengambil data demo dari FastAPI jika belum ada upload.
        const params = new URLSearchParams({
          period: String(periode),
          content_type:
            jenisKonten === "Semua" ? "all" : jenisKonten.toLowerCase(),
          search: pencarian.trim(),
        });

        const response = await fetch(
          `${API_BASE_URL}/api/analytics/content?${params.toString()}`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            `Backend merespons dengan status ${response.status}`
          );
        }

        const hasil = await response.json();
        const daftar = Array.isArray(hasil.data) ? hasil.data : [];

        setKontenTersaring(daftar.map(ubahDataApi));
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        setKontenTersaring([]);
        setApiError(
          "Tidak dapat mengambil data. Periksa file upload atau koneksi FastAPI."
        );
      } finally {
        if (!controller.signal.aborted) {
          setSedangMemuat(false);
        }
      }
    }

    ambilKonten();

    return () => controller.abort();
  }, [periode, jenisKonten, pencarian]);


  // Ini untuk menghitung total statistik dari konten yang sudah disaring.
  const total = useMemo(() => {
    return kontenTersaring.reduce(
      (hasil, item) => ({
        jangkauan: hasil.jangkauan + item.jangkauan,
        tayangan: hasil.tayangan + item.tayangan,
        interaksi: hasil.interaksi + hitungInteraksi(item),
        suka: hasil.suka + item.suka,
        komentar: hasil.komentar + item.komentar,
        bagikan: hasil.bagikan + item.bagikan,
        simpan: hasil.simpan + item.simpan,
        kunjungan: hasil.kunjungan + item.kunjungan,
        pengikut: hasil.pengikut + item.pengikut,
      }),
      {
        jangkauan: 0,
        tayangan: 0,
        interaksi: 0,
        suka: 0,
        komentar: 0,
        bagikan: 0,
        simpan: 0,
        kunjungan: 0,
        pengikut: 0,
      }
    );
  }, [kontenTersaring]);

  // Ini untuk menghitung rata-rata statistik seluruh konten.
  const rataRata = useMemo(() => {
    const jumlah = kontenTersaring.length || 1;

    return {
      jangkauan: total.jangkauan / jumlah,
      interaksi: total.interaksi / jumlah,
      engagement: kontenTersaring.length
        ? kontenTersaring.reduce(
            (hasil, item) => hasil + hitungEngagement(item),
            0
          ) / kontenTersaring.length
        : 0,
    };
  }, [kontenTersaring, total]);

  // Ini untuk mengurutkan konten berdasarkan total interaksi.
  const kontenTerbaik = useMemo(
    () =>
      [...kontenTersaring].sort(
        (a, b) => hitungInteraksi(b) - hitungInteraksi(a)
      ),
    [kontenTersaring]
  );

  // Ini untuk mengurutkan konten dari interaksi terendah.
  const kontenTerburuk = useMemo(
    () =>
      [...kontenTersaring].sort(
        (a, b) => hitungInteraksi(a) - hitungInteraksi(b)
      ),
    [kontenTersaring]
  );

  // Ini untuk menentukan delapan kartu statistik di halaman ringkasan.
  const metrik = [
    { nama: t.metrics[0], nilai: total.jangkauan, icon: Eye },
    { nama: t.metrics[1], nilai: total.tayangan, icon: Activity },
    { nama: t.metrics[2], nilai: total.interaksi, icon: Heart },
    { nama: t.metrics[3], nilai: total.suka, icon: Heart },
    { nama: t.metrics[4], nilai: total.komentar, icon: MessageCircle },
    { nama: t.metrics[5], nilai: total.bagikan, icon: Share2 },
    { nama: t.metrics[6], nilai: total.simpan, icon: Bookmark },
    { nama: t.metrics[7], nilai: total.kunjungan, icon: Users },
  ];

  // Ini untuk mengatur analisis dan metrik setiap menu.
  const analysisConfig: Partial<Record<MenuKey, AnalysisConfig>> = {
    "best-content": {
      title: language === "id" ? "Konten Terbaik" : "Best Performing Content",
      description:
        language === "id"
          ? "Konten dengan jumlah interaksi tertinggi."
          : "Content with the highest engagement.",
      metric: t.totalEngagement,
      format: "number",
      getValue: hitungInteraksi,
    },
    "worst-content": {
      title: language === "id" ? "Konten Terburuk" : "Worst Performing Content",
      description:
        language === "id"
          ? "Konten dengan jumlah interaksi terendah."
          : "Content with the lowest engagement.",
      metric: t.totalEngagement,
      format: "number",
      getValue: hitungInteraksi,
    },
    "content-ranking": {
      title: language === "id" ? "Peringkat Konten" : "Content Ranking",
      description:
        language === "id"
          ? "Peringkat konten berdasarkan total interaksi."
          : "Content ranking based on total engagement.",
      metric: t.totalEngagement,
      format: "number",
      getValue: hitungInteraksi,
    },
    "engagement-analysis": {
      title: t.engagementRate,
      description:
        language === "id"
          ? "Mengukur tingkat interaksi audiens terhadap konten."
          : "Measure audience engagement with your content.",
      metric: t.engagementRate,
      format: "percent",
      getValue: hitungEngagement,
    },
    "reach-analysis": {
      title: language === "id" ? "Analisis Jangkauan" : "Reach Analysis",
      description:
        language === "id"
          ? "Melihat jumlah akun yang dijangkau oleh setiap konten."
          : "See how many accounts each post reached.",
      metric: t.reach,
      format: "number",
      getValue: (item) => item.jangkauan,
    },
    "non-followers": {
      title: t.nonFollowers,
      description:
        language === "id"
          ? "Melihat persentase jangkauan dari orang yang belum mengikuti akun."
          : "Measure the percentage of reach from non-followers.",
      metric: t.nonFollowers,
      format: "percent",
      getValue: (item) => item.nonPengikut,
    },
    "share-rate": {
      title: t.shareRate,
      description:
        language === "id"
          ? "Mengukur seberapa sering konten dibagikan."
          : "Measure how often content is shared.",
      metric: t.shareRate,
      format: "percent",
      getValue: hitungShareRate,
    },
    "save-rate": {
      title: t.saveRate,
      description:
        language === "id"
          ? "Mengukur seberapa sering konten disimpan."
          : "Measure how often content is saved.",
      metric: t.saveRate,
      format: "percent",
      getValue: hitungSaveRate,
    },
    "comment-analysis": {
      title: t.comments,
      description:
        language === "id"
          ? "Menemukan konten yang menghasilkan komentar terbanyak."
          : "Find content that generates the most comments.",
      metric: t.comments,
      format: "number",
      getValue: (item) => item.komentar,
    },
    "profile-visits": {
      title: t.profileVisits,
      description:
        language === "id"
          ? "Mengukur kunjungan profil yang dihasilkan setiap konten."
          : "Measure profile visits generated by each post.",
      metric: t.profileVisits,
      format: "number",
      getValue: (item) => item.kunjungan,
    },
    "follow-conversion": {
      title: language === "id" ? "Konversi Pengikut" : "Follower Conversion",
      description:
        language === "id"
          ? "Melihat konten yang menghasilkan pengikut baru."
          : "See which content generates new followers.",
      metric: t.newFollowers,
      format: "number",
      getValue: (item) => item.pengikut,
    },
    "content-growth": {
      title: t.formatComparison,
      description: t.formatComparisonDesc,
      metric: t.reach,
      format: "number",
      getValue: (item) => item.jangkauan,
    },
  };

  // Ini untuk mengambil konfigurasi analisis dari menu aktif.
  const analisisAktif = analysisConfig[menuAktif];

  // Ini untuk menentukan urutan konten sesuai menu analisis.
  const hasilAnalisis = useMemo(() => {
    if (!analisisAktif) return [];

    return [...kontenTersaring].sort((a, b) => {
      const nilaiA = analisisAktif.getValue(a);
      const nilaiB = analisisAktif.getValue(b);

      if (menuAktif === "worst-content") {
        return nilaiA - nilaiB;
      }

      return nilaiB - nilaiA;
    });
  }, [analisisAktif, kontenTersaring, menuAktif]);

  // Ini untuk menghitung total nilai metrik yang sedang dianalisis.
  const totalAnalisis = hasilAnalisis.reduce(
    (jumlah, item) => jumlah + (analisisAktif?.getValue(item) ?? 0),
    0
  );

  // Ini untuk menghitung nilai rata-rata metrik analisis.
  const rataAnalisis = hasilAnalisis.length
    ? totalAnalisis / hasilAnalisis.length
    : 0;

  // Ini untuk mengubah hasil analisis menjadi data grafik.
  const dataGrafikAnalisis = hasilAnalisis.slice(0, 8).map((item) => ({
    nama: item.judul.length > 18
      ? `${item.judul.slice(0, 18)}...`
      : item.judul,
    nilai: Number((analisisAktif?.getValue(item) ?? 0).toFixed(2)),
  }));

  // Ini untuk membandingkan performa Reels, Carousel, dan Foto.
  const dataPerbandingan = (["Reels", "Carousel", "Foto"] as ContentType[]).map(
    (jenis) => {
      const daftar = kontenTersaring.filter((item) => item.jenis === jenis);

      return {
        jenis,
        jangkauan: daftar.reduce((jumlah, item) => jumlah + item.jangkauan, 0),
        interaksi: daftar.reduce(
          (jumlah, item) => jumlah + hitungInteraksi(item),
          0
        ),
        jumlah: daftar.length,
      };
    }
  );

  // Ini untuk menampilkan angka sesuai format metrik.
  const tampilkanNilai = (nilai: number, format: "number" | "percent" = "number") => {
    if (format === "percent") {
      return `${nilai.toFixed(2)}%`;
    }

    return formatAngka(Math.round(nilai), language);
  };

  // Ini untuk mengatur pilihan filter jenis konten.
  const jenisOptions = [
    { value: "Semua", label: t.types[0] },
    { value: "Reels", label: t.types[1] },
    { value: "Carousel", label: t.types[2] },
    { value: "Foto", label: t.types[3] },
  ];

  // Ini untuk menampilkan halaman dashboard.
  return (
    <main className="ig-dashboard">
      {/* Ini untuk menampilkan lapisan gelap saat sidebar dibuka di HP. */}
      {sidebarTerbuka && (
        <button
          className="ig-overlay"
          onClick={() => setSidebarTerbuka(false)}
          aria-label={language === "id" ? "Tutup menu" : "Close menu"}
        />
      )}

      {/* Ini untuk menampilkan sidebar dan semua menu analisis. */}
      <aside className={`ig-sidebar ${sidebarTerbuka ? "ig-sidebar-open" : ""}`}>
        <div className="ig-brand">
          <div className="ig-brand-icon">
            <Activity size={23} />
          </div>

          <div>
            <h2>IG Intelligence</h2>
            <span>{t.brand}</span>
          </div>

          <button
            className="ig-close-menu"
            onClick={() => setSidebarTerbuka(false)}
            aria-label={language === "id" ? "Tutup menu" : "Close menu"}
          >
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
                  setPencarian("");
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

      {/* Ini untuk menampilkan area utama dashboard. */}
      <section className="ig-main">
        {/* Ini untuk menampilkan judul, pilihan bahasa, dan status data. */}
        <header className="ig-topbar">
          <div className="ig-heading">
            <button
              className="ig-mobile-menu"
              onClick={() => setSidebarTerbuka(true)}
              aria-label={language === "id" ? "Buka menu" : "Open menu"}
            >
              <Menu size={22} />
            </button>

            <div>
              <h1>{activeMenu.label}</h1>
              <p>{t.description}</p>
            </div>
          </div>

          <div className="ig-topbar-right">
            {/* Ini untuk membuka halaman upload CSV dan Excel. */}
<a href="/upload" className="ig-upload-button">
  <Upload size={15} />
  <span>Upload Excel</span>
</a>
            <div
              className="ig-language-switch"
              role="group"
              aria-label={language === "id" ? "Pilihan bahasa" : "Language selector"}
            >
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

        {/* Ini untuk menampilkan filter periode dan jenis konten. */}
        <section className="ig-filter">
          <div className="ig-filter-left">
            <label>{t.period}</label>

            <select
              value={periode}
              onChange={(e) => setPeriode(Number(e.target.value))}
            >
              <option value={7}>{t.periods[0]}</option>
              <option value={30}>{t.periods[1]}</option>
              <option value={90}>{t.periods[2]}</option>
            </select>

            <select
              value={jenisKonten}
              onChange={(e) => setJenisKonten(e.target.value as ContentFilter)}
            >
              {jenisOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <span className="ig-filter-note">
            <CalendarDays size={15} />
            {t.periods[[7, 30, 90].indexOf(periode)]}
          </span>
        </section>

        {/* Ini untuk memberi tahu pengguna saat API sedang memuat atau gagal diakses. */}
        {apiError && (
          <div
            role="alert"
            style={{
              margin: "0 0 16px",
              padding: "12px 14px",
              borderRadius: 10,
              background: "#fff1f0",
              color: "#b42318",
              fontSize: 13,
            }}
          >
            {apiError}
          </div>
        )}
        {sedangMemuat && !apiError && (
          <div style={{ margin: "0 0 16px", color: "#64748b", fontSize: 13 }}>
            {language === "id" ? "Memuat data dari backend..." : "Loading data from backend..."}
          </div>
        )}

        {/* Ini untuk menampilkan halaman ringkasan utama. */}
        {menuAktif === "overview" && (
          <>
            <section className="ig-section-heading">
              <div>
                <h2>{t.summary}</h2>
                <p>{t.summaryDesc}</p>
              </div>
            </section>

            {/* Ini untuk menampilkan delapan kartu statistik utama. */}
            <section className="ig-metrics">
              {metrik.map((item) => {
                const Icon = item.icon;

                return (
                  <article className="ig-metric-card" key={item.nama}>
                    <div className="ig-metric-top">
                      <span>{item.nama}</span>
                      <div className="ig-metric-icon">
                        <Icon size={19} />
                      </div>
                    </div>

                    <h3>{formatAngka(item.nilai, language)}</h3>
                    <span className="ig-metric-caption">{t.accumulation}</span>
                  </article>
                );
              })}
            </section>

            {/* Ini untuk menampilkan grafik dan rincian interaksi. */}
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
                    <AreaChart data={[...kontenTersaring].reverse()}>
                      <defs>
                        <linearGradient id="warnaJangkauan" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3978ed" stopOpacity={0.22} />
                          <stop offset="100%" stopColor="#3978ed" stopOpacity={0} />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#edf0f5"
                      />

                      <XAxis
                        dataKey="tanggal"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10 }}
                      />

                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10 }}
                      />

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
                        dataKey="suka"
                        name={t.likes}
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

            {/* Ini untuk menampilkan tabel peringkat konten. */}
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
                            {hitungEngagement(item).toFixed(2)}%
                          </span>
                        </td>

                        <td>{formatAngka(item.bagikan, language)}</td>
                        <td>{formatAngka(item.simpan, language)}</td>
                      </tr>
                    ))}

                    {kontenTerbaik.length === 0 && (
                      <tr>
                        <td colSpan={8} className="ig-empty">{t.noContent}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Ini untuk menampilkan tiga konten terbaik dan terburuk. */}
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
                      <span>
                        {formatAngka(hitungInteraksi(item), language)} {t.interactionCount}
                      </span>
                    </div>
                  </div>
                ))}

                {kontenTerbaik.length === 0 && <p className="ig-empty">{t.noData}</p>}
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
                      <span>
                        {formatAngka(hitungInteraksi(item), language)} {t.interactionCount}
                      </span>
                    </div>
                  </div>
                ))}

                {kontenTerburuk.length === 0 && <p className="ig-empty">{t.noData}</p>}
              </article>
            </section>
          </>
        )}

        {/* Ini untuk menampilkan semua halaman analisis selain ringkasan. */}
        {analisisAktif && (
          <>
            <section className="ig-section-heading">
              <div>
                <h2>{analisisAktif.title}</h2>
                <p>{analisisAktif.description}</p>
              </div>
            </section>

            {/* Ini untuk menampilkan metrik utama dari analisis yang dipilih. */}
            <section className="ig-metrics">
              <article className="ig-metric-card">
                <div className="ig-metric-top">
                  <span>{analisisAktif.metric}</span>
                  <div className="ig-metric-icon">
                    <Activity size={19} />
                  </div>
                </div>

                <h3>
                  {tampilkanNilai(
                    menuAktif === "content-growth"
                      ? total.jangkauan
                      : menuAktif === "engagement-analysis"
                        ? rataRata.engagement
                        : menuAktif === "non-followers"
                          ? kontenTersaring.length
                            ? kontenTersaring.reduce((jumlah, item) => jumlah + item.nonPengikut, 0) / kontenTersaring.length
                            : 0
                          : totalAnalisis,
                    menuAktif === "engagement-analysis" || menuAktif === "non-followers"
                      ? "percent"
                      : "number"
                  )}
                </h3>

                <span className="ig-metric-caption">{t.accumulation}</span>
              </article>

              <article className="ig-metric-card">
                <div className="ig-metric-top">
                  <span>{t.contentCount}</span>
                  <div className="ig-metric-icon">
                    <ImageIcon size={19} />
                  </div>
                </div>

                <h3>{formatAngka(kontenTersaring.length, language)}</h3>
                <span className="ig-metric-caption">{t.accumulation}</span>
              </article>

              <article className="ig-metric-card">
                <div className="ig-metric-top">
                  <span>{t.averageReach}</span>
                  <div className="ig-metric-icon">
                    <Eye size={19} />
                  </div>
                </div>

                <h3>{formatAngka(Math.round(rataRata.jangkauan), language)}</h3>
                <span className="ig-metric-caption">{t.average}</span>
              </article>

              <article className="ig-metric-card">
                <div className="ig-metric-top">
                  <span>{t.engagementRate}</span>
                  <div className="ig-metric-icon">
                    <Heart size={19} />
                  </div>
                </div>

                <h3>{rataRata.engagement.toFixed(2)}%</h3>
                <span className="ig-metric-caption">{t.average}</span>
              </article>
            </section>

            {/* Ini untuk menampilkan grafik hasil analisis. */}
            {menuAktif !== "content-growth" && (
              <section className="ig-panel" style={{ marginBottom: 18 }}>
                <div className="ig-panel-heading">
                  <div>
                    <h2>{t.chartTitle}</h2>
                    <p>{t.chartDescription}</p>
                  </div>
                </div>

                <div className="ig-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dataGrafikAnalisis}
                      margin={{ top: 15, right: 15, left: 0, bottom: 35 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#edf0f5"
                      />

                      <XAxis
                        dataKey="nama"
                        axisLine={false}
                        tickLine={false}
                        angle={-20}
                        textAnchor="end"
                        interval={0}
                        tick={{ fontSize: 9 }}
                      />

                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10 }}
                      />

                      <Tooltip />

                      <Bar
                        dataKey="nilai"
                        name={analisisAktif.metric}
                        fill="#3978ed"
                        radius={[5, 5, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}

            {/* Ini untuk menampilkan perbandingan performa berdasarkan format konten. */}
            {menuAktif === "content-growth" && (
              <section className="ig-panel" style={{ marginBottom: 18 }}>
                <div className="ig-panel-heading">
                  <div>
                    <h2>{t.formatComparison}</h2>
                    <p>{t.formatComparisonDesc}</p>
                  </div>
                </div>

                <div className="ig-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dataPerbandingan}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#edf0f5"
                      />

                      <XAxis dataKey="jenis" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip />

                      <Bar
                        dataKey="jangkauan"
                        name={t.totalReach}
                        fill="#3978ed"
                        radius={[5, 5, 0, 0]}
                      />

                      <Bar
                        dataKey="interaksi"
                        name={t.totalEngagement}
                        fill="#19b98b"
                        radius={[5, 5, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Ini untuk menampilkan angka perbandingan tiap format. */}
                <div className="ig-table-wrap">
                  <table className="ig-table">
                    <thead>
                      <tr>
                        <th>{t.type}</th>
                        <th>{t.postCount}</th>
                        <th>{t.totalReach}</th>
                        <th>{t.totalEngagement}</th>
                      </tr>
                    </thead>

                    <tbody>
                      {dataPerbandingan.map((item) => (
                        <tr key={item.jenis}>
                          <td>{item.jenis}</td>
                          <td>{formatAngka(item.jumlah, language)}</td>
                          <td>{formatAngka(item.jangkauan, language)}</td>
                          <td>{formatAngka(item.interaksi, language)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Ini untuk menampilkan ringkasan konten dengan performa tertinggi dan terendah. */}
            {hasilAnalisis.length > 0 && menuAktif !== "content-ranking" && (
              <section className="ig-bottom-grid">
                <article className="ig-panel">
                  <div className="ig-panel-heading">
                    <div>
                      <h2>{t.insight}</h2>
                      <p>{t.topContent}</p>
                    </div>
                    <Trophy size={20} color="#e6a32c" />
                  </div>

                  <div className="ig-simple-content">
                    <span className="ig-simple-rank">1</span>
                    <div className="ig-simple-info">
                      <strong>{hasilAnalisis[0].judul}</strong>
                      <span>
                        {tampilkanNilai(
                          analisisAktif.getValue(hasilAnalisis[0]),
                          analisisAktif.format
                        )}
                      </span>
                    </div>
                  </div>
                </article>

                <article className="ig-panel">
                  <div className="ig-panel-heading">
                    <div>
                      <h2>{t.insight}</h2>
                      <p>{t.bottomContent}</p>
                    </div>
                    <TrendingDown size={20} color="#e16a6a" />
                  </div>

                  <div className="ig-simple-content">
                    <span className="ig-simple-rank rendah">1</span>
                    <div className="ig-simple-info">
                      <strong>{hasilAnalisis[hasilAnalisis.length - 1].judul}</strong>
                      <span>
                        {tampilkanNilai(
                          hasilAnalisis[hasilAnalisis.length - 1] &&
                            analisisAktif.getValue(
                              hasilAnalisis[hasilAnalisis.length - 1]
                            ),
                          analisisAktif.format
                        )}
                      </span>
                    </div>
                  </div>
                </article>
              </section>
            )}

            {/* Ini untuk menampilkan tabel hasil analisis yang dipilih. */}
            <section className="ig-panel ig-ranking-panel">
              <div className="ig-panel-heading ig-ranking-heading">
                <div>
                  <h2>{t.result}</h2>
                  <p>{t.resultDesc}</p>
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
                      <th>{analisisAktif.metric}</th>
                      <th>{t.reachCol}</th>
                      <th>{t.interactionCol}</th>
                      <th>{t.rate}</th>
                    </tr>
                  </thead>

                  <tbody>
                    {hasilAnalisis.map((item, index) => (
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

                        <td>
                          {tampilkanNilai(
                            analisisAktif.getValue(item),
                            analisisAktif.format
                          )}
                        </td>

                        <td>{formatAngka(item.jangkauan, language)}</td>

                        <td>{formatAngka(hitungInteraksi(item), language)}</td>

                        <td>
                          <span className="ig-rate">
                            {hitungEngagement(item).toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    ))}

                    {hasilAnalisis.length === 0 && (
                      <tr>
                        <td colSpan={7} className="ig-empty">
                          {t.noData}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* Ini untuk menampilkan informasi footer dashboard. */}
        <footer className="ig-footer">
          <span>{t.footer} © 2026</span>
          <span>{t.footerDesc}</span>
        </footer>
      </section>
    </main>
  );
}

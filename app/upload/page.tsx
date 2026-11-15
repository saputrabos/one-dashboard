
"use client";
import styles from "./upload.css";

// Ini untuk mengelola state dan navigasi halaman.
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

// Ini untuk membaca file CSV dan Excel.
import * as XLSX from "xlsx";

// Ini untuk menggunakan ikon.
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  FileUp,
  X,
} from "lucide-react";

// Ini untuk menentukan bentuk data yang akan dibaca.
type UploadedContent = {
  id: number;
  title: string;
  type: string;
  reach: number;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  non_followers: number;
  profile_visits: number;
  follows: number;
  days_ago: number;
};

// Ini untuk menyimpan nama kolom alternatif dari berbagai format.
const columnAliases: Record<string, string[]> = {
  title: ["title", "judul", "post", "content", "caption", "media title", "nama konten"],
  type: ["type", "jenis", "content type", "media type", "tipe konten"],
  date: ["date", "tanggal", "publish date", "published", "created time"],
  reach: ["reach", "jangkauan", "accounts reached", "akun dijangkau"],
  impressions: ["impressions", "tayangan", "views", "plays", "pemutaran"],
  likes: ["likes", "like", "suka"],
  comments: ["comments", "comment", "komentar"],
  shares: ["shares", "share", "bagikan", "dibagikan"],
  saves: ["saves", "save", "simpan", "disimpan"],
  non_followers: ["non followers", "non_followers", "non-followers", "persentase non pengikut"],
  profile_visits: ["profile visits", "profile_visits", "kunjungan profil"],
  follows: ["follows", "followers gained", "pengikut baru", "pengikut"],
};

// Ini untuk menyeragamkan nama kolom.
function normalizeHeader(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ");
}

// Ini untuk mencari kolom yang cocok dengan nama yang dikenal.
function findColumn(headers: string[], key: string): number {
  const aliases = columnAliases[key] ?? [];

  return headers.findIndex((header) => {
    const normalized = normalizeHeader(header);
    return aliases.some((alias) => normalizeHeader(alias) === normalized);
  });
}

// Ini untuk mengubah nilai angka dari file menjadi angka JavaScript.
function parseNumber(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const cleaned = String(value ?? "")
    .replace(/%/g, "")
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "")
    .replace(",", ".");

  const result = Number(cleaned);
  return Number.isFinite(result) ? result : 0;
}

// Ini untuk membaca tanggal dan menghitung jaraknya dari hari ini.
function getDaysAgo(value: unknown, index: number): number {
  if (!value) return index;

  let date: Date;

  if (value instanceof Date) {
    date = value;
  } else if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    date = parsed
      ? new Date(parsed.y, parsed.m - 1, parsed.d)
      : new Date(value);
  } else {
    date = new Date(String(value));
  }

  if (Number.isNaN(date.getTime())) return index;

  const difference = Date.now() - date.getTime();
  return Math.max(0, Math.floor(difference / (1000 * 60 * 60 * 24)));
}

// Ini untuk menyeragamkan jenis konten Instagram.
function normalizeType(value: unknown): string {
  const type = String(value ?? "").toLowerCase();

  if (type.includes("reel") || type.includes("video")) return "Reels";
  if (type.includes("carousel") || type.includes("album")) return "Carousel";

  return "Foto";
}

// Ini untuk mengubah setiap baris file menjadi format dashboard.
function convertRows(rows: unknown[][]): UploadedContent[] {
  if (rows.length < 2) {
    throw new Error("File tidak memiliki data yang cukup.");
  }

  const headers = rows[0].map((item) => String(item ?? ""));
  const columnIndex: Record<string, number> = {};

  Object.keys(columnAliases).forEach((key) => {
    columnIndex[key] = findColumn(headers, key);
  });

  if (columnIndex.title === -1 || columnIndex.reach === -1) {
    throw new Error(
      "Kolom wajib belum ditemukan. Pastikan tersedia kolom Title/Judul dan Reach/Jangkauan."
    );
  }

  const result = rows.slice(1)
    .filter((row) => row.some((cell) => String(cell ?? "").trim() !== ""))
    .map((row, index) => {
      const getValue = (key: string) => {
        const position = columnIndex[key];
        return position >= 0 ? row[position] : "";
      };

      const title = String(getValue("title") || `Konten ${index + 1}`).trim();

      return {
        id: index + 1,
        title,
        type: normalizeType(getValue("type")),
        reach: parseNumber(getValue("reach")),
        impressions: parseNumber(getValue("impressions")),
        likes: parseNumber(getValue("likes")),
        comments: parseNumber(getValue("comments")),
        shares: parseNumber(getValue("shares")),
        saves: parseNumber(getValue("saves")),
        non_followers: parseNumber(getValue("non_followers")),
        profile_visits: parseNumber(getValue("profile_visits")),
        follows: parseNumber(getValue("follows")),
        days_ago: getDaysAgo(getValue("date"), index),
      };
    });

  if (result.length === 0) {
    throw new Error("Tidak ada baris data yang bisa dibaca.");
  }

  return result;
}

// Ini adalah halaman upload data.
export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [totalRows, setTotalRows] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Ini untuk memproses file yang dipilih pengguna.
  async function handleFile(file?: File) {
    if (!file) return;

    setErrorMessage("");
    setSuccessMessage("");
    setTotalRows(0);

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!["csv", "xlsx", "xls"].includes(extension ?? "")) {
      setErrorMessage("Format file tidak didukung. Gunakan CSV, XLSX, atau XLS.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("Ukuran file terlalu besar. Maksimal 10 MB.");
      return;
    }

    setIsLoading(true);
    setFileName(file.name);

    try {
      const buffer = await file.arrayBuffer();

      const workbook = XLSX.read(buffer, {
        type: "array",
        cellDates: true,
      });

      const firstSheet = workbook.SheetNames[0];

      if (!firstSheet) {
        throw new Error("Sheet tidak ditemukan dalam file.");
      }

      const worksheet = workbook.Sheets[firstSheet];

      const rows = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: "",
        raw: true,
      }) as unknown[][];

      const convertedData = convertRows(rows);

      // Ini untuk menyimpan data hasil upload di browser.
      localStorage.setItem(
        "one-dashboard-uploaded-data",
        JSON.stringify(convertedData)
      );

      localStorage.setItem("one-dashboard-data-source", "csv-excel");

      setTotalRows(convertedData.length);
      setSuccessMessage("File berhasil dibaca. Data siap dianalisis.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat membaca file."
      );
    } finally {
      setIsLoading(false);
    }
  }

  // Ini untuk membuka file picker.
  function openFilePicker() {
    fileInputRef.current?.click();
  }

  // Ini untuk menghapus pilihan file.
  function clearFile() {
    setFileName("");
    setErrorMessage("");
    setSuccessMessage("");
    setTotalRows(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <main className="upload-page">
      <div className="upload-container">
        <button
          className="upload-back"
          onClick={() => router.push("/")}
          type="button"
        >
          <ArrowLeft size={17} />
          Kembali
        </button>

        <header className="upload-header">
          <div className="upload-brand-icon">
            <FileSpreadsheet size={25} />
          </div>

          <span className="upload-eyebrow">ONE DASHBOARD</span>

          <h1>Upload Data Instagram</h1>

          <p>
            Unggah laporan Instagram Insights untuk mulai menganalisis
            performa konten akun Anda.
          </p>
        </header>

        <section
          className={`upload-dropzone ${isDragging ? "dragging" : ""}`}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            handleFile(event.dataTransfer.files[0]);
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            hidden
            onChange={(event) => handleFile(event.target.files?.[0])}
          />

          <div className="upload-icon">
            <Upload size={29} />
          </div>

          <h2>Drag & drop file di sini</h2>

          <p>atau pilih file dari perangkat Anda</p>

          <button
            className="upload-select-button"
            onClick={openFilePicker}
            type="button"
            disabled={isLoading}
          >
            <FileUp size={17} />
            Pilih File
          </button>

          <span className="upload-format">
            Format: CSV, XLSX, XLS · Maksimal 10 MB
          </span>
        </section>

        {fileName && (
          <div className="upload-file-info">
            <div className="upload-file-left">
              <FileSpreadsheet size={22} />

              <div>
                <strong>{fileName}</strong>
                <span>
                  {isLoading
                    ? "Sedang membaca file..."
                    : `${totalRows} baris data ditemukan`}
                </span>
              </div>
            </div>

            <button onClick={clearFile} type="button" aria-label="Hapus file">
              <X size={18} />
            </button>
          </div>
        )}

        {isLoading && (
          <div className="upload-message upload-loading">
            Sedang membaca dan memeriksa data...
          </div>
        )}

        {errorMessage && (
          <div className="upload-message upload-error">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="upload-message upload-success">
            <CheckCircle2 size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        <section className="upload-guide">
          <h3>Format kolom yang diperlukan</h3>

          <p>
            File harus memiliki baris pertama sebagai nama kolom. Minimal
            tersedia kolom <strong>Title</strong> dan <strong>Reach</strong>.
          </p>

          <div className="upload-columns">
            <span>Title</span>
            <span>Type</span>
            <span>Date</span>
            <span>Reach</span>
            <span>Impressions</span>
            <span>Likes</span>
            <span>Comments</span>
            <span>Shares</span>
            <span>Saves</span>
            <span>Non Followers</span>
            <span>Profile Visits</span>
            <span>Follows</span>
          </div>

          <p className="upload-note">
            Kolom selain Title dan Reach bersifat opsional. Nama kolom
            berbahasa Indonesia seperti Judul, Jangkauan, Suka, dan Komentar
            juga dikenali.
          </p>
        </section>

        <button
          className="upload-continue-button"
          type="button"
          disabled={!successMessage || isLoading}
          onClick={() => router.push("/")}
        >
          Lanjut ke Dashboard
        </button>

        <footer className="upload-footer">
          One Dashboard · Instagram Growth Intelligence
        </footer>
      </div>
    </main>
  );
}

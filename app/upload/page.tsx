
"use client";

// Ini untuk mengelola halaman upload dan membaca file Excel/CSV.
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  CloudUpload,
  FileSpreadsheet,
  FileText,
  Info,
  Loader2,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";
import "./upload.css";

// Ini untuk menentukan nama penyimpanan data dashboard.
const STORAGE_DATA = "one-dashboard-uploaded-data";
const STORAGE_SOURCE = "one-dashboard-data-source";

// Ini untuk menentukan format file yang didukung.
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = [".csv", ".xlsx", ".xls"];

// Ini untuk mengenali nama kolom bahasa Inggris dan Indonesia.
const COLUMN_ALIASES: Record<string, string[]> = {
  title: ["title", "judul", "nama konten", "content title"],
  type: ["type", "tipe", "jenis", "jenis konten", "content type"],
  date: ["date", "tanggal", "published date", "tanggal publikasi"],
  reach: ["reach", "jangkauan", "akun dijangkau"],
  impressions: ["impressions", "tayangan", "impresi"],
  likes: ["likes", "like", "suka"],
  comments: ["comments", "comment", "komentar"],
  shares: ["shares", "share", "dibagikan"],
  saves: ["saves", "save", "disimpan"],
  nonFollowers: ["non followers", "non-followers", "bukan pengikut"],
  profileVisits: ["profile visits", "kunjungan profil"],
  follows: ["follows", "followers gained", "pengikut baru", "mengikuti"],
};

// Ini untuk merapikan nama kolom sebelum dicocokkan.
function normalizeColumn(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ");
}

// Ini untuk mencari nama kolom yang cocok.
function findColumn(headers: string[], key: string) {
  const aliases = COLUMN_ALIASES[key];
  return headers.find((header) =>
    aliases.includes(normalizeColumn(header))
  );
}

// Ini untuk mengubah nilai kosong menjadi angka nol.
function toNumber(value: unknown): number {
  if (typeof value === "number") return value;

  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const cleaned = String(value).replace(/[^\d.-]/g, "");
  const parsed = Number(cleaned);

  return Number.isFinite(parsed) ? parsed : 0;
}

// Ini untuk mengubah data Excel menjadi format dashboard.
function convertRows(rows: Record<string, unknown>[]) {
  if (!rows.length) {
    throw new Error("File tidak memiliki data.");
  }

  const headers = Object.keys(rows[0]);

  const titleColumn = findColumn(headers, "title");
  const reachColumn = findColumn(headers, "reach");

  if (!titleColumn || !reachColumn) {
    throw new Error(
      "Kolom Title dan Reach wajib tersedia. Gunakan Judul dan Jangkauan jika menggunakan bahasa Indonesia."
    );
  }

  return rows
    .filter((row) => row[titleColumn] !== undefined && String(row[titleColumn]).trim() !== "")
    .map((row, index) => {
      const get = (key: string) => {
        const column = findColumn(headers, key);
        return column ? row[column] : undefined;
      };

      return {
        id: index + 1,
        title: String(row[titleColumn] ?? `Konten ${index + 1}`),
        type: String(get("type") || "Photo"),
        date: String(get("date") || ""),
        reach: toNumber(row[reachColumn]),
        impressions: toNumber(get("impressions")),
        likes: toNumber(get("likes")),
        comments: toNumber(get("comments")),
        shares: toNumber(get("shares")),
        saves: toNumber(get("saves")),
        nonFollowers: toNumber(get("nonFollowers")),
        profileVisits: toNumber(get("profileVisits")),
        follows: toNumber(get("follows")),
      };
    });
}

// Ini merupakan komponen utama halaman upload.
export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Ini untuk memproses file CSV atau Excel.
  async function processFile(selectedFile: File) {
    setError("");
    setSuccess(false);
    setData([]);
    setFile(null);

    const extension = selectedFile.name
      .slice(selectedFile.name.lastIndexOf("."))
      .toLowerCase();

    if (!ACCEPTED_TYPES.includes(extension)) {
      setError("Format file tidak didukung. Gunakan CSV, XLSX, atau XLS.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("Ukuran file melebihi batas maksimal 10 MB.");
      return;
    }

    if (selectedFile.size === 0) {
      setError("File yang dipilih kosong.");
      return;
    }

    setLoading(true);

    try {
      const buffer = await selectedFile.arrayBuffer();

      const workbook = XLSX.read(buffer, {
        type: "array",
        cellDates: true,
      });

      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

      if (!firstSheet) {
        throw new Error("Sheet tidak ditemukan dalam file.");
      }

      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
        firstSheet,
        {
          defval: "",
          raw: false,
        }
      );

      const converted = convertRows(rows);

      if (!converted.length) {
        throw new Error("Tidak ada data konten yang bisa diproses.");
      }

      setFile(selectedFile);
      setData(converted);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat membaca file."
      );
    } finally {
      setLoading(false);
    }
  }

  // Ini untuk menangani file yang dipilih melalui tombol.
  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      processFile(selectedFile);
    }

    event.target.value = "";
  }

  // Ini untuk menangani drag and drop file.
  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);

    const droppedFile = event.dataTransfer.files?.[0];

    if (droppedFile) {
      processFile(droppedFile);
    }
  }

  // Ini untuk menyimpan data yang sudah diproses.
  function continueToDashboard() {
    if (!data.length) return;

    try {
      localStorage.setItem(STORAGE_DATA, JSON.stringify(data));
      localStorage.setItem(STORAGE_SOURCE, "excel");

      router.push("/");
    } catch {
      setError("Gagal menyimpan data. Periksa ruang penyimpanan browser.");
    }
  }

  // Ini untuk menghapus file yang sudah dipilih.
  function removeFile() {
    setFile(null);
    setData([]);
    setError("");
    setSuccess(false);
  }

  return (
    <main className="upload-page">
      <div className="upload-shell">
        {/* Ini merupakan header halaman upload. */}
        <header className="upload-header">
          <a href="/" className="upload-brand">
            <span className="upload-brand-icon">
              <BarChart3 size={22} strokeWidth={2.5} />
            </span>

            <span className="upload-brand-text">
              <strong>ONE DASHBOARD</strong>
              <small>INSTAGRAM GROWTH INTELLIGENCE</small>
            </span>
          </a>

          <a href="/" className="upload-back">
            <ArrowLeft size={16} />
            <span>Kembali</span>
          </a>
        </header>

        {/* Ini merupakan bagian judul halaman. */}
        <section className="upload-intro">
          <div className="upload-eyebrow">
            <span className="upload-eyebrow-dot" />
            DATA IMPORT
          </div>

          <h1>
            Upload Data
            <span> Instagram</span>
          </h1>

          <p>
            Impor laporan Instagram Insights Anda dan ubah data menjadi
            informasi yang membantu mengembangkan akun.
          </p>
        </section>

        {/* Ini merupakan area utama untuk mengunggah file. */}
        <section className="upload-card">
          <div className="upload-card-heading">
            <div>
              <h2>Import your data</h2>
              <p>Mulai dengan mengunggah laporan performa konten.</p>
            </div>

            <div className="upload-secure">
              <ShieldCheck size={15} />
              <span>Local import</span>
            </div>
          </div>

          <div
            className={`upload-dropzone ${dragging ? "is-dragging" : ""} ${
              success ? "has-file" : ""
            }`}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            {loading ? (
              <div className="upload-loading">
                <Loader2 size={38} className="upload-spinner" />
                <h3>Sedang membaca file...</h3>
                <p>Mohon tunggu sebentar.</p>
              </div>
            ) : success && file ? (
              <div className="upload-file-success">
                <div className="upload-file-icon success-icon">
                  <FileSpreadsheet size={32} />
                </div>

                <h3>File berhasil dibaca!</h3>
                <p>{file.name}</p>

                <div className="upload-file-meta">
                  <span>{data.length} konten ditemukan</span>
                  <span>{(file.size / 1024).toFixed(1)} KB</span>
                </div>

                <button
                  type="button"
                  className="upload-remove"
                  onClick={removeFile}
                >
                  <X size={14} />
                  Hapus file
                </button>
              </div>
            ) : (
              <div className="upload-empty">
                <div className="upload-cloud-icon">
                  <CloudUpload size={37} strokeWidth={1.7} />
                </div>

                <h3>Drag & drop file di sini</h3>
                <p>atau pilih file dari perangkat Anda</p>

                <button
                  type="button"
                  className="upload-select-button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={17} />
                  Pilih File
                </button>

                <div className="upload-format-note">
                  <FileText size={14} />
                  CSV, XLSX, XLS
                  <span className="format-separator">•</span>
                  Maksimal 10 MB
                </div>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="upload-hidden-input"
            onChange={handleFileChange}
          />

          {/* Ini untuk menampilkan pesan kesalahan. */}
          {error && (
            <div className="upload-error">
              <Info size={17} />
              <span>{error}</span>
            </div>
          )}

          {/* Ini untuk menampilkan ringkasan data yang berhasil dibaca. */}
          {success && (
            <div className="upload-success-message">
              <CheckCircle2 size={17} />
              Data siap digunakan. Klik tombol di bawah untuk membuka dashboard.
            </div>
          )}

          {/* Ini merupakan tombol menuju dashboard. */}
          <div className="upload-card-footer">
            <div className="upload-footer-note">
              <ShieldCheck size={16} />
              <span>Data diproses di browser Anda</span>
            </div>

            <button
              type="button"
              className="upload-continue-button"
              disabled={!success || loading}
              onClick={continueToDashboard}
            >
              Lanjut ke Dashboard
              <ArrowRight size={17} />
            </button>
          </div>
        </section>

        {/* Ini untuk menjelaskan struktur kolom file. */}
        <section className="upload-format-section">
          <div className="upload-format-heading">
            <div className="upload-format-heading-icon">
              <FileSpreadsheet size={20} />
            </div>

            <div>
              <h2>Format kolom yang diperlukan</h2>
              <p>
                Baris pertama harus berisi nama kolom. Minimal tersedia
                Title dan Reach.
              </p>
            </div>
          </div>

          <div className="upload-columns">
            {[
              "Title",
              "Type",
              "Date",
              "Reach",
              "Impressions",
              "Likes",
              "Comments",
              "Shares",
              "Saves",
              "Non Followers",
              "Profile Visits",
              "Follows",
            ].map((column, index) => (
              <span
                key={column}
                className={
                  index === 0 || index === 3
                    ? "upload-column required-column"
                    : "upload-column"
                }
              >
                {column}
                {(index === 0 || index === 3) && (
                  <span className="required-star">*</span>
                )}
              </span>
            ))}
          </div>

          <div className="upload-format-info">
            <Info size={16} />
            <p>
              Kolom selain <strong>Title</strong> dan <strong>Reach</strong>{" "}
              bersifat opsional. Nama kolom berbahasa Indonesia seperti
              Judul, Jangkauan, Suka, dan Komentar juga dikenali.
            </p>
          </div>
        </section>

        {/* Ini merupakan footer halaman. */}
        <footer className="upload-footer">
          <span>ONE DASHBOARD</span>
          <span>Instagram Growth Intelligence</span>
        </footer>
      </div>
    </main>
  );
}


// Ini untuk mengambil tipe Metadata dari Next.js.
// Metadata digunakan untuk mengatur judul dan deskripsi website.
import type { Metadata } from "next";

// Ini untuk mengambil font Geist dan Geist Mono dari Google Fonts.
import { Geist, Geist_Mono } from "next/font/google";

// Ini untuk menghubungkan file CSS global ke seluruh aplikasi.
import "./globals.css";

// Ini untuk mengatur font utama website (Geist Sans).
const geistSans = Geist({
  // Ini untuk membuat variabel CSS font Geist Sans.
  variable: "--font-geist-sans",

  // Ini untuk menentukan karakter yang digunakan, yaitu Latin.
  subsets: ["latin"],
});

// Ini untuk mengatur font tambahan (Geist Mono).
const geistMono = Geist_Mono({
  // Ini untuk membuat variabel CSS font Geist Mono.
  variable: "--font-geist-mono",

  // Ini untuk menentukan karakter yang digunakan, yaitu Latin.
  subsets: ["latin"],
});

// Ini untuk mengatur informasi website yang dibaca browser dan mesin pencari.
export const metadata: Metadata = {
  // Ini untuk menentukan judul yang muncul pada tab browser.
  title: "One Dashboard",

  // Ini untuk memberikan deskripsi tentang website.
  description:
    "One Dashboard untuk menganalisis performa dan pertumbuhan konten Instagram.",
};

// Ini untuk membuat layout utama yang membungkus seluruh halaman aplikasi.
// children adalah tempat konten dari page.tsx ditampilkan.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Ini untuk mengembalikan struktur HTML utama website.
  return (
    // Ini untuk membuat elemen HTML paling luar.
    // lang="id" menunjukkan bahasa utama dokumen adalah Indonesia.
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      {/* Ini untuk membuat bagian tubuh halaman website. */}
      <body>
        {/* Ini untuk menampilkan isi halaman, misalnya dashboard dari page.tsx. */}
        {children}
      </body>
    </html>
  );
}

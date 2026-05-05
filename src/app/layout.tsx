import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic, JetBrains_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const display = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const arabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "محور — أمانة المعدّات",
  description:
    "محور (Mihwar) — منصّة فرق التصوير لتسجيل العتاد، تتبّع الحضانة، وتسليم آمن بضغطة زر.",
  applicationName: "Mihwar",
  authors: [{ name: "Mihwar Team" }],
  keywords: ["photography", "equipment", "tracking", "Arabic", "تصوير", "معدّات", "محور"],
  openGraph: {
    title: "محور — أمانة المعدّات",
    description: "تسجيل، تتبّع، وتسليم آمن للعتاد بين فريق التصوير.",
    locale: "ar_SA",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f5f1" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0d" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${display.variable} ${arabic.variable} ${mono.variable} antialiased`}
    >
      <body className="min-h-[100dvh] bg-bg text-fg selection:bg-accent selection:text-accent-fg">
        <ThemeProvider>
          {children}
          <div className="noise-overlay" aria-hidden="true" />
        </ThemeProvider>
      </body>
    </html>
  );
}

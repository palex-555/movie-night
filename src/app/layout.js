iimport "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Movie Night",
  description: "Group movie voting app",
  other: {
    "google-adsense-account": "ca-pub-2425365894930390",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-gray-900 text-white">
        {children}

        <footer className="mt-auto p-4 text-center text-gray-400 text-sm">
          <a href="/privacy" className="underline mr-4">Privacy Policy</a>
          <a href="/terms" className="underline">Terms of Service</a>
        </footer>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "한줄일기 - 매일 한 줄로 기록하는 특별한 일기",
  description:
    "라라와 함께 매일 한 줄로 기록하는 특별한 일기. 감정을 표현하고 성장을 기록해보세요.",
  keywords: "일기, 감정, 기록, 다이어리, 한줄일기, 라라, 감정일기, 성장일기",
  authors: [{ name: "한줄일기" }],
  creator: "한줄일기",
  publisher: "한줄일기",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://only-oneline.vercel.app"),
  alternates: {
    canonical: "/",
  },
  // 카카오톡 공유를 위한 추가 메타데이터
  other: {
    "og:image": "/thumbnail.png",
    "og:image:width": "1200",
    "og:image:height": "630",
    "og:image:type": "image/png",
    "og:image:alt": "한줄일기 썸네일 - 일기를 쓰는 귀여운 캐릭터",
    "twitter:image": "/thumbnail.png",
    "twitter:image:alt": "한줄일기 썸네일 - 일기를 쓰는 귀여운 캐릭터",
  },
  openGraph: {
    title: "한줄일기 - 매일 한 줄로 기록하는 특별한 일기",
    description:
      "라라와 함께 매일 한 줄로 기록하는 특별한 일기. 감정을 표현하고 성장을 기록해보세요.",
    url: "https://only-oneline.vercel.app",
    siteName: "한줄일기",
    images: [
      {
        url: "/thumbnail.png",
        width: 1200,
        height: 630,
        alt: "한줄일기 썸네일 - 일기를 쓰는 귀여운 캐릭터",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "한줄일기 - 매일 한 줄로 기록하는 특별한 일기",
    description:
      "라라와 함께 매일 한 줄로 기록하는 특별한 일기. 감정을 표현하고 성장을 기록해보세요.",
    images: ["/thumbnail.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      {
        url: "/favicon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/favicon.png",
        color: "#8B5CF6",
      },
    ],
  },
  manifest: "/manifest.json",
  category: "lifestyle",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon.png" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

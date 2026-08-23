import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.01yang.space'),
  title: {
    default: '零一扬科技｜从 0 到 1，让智能真正落地',
    template: '%s｜零一扬科技',
  },
  description:
    '福州零一扬网络科技有限公司，提供 AI SaaS、AI 模型 API 聚合与接入、软件开发、网络服务与 AI 教育。',
  keywords: ['AI SaaS', 'AI 模型 API', '软件开发', '网络服务', 'AI 教育', '福州'],
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: '/',
    siteName: '零一扬科技',
    title: '零一扬科技｜从 0 到 1，让智能真正落地',
    description: '让每一个想法，拥有智能生长的力量。',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: '零一扬科技：从 0 到 1，让智能真正落地',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '零一扬科技｜从 0 到 1，让智能真正落地',
    description: '让每一个想法，拥有智能生长的力量。',
    images: ['/og.png'],
  },
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

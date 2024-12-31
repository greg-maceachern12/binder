import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-instrument'
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: "Duotang AI - Learn Anything",
  description: "AI Generated Courses",
  applicationName: "Duotang AI",
  authors: [{ name: "Duotang AI" }],
  generator: "Next.js",
  keywords: ["AI", "Learning", "Education", "AI Lessons"],
  themeColor: '#ffffff', // Add your brand's theme color
  manifest: '/manifest.json',
  icons: {
    apple: [
      { url: '/logo.png' }
    ],
    icon: '/favicon.ico'
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  openGraph: {
    title: 'Duotang AI - Learn Anything',
    description: 'AI Generated Lessons',
    images: ['/logo.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Duotang AI - Learn Anything',
    description: 'AI Generated Lessons',
    images: ['/logo.png'],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${inter.variable}`}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
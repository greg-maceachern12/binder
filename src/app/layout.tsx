import type { Metadata } from "next";
import Script from 'next/script';
import { Instrument_Serif, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';

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
  title: "Primer AI - Learn Anything",
  description: "AI Generated Courses",
  applicationName: "Primer AI",
  authors: [{ name: "Primer AI" }],
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
    title: 'Primer AI - Learn Anything',
    description: 'AI Generated Lessons',
    images: ['/logo.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Primer AI - Learn Anything',
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
      <head>
      <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-5LZJ62FF2T"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-5LZJ62FF2T');
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
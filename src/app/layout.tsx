import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner"
import LandingNavbar from "./components/LandingNavbar";
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "LexControl - Gestión Legal para Abogados",
    template: "%s | LexControl"
  },
  description: "Plataforma integral de gestión legal para abogados y despachos jurídicos. Gestiona casos, clientes, facturación y documentos de forma segura y eficiente.",
  keywords: ["gestión legal", "abogados", "despacho jurídico", "casos legales", "CRM legal", "facturación legal", "LexControl"],
  authors: [{ name: "LexControl" }],
  creator: "LexControl",
  publisher: "LexControl",
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: "https://lexcontrol.com",
    title: "LexControl - Gestión Legal para Abogados",
    description: "Plataforma integral de gestión legal para abogados y despachos jurídicos.",
    siteName: "LexControl",
  },
  twitter: {
    card: "summary_large_image",
    title: "LexControl - Gestión Legal para Abogados",
    description: "Plataforma integral de gestión legal para abogados y despachos jurídicos.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1E4D3D" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster richColors position="top-right" />
        <LandingNavbar />
        {children}
        <Analytics />
      </body>
    </html>
  );
}

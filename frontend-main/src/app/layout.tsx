import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PROFIT — Один бонус. Багато можливостей.",
  description:
    "Екосистема лояльності PROFIT з токенами MD. Накопичуйте бонуси, отримуйте нагороди та відкривайте ексклюзивні пропозиції від партнерів.",
  keywords: ["PROFIT", "лояльність", "бонуси", "MD токени", "cashback"],
  authors: [{ name: "PROFIT Team" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PROFIT",
  },
  openGraph: {
    title: "PROFIT — Один бонус. Багато можливостей.",
    description: "Екосистема лояльності з токенами MD",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#102820",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* PWA icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body>
        {/* Hydration-safe dark/light mode init */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=localStorage.getItem('profit-auth');var t='dark';if(p){var s=JSON.parse(p);if(s&&s.state&&s.state.theme){t=s.state.theme;}}if(t==='light'){document.documentElement.classList.remove('dark');}else{document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
        {children}
      </body>
    </html>
  );
}

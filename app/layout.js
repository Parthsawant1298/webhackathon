import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "SupplyMind - India's First Anonymous B2B Marketplace for Street Food Vendors",
  description: "Revolutionary B2B marketplace connecting 10+ million street food vendors with verified suppliers. Get quality raw materials at 15-20% cost savings with same-day delivery across India.",
  keywords: "B2B marketplace India, street food suppliers, raw materials, food vendors, wholesale marketplace, fresh vegetables, spices, cooking ingredients, food supply chain",
  authors: [{ name: "SupplyMind" }],
  creator: "SupplyMind",
  publisher: "SupplyMind",
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1",
  category: "Business",
  classification: "B2B Marketplace",
  language: "en-IN",
  geo: {
    region: "IN",
    placename: "India"
  },
  other: {
    "theme-color": "#ffffff",
    "application-name": "SupplyMind",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "SupplyMind",
    "format-detection": "telephone=no"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN">
      <head>
        {/* Add your logo here */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo-192.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://webhackathon.vercel.app/" />
        
        {/* Additional SEO meta tags */}
        <meta name="rating" content="general" />
        <meta name="distribution" content="global" />
        <meta name="revisit-after" content="7 days" />
        <meta httpEquiv="content-language" content="en-IN" />
        
        {/* Structured Data for Local Business */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "SupplyMind",
              "description": "India's first anonymous B2B marketplace for street food vendors",
              "url": "https://webhackathon.vercel.app",
              "logo": "https://webhackathon.vercel.app/logo.jpg",
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "availableLanguage": ["Hindi", "English", "Tamil", "Bengali"]
              },
              "areaServed": {
                "@type": "Country",
                "name": "India"
              },
              "serviceType": "B2B Marketplace"
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
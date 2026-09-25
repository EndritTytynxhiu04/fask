import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  icons: {
    icon: { url: '/images/fask-logo.jpg', type: 'image/jpeg', sizes: '417x417' },
    shortcut: '/images/fask-logo.jpg',
  },
  title: { default: 'FASK | Federata e Auto Sportit e Kosovës', template: '%s | FASK' },
  description: 'Garat, klubet, lajmet dhe dokumentet e Federatës së Auto Sportit të Kosovës.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="sq" className="dark">
    <head>
      <link rel="preconnect" href="https://fonts.googleapis.com"/>
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin=""/>
      {/* oxlint-disable-next-line next/no-page-custom-font -- root layout, so the fonts load on every page */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,600;0,700;0,800;1,700;1,800;1,900&family=Inter:wght@400;500;600;700&display=swap"/>
    </head>
    <body>{children}</body>
  </html>;
}

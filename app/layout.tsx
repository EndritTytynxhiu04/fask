import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  icons: { icon: '/favicon.svg' },
  title: { default: 'FASK | Federata e Auto Sportit e Kosovës', template: '%s | FASK' },
  description: 'Garat, klubet, lajmet dhe dokumentet e Federatës së Auto Sportit të Kosovës.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="sq" className="dark"><body>{children}</body></html>;
}

import type { Metadata, Viewport } from 'next';
import '../styles/globals.css';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  title: 'Frame Photo Printer',
  description: 'Capture, frame, and print photos in 15x21 format',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1a1a1a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

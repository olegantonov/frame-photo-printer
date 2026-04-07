import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Frame Photo Printer',
  description: 'Capture, frame, and print photos in 15x21 format',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

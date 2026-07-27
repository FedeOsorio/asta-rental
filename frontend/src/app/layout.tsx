import '../styles/globals.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'A.S.T.A. — Gestión de Alquileres',
  description: 'Plataforma de gestión de alquileres y propiedades inmobiliarias'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0B0F19] text-gray-100 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}

// app/layout.tsx
import './globals.css';
import 'react-quill/dist/quill.snow.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'House Spectrum Ltd | Prody',
  description: 'Project management dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" toastOptions={{ duration: 3000,
          success: {
            style: {
              border:      '1px solid #10B981',
              background:  '#ECFDF3',
              color:       '#047857',
              borderRadius:'50px',
              padding:     '12px 16px',
            },
          },
          error: {
            style: {
              border:      '1px solid #EF4444',
              background:  '#FEF2F2',
              color:       '#B91C1C',
              borderRadius:'50px',
              padding:     '12px 16px',
            },
          },
         }} />
        <script dangerouslySetInnerHTML={{
          __html: `
            // Fix for editor initialization issues
            window.addEventListener('load', function() {
              // Force redraw of editor containers
              setTimeout(function() {
                const containers = document.querySelectorAll('[id^="editorjs-container-"]');
                containers.forEach(function(container) {
                  const display = container.style.display;
                  container.style.display = 'none';
                  setTimeout(function() { container.style.display = display; }, 10);
                });
              }, 200);
            });
          `
        }} />
      </body>
    </html>
  );
}
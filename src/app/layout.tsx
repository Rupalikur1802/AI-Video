import type {Metadata} from 'next';
import './globals.css';
import './bloom.css';
import './studio.css';
import './workspace.css';

export const metadata: Metadata = {
  title: 'Bloom — Innovating the spirit of AI floral design',
  description: 'An AI-powered plant and floral design platform. Craft intricate botanical forms with liquid glass aesthetics.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}

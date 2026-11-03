import type {Metadata} from 'next';
import './globals.css';
import './studio.css';

export const metadata: Metadata = {
  title: 'Sochitra — Your imagination. Set in motion.',
  description: 'Turn ideas into expressive videos with animated visuals, natural narration, and synchronized captions.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}

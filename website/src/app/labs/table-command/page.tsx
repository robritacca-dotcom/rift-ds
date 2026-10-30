import LazyTable from './LazyTable';

export const metadata = {
  title: 'Labs: table command',
  description: 'A test bench for the table toolbar AI command, over a large fictional order ledger.',
  // Noindex by design: a labs test page, outside the nav, sitemap and corpus.
  robots: { index: false, follow: false },
};

export default function TableCommandPage() {
  return <LazyTable />;
}

import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'EventCraft | Celebration & Event Planner',
  description:
    'Plan a wedding, birthday or community event with deterministic budget, timeline, and Google PAIR copilot.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

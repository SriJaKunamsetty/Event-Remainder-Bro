import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'EventCraft | Celebration and event planner',
  description:
    'Plan a wedding, birthday or community event with a budget, timeline and vendor checklist that fit your situation.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

'use client';

import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import { Analytics } from "@vercel/analytics/react"

const HtmlEditor = dynamic(
  () => import('@/components/HtmlEditor'),
  { ssr: false }
);

export default function HtmlPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 overflow-auto pt-[75px]">
        <main className="min-h-0">
          <HtmlEditor />
          <Analytics/>
        </main>
      </div>
    </div>
  );
} 
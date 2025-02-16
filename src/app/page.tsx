'use client';
import { Analytics } from "@vercel/analytics/react"
import Header from '@/components/Header';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 overflow-auto pt-[75px]">
        <main className="container mx-auto p-4 min-h-[calc(100vh-75px)]">
          <Analytics/>
        </main>
      </div>
    </div>
  );
}
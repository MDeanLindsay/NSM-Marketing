'use client';
import { Analytics } from "@vercel/analytics/react"
import UTMGenerator from '@/components/utmGenerator';
import Header from '@/components/Header';

export default function UTMsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 overflow-auto pt-[75px]">
        <main className="container mx-auto p-4 min-h-[calc(100vh-75px)] flex items-start justify-center">
          <div className="w-full max-w-[1500px]">
            <UTMGenerator />
          </div>
          <Analytics/>
        </main>
      </div>
    </div>
  );
} 
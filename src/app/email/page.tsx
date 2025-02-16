'use client';
import { Analytics } from "@vercel/analytics/react"
import EmailEditor from '@/components/EmailEditor';
import Header from '@/components/Header';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 overflow-auto pt-[75px]">
        <main className="min-h-0">
          <EmailEditor />
          <Analytics/>
        </main>
      </div>
    </div>
  );
}
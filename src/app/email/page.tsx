'use client';
import Header from '@/components/Header';
import EmailEditor from '@/components/EmailEditor';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 overflow-auto pt-[75px]">
        <main className="min-h-0">
          <EmailEditor />
        </main>
      </div>
    </div>
  );
}
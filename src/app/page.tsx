'use client';
import { Analytics } from "@vercel/analytics/react"
import Header from '@/components/Header';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 overflow-auto pt-[75px]">
        <main className="container mx-auto p-4 min-h-[calc(100vh-75px)] flex flex-col items-center justify-center">
          <div className="rounded-full p-4 w-[550px] flex items-center justify-center">
            <img 
              src="/images/employee.png" 
              alt="Employee illustration" 
              className="w-full h-full object-contain"
            />
          </div>
          <Analytics/>
        </main>
      </div>
    </div>
  );
}
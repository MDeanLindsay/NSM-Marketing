'use client';
import { Analytics } from "@vercel/analytics/react"
import Header from '@/components/Header';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 overflow-auto pt-[75px]">
        <main className="container mx-auto p-4 min-h-[calc(100vh-75px)] flex flex-col items-center justify-center">
          <div className="rounded-full p-4 w-[550px] h-[550px] relative flex items-center justify-center">
            <Image 
              src="/images/employee.png" 
              alt="Employee illustration" 
              fill
              className="object-contain"
              priority
            />
          </div>
          <p className="text-gray-600 text-xl font-nsm mt-4">
            Click a tool from the header to begin!
          </p>
          <Analytics/>
        </main>
      </div>
    </div>
  );
}
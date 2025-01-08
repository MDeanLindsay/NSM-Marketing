'use client';
import Image from 'next/image'
import Link from 'next/link'
import { Analytics } from "@vercel/analytics/react"
import UTMGenerator from '@/components/utmGenerator';

export default function Home() {
  return (
    <div className="min-h-screen relative">
      <header className="h-[100px] fixed top-0 left-0 right-0 flex items-center border-b bg-gray-100 z-10">
        <div className="flex items-center pl-[80px]">
          <Image
            src="/images/logo.svg"
            alt="Logo"
            width={50}
            height={55}
            style={{ width: 'auto', height: '55px' }}
            priority
          />
          <nav className="flex gap-8 ml-12">
            <Link href="/" className="text-gray-600 hover:text-gray-900 text-xl font-nsm">UTM Builder</Link>
            <Link href="/email" className="text-gray-600 hover:text-gray-900 text-xl font-nsm">Email Builder</Link>
          </nav>
        </div>
      </header>
      <main className="pt-[100px] flex flex-col items-center justify-center min-h-screen">
        <UTMGenerator />
        <Analytics/>
      </main>
    </div>
  );
}
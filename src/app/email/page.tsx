'use client';
import Image from 'next/image'
import Link from 'next/link'
import { Analytics } from "@vercel/analytics/react"
import EmailEditor from '@/components/EmailEditor';

export default function Home() {
  return (
    <div className="min-h-screen relative">
      <header className="h-[100px] fixed top-0 left-0 right-0 flex items-center border-b bg-gray-100 z-10">
        <div className="flex items-center pl-[150px]">
          <Image
            src="/images/logo.svg"
            alt="Logo"
            width={50}
            height={55}
            style={{ width: 'auto', height: '55px' }}
            priority
          />
          <nav className="flex gap-8 ml-12">
            <Link href="/" className="text-gray-600 hover:text-gray-900 text-xl">UTM Builder</Link>
            <Link href="/email" className="text-gray-600 hover:text-gray-900 text-xl">Email Builder</Link>
          </nav>
        </div>
      </header>
      <main className="min-h-0 pt-[100px]">
        <EmailEditor />
        <Analytics/>
      </main>
    </div>
  );
}
'use client';
import Image from 'next/image'
import Link from 'next/link'

export default function Header() {
  return (
    <header className="h-[75px] fixed top-0 left-0 right-0 flex items-center border-b bg-gray-100 z-50">
      <div className="flex items-center pl-[80px]">
        <Link href="/">
          <Image
            src="/images/logo.svg"
            alt="Logo"
            width={40}
            height={45}
            style={{ width: 'auto', height: '45px' }}
            priority
          />
        </Link>
        <nav className="flex gap-8 ml-12">
          <Link href="/utms" className="text-gray-600 hover:text-gray-900 text-xl font-nsm h-[75px] flex items-center">UTM Builder</Link>
          <Link href="/html" className="text-gray-600 hover:text-gray-900 text-xl font-nsm h-[75px] flex items-center">UTM Appender</Link>
          <div className="relative group">
            <div className="text-gray-600 hover:text-gray-900 text-xl font-nsm cursor-pointer h-[75px] flex items-center">
              Email Builder
            </div>
            <div className="hidden group-hover:block absolute left-0 top-[75px] min-w-[140px] bg-gray-100 border-b shadow-sm">
              <div>
                <Link
                  href="/email?template=offer"
                  className="block px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-200 text-xl font-nsm whitespace-nowrap"
                >
                  NR
                </Link>
                <Link
                  href="/email?template=sse"
                  className="block px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-200 text-xl font-nsm whitespace-nowrap"
                >
                  SSE
                </Link>
                <Link
                  href="/email?template=wfe"
                  className="block px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-200 text-xl font-nsm whitespace-nowrap"
                >
                  WFE
                </Link>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
} 
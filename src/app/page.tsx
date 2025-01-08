// app/page.tsx
'use client';  // This is needed since we're using state in our component
import { Analytics } from "@vercel/analytics/react"
import UTMGenerator from '../components/utmGenerator';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat bg-[#cbdb09] bg-blend-overlay" >
     <UTMGenerator />
     <Analytics/>
    </main>
  );
}
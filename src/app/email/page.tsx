'use client';
import { Analytics } from "@vercel/analytics/react"
import EmailEditor from '@/components/EmailEditor';

export default function EmailPage() {
  return (
    <main className="min-h-screen">
      <EmailEditor />
      <Analytics/>
    </main>
  );
}
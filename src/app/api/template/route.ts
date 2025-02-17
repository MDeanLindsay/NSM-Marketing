import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const template = searchParams.get('template') || 'offer';

  let filePath;
  switch (template) {
    case 'wfe':
      filePath = path.join(process.cwd(), 'public/templates/wfe.html');
      break;
    case 'sse':
      filePath = path.join(process.cwd(), 'public/templates/sse.html');
      break;
    default:
      filePath = path.join(process.cwd(), 'public/templates/offer.html');
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return new Response(JSON.stringify({ content }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to read template' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
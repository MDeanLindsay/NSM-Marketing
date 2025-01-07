import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const templatePath = path.join(process.cwd(), 'public', 'templates', 'template.html');
    const template = await fs.readFile(templatePath, 'utf8');
    return NextResponse.json({ content: template });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Template loading error:', error);
      return NextResponse.json({ error: `Failed to load template: ${error.message}` }, { status: 500 });
    }
    // Handle case where error is not an Error object
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}
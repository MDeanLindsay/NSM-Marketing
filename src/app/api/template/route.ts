import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const template = searchParams.get('template') || 'offer';
    
    const templatePath = path.join(
      process.cwd(), 
      'public', 
      'templates', 
      `${template}.html`
    );
    
    const templateContent = await fs.readFile(templatePath, 'utf8');
    return NextResponse.json({ content: templateContent });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Template loading error:', error);
      return NextResponse.json(
        { error: `Failed to load template: ${error.message}` }, 
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'An unknown error occurred' }, 
      { status: 500 }
    );
  }
}
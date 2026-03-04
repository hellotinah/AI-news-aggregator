import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    const dataPath = join(process.cwd(), '..', 'data', 'news.json');
    const fileContents = await readFile(dataPath, 'utf8');
    const data = JSON.parse(fileContents);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading news data:', error);
    return NextResponse.json(
      { error: 'Failed to load news data', last_updated: new Date().toISOString(), articles: [] },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';

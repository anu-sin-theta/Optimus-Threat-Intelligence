import { NextResponse } from 'next/server';
import { NewsAPIClient } from '@/lib/api-client/news';

export async function GET(request: Request) {
  if (!process.env.NEWS_API_KEY) {
    return NextResponse.json({ error: 'News API key not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'all';
  const country = searchParams.get('country') || 'us';

  const client = new NewsAPIClient(process.env.NEWS_API_KEY);

  try {
    const data = type === 'headlines'
      ? await client.getTopSecurityHeadlines(country)
      : await client.getSecurityNews();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json({ error: 'Failed to fetch news data' }, { status: 500 });
  }
}

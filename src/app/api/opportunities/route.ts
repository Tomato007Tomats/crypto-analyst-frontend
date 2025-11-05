import { NextResponse } from 'next/server';

const LANGSMITH_API_URL = process.env.LANGSMITH_API_URL;
const LANGSMITH_API_KEY = process.env.LANGSMITH_API_KEY;
const STORE_NAMESPACE = ['opportunities'];

interface StoreSearchResponse {
  items?: Array<{
    namespace: string[];
    key: string;
    value: Record<string, unknown>;
  }>;
}

async function storeSearch(): Promise<Record<string, unknown>[]> {
  if (!LANGSMITH_API_URL || !LANGSMITH_API_KEY) {
    throw new Error('Missing LangSmith configuration');
  }

  const apiUrl = LANGSMITH_API_URL;
  const apiKey = LANGSMITH_API_KEY;

  const response = await fetch(`${apiUrl}/store/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    },
    body: JSON.stringify({
      namespace: STORE_NAMESPACE,
      limit: 500,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LangGraph store search failed: ${errorText}`);
  }

  const payload = (await response.json()) as StoreSearchResponse;
  const items = payload.items ?? [];

  return items
    .filter((item) => Array.isArray(item.namespace) && item.namespace.join() === STORE_NAMESPACE.join())
    .map((item) => ({ ...item.value, id: item.key }));
}

export async function GET() {
  try {
    const opportunities = await storeSearch();

    opportunities.sort((a, b) => {
      const createdA = typeof a.created_at === 'string' ? a.created_at : '';
      const createdB = typeof b.created_at === 'string' ? b.created_at : '';
      return createdA.localeCompare(createdB);
    });

    return NextResponse.json({ opportunities });
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch opportunities' },
      { status: 500 }
    );
  }
}


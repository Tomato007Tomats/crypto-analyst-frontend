import { NextResponse } from 'next/server';

const LANGSMITH_API_URL = process.env.LANGSMITH_API_URL;
const LANGSMITH_API_KEY = process.env.LANGSMITH_API_KEY;

export async function GET() {
  try {
    if (!LANGSMITH_API_URL || !LANGSMITH_API_KEY) {
      console.error('Missing LangSmith configuration');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Call the opportunities list endpoint
    const response = await fetch(`${LANGSMITH_API_URL}/runs/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': LANGSMITH_API_KEY,
      },
      body: JSON.stringify({
        assistant_id: 'crypto_analyst_agent',
        input: {
          messages: [
            {
              role: 'user',
              content: 'List all current opportunities',
            },
          ],
        },
        stream_mode: 'values',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LangSmith API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch opportunities' },
        { status: response.status }
      );
    }

    // For now, return empty list (opportunities will be managed via chat)
    // In a real implementation, you'd parse the agent response
    return NextResponse.json({ opportunities: [] });
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


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
        assistant_id: 'crypto_analyst',
        input: {
          messages: [
            {
              role: 'human',
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

    // Parse the response to extract opportunities
    const reader = response.body?.getReader();
    if (!reader) {
      return NextResponse.json({ opportunities: [] });
    }

    let opportunities: any[] = [];
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              // Buscar opportunities no state
              if (data && data.opportunities && Array.isArray(data.opportunities)) {
                opportunities = data.opportunities;
              }
            } catch (e) {
              // Ignorar erros de parsing
            }
          }
        }
      }
    } catch (error) {
      console.error('Error parsing opportunities stream:', error);
    }

    return NextResponse.json({ opportunities });
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


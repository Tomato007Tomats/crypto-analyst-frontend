import { NextRequest, NextResponse } from 'next/server';

const LANGSMITH_API_URL = process.env.LANGSMITH_API_URL;
const LANGSMITH_API_KEY = process.env.LANGSMITH_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!LANGSMITH_API_URL || !LANGSMITH_API_KEY) {
      console.error('Missing LangSmith configuration');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Call LangSmith API - stateless run
    const response = await fetch(`${LANGSMITH_API_URL}/runs/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': LANGSMITH_API_KEY,
      },
      body: JSON.stringify({
        assistant_id: 'crypto_analyst',  // Nome do graph conforme registrado no LangSmith
        input: {
          messages: [
            {
              role: 'human',
              content: message,
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
        { error: 'Failed to get response from agent' },
        { status: response.status }
      );
    }

    // Parse the streaming response
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    let fullResponse = '';
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            
            // Extract the last assistant message from the state
            if (data.messages && Array.isArray(data.messages)) {
              const lastMessage = data.messages[data.messages.length - 1];
              if (lastMessage && lastMessage.role === 'assistant') {
                fullResponse = lastMessage.content;
              }
            }
          } catch (e) {
            // Ignore parse errors for non-JSON lines
          }
        }
      }
    }

    return NextResponse.json({ response: fullResponse || 'No response received' });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


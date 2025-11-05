import { NextResponse } from 'next/server';

const LANGSMITH_API_URL = process.env.LANGSMITH_API_URL;
const LANGSMITH_API_KEY = process.env.LANGSMITH_API_KEY;
const STORE_NAMESPACE = ['opportunities'];

function ensureConfig(): { apiUrl: string; apiKey: string } {
  if (!LANGSMITH_API_URL || !LANGSMITH_API_KEY) {
    throw new Error('Missing LangSmith configuration');
  }
  return { apiUrl: LANGSMITH_API_URL, apiKey: LANGSMITH_API_KEY };
}

async function storeGet(id: string) {
  const { apiUrl, apiKey } = ensureConfig();

  const response = await fetch(`${apiUrl}/store/get`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    },
    body: JSON.stringify({
      namespace: STORE_NAMESPACE,
      key: id,
    }),
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LangGraph store get failed: ${errorText}`);
  }

  const payload = await response.json();
  return payload?.item ?? null;
}

async function storePut(id: string, value: Record<string, unknown>) {
  const { apiUrl, apiKey } = ensureConfig();

  const response = await fetch(`${apiUrl}/store/put`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    },
    body: JSON.stringify({
      namespace: STORE_NAMESPACE,
      key: id,
      value,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LangGraph store put failed: ${errorText}`);
  }
}

async function storeDelete(id: string) {
  const { apiUrl, apiKey } = ensureConfig();

  const response = await fetch(`${apiUrl}/store/delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    },
    body: JSON.stringify({
      namespace: STORE_NAMESPACE,
      key: id,
    }),
  });

  if (response.status === 404) {
    return false;
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LangGraph store delete failed: ${errorText}`);
  }

  return true;
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const updates: Record<string, unknown> = body?.updates ?? {};

    if (!id) {
      return NextResponse.json({ error: 'Missing opportunity id' }, { status: 400 });
    }

    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    const existing = await storeGet(id);
    if (!existing) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    const merged = {
      ...existing.value,
      ...updates,
      updated_at: new Date().toISOString(),
    } as Record<string, unknown>;

    await storePut(id, merged);

    return NextResponse.json({ opportunity: { ...merged, id } });
  } catch (error) {
    console.error('Error updating opportunity:', error);
    return NextResponse.json({ error: 'Failed to update opportunity' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Missing opportunity id' }, { status: 400 });
    }

    const success = await storeDelete(id);
    if (!success) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error deleting opportunity:', error);
    return NextResponse.json({ error: 'Failed to delete opportunity' }, { status: 500 });
  }
}

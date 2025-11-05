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

    // NOTA: As oportunidades estão sendo salvas no state do agente (OpportunitiesStore in-memory)
    // mas o state é thread-specific no LangSmith. 
    // 
    // Para uma implementação completa, precisamos:
    // 1. Usar o LangGraph Store API (cross-thread persistence)
    // 2. Ou fazer o agente salvar em um banco de dados externo
    //
    // Por enquanto, retornamos um array vazio e as oportunidades são gerenciadas via chat.
    // O agente adiciona oportunidades quando você pede, mas elas ficam no contexto da conversa.

    console.log('Opportunities endpoint called - returning empty array (opportunities are chat-managed)');
    
    return NextResponse.json({ 
      opportunities: [],
      _note: 'Opportunities are managed through the chat interface. Ask the agent to create opportunities and they will be stored in the conversation context.'
    });
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


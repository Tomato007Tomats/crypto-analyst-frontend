'use client';

import { useState } from 'react';
import OpportunitiesTab from '@/components/OpportunitiesTab';
import ChatTab from '@/components/ChatTab';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'opportunities' | 'chat'>('opportunities');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🚀 Crypto Analyst Agent
          </h1>
          <p className="text-gray-300">
            AI-powered cryptocurrency analysis with real-time opportunities tracking
          </p>
        </header>

        {/* Tabs */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-xl">
          <div className="border-b border-slate-700">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('opportunities')}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === 'opportunities'
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                  }
                `}
              >
                📊 Opportunities
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === 'chat'
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                  }
                `}
              >
                💬 Chat with Agent
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'opportunities' && <OpportunitiesTab />}
            {activeTab === 'chat' && <ChatTab />}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-gray-400 text-sm">
          <p>Powered by Deep Agents • CoinGecko • Firecrawl • Santiment</p>
        </footer>
      </div>
    </div>
  );
}


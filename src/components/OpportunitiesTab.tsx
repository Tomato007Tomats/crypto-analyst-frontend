'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { TrendingUp, TrendingDown, Eye, DollarSign, RefreshCw, Plus, X } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Opportunity {
  id: string;
  title: string;
  asset: string;
  type: 'buy' | 'sell' | 'hold' | 'watch';
  confidence: number;
  rationale: string;
  sources: string[];
  metrics: Record<string, any>;
  created_at: string;
  expires_at?: string;
  status: string;
  tags: string[];
}

export default function OpportunitiesTab() {
  const { data, error, mutate } = useSWR(`${API_URL}/api/opportunities`, fetcher, {
    refreshInterval: 5000, // Refresh every 5 seconds
  });

  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">❌ Error loading opportunities</p>
        <p className="text-gray-400 text-sm mt-2">{error.message}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
        <p className="text-gray-400">Loading opportunities...</p>
      </div>
    );
  }

  const opportunities: Opportunity[] = data.opportunities || [];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'buy':
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'sell':
        return <TrendingDown className="w-5 h-5 text-red-400" />;
      case 'watch':
        return <Eye className="w-5 h-5 text-blue-400" />;
      default:
        return <DollarSign className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'buy':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'sell':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'watch':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-400';
    if (confidence >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this opportunity?')) return;

    try {
      const response = await fetch(`${API_URL}/api/opportunities/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        mutate(); // Refresh the list
        setSelectedOpp(null);
      }
    } catch (error) {
      console.error('Error deleting opportunity:', error);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`${API_URL}/api/opportunities/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: { status: newStatus } }),
      });

      if (response.ok) {
        mutate(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating opportunity:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Investment Opportunities</h2>
          <p className="text-gray-400 text-sm mt-1">
            {opportunities.length} opportunities • Updated in real-time
          </p>
        </div>
        <button
          onClick={() => mutate()}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Opportunities Grid */}
      {opportunities.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/30 rounded-lg border border-slate-700">
          <p className="text-gray-400">No opportunities yet</p>
          <p className="text-gray-500 text-sm mt-2">
            Ask the agent to analyze the market to find opportunities
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              onClick={() => setSelectedOpp(opp)}
              className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:border-purple-500/50 transition-all cursor-pointer group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getTypeIcon(opp.type)}
                  <span className={`text-xs px-2 py-1 rounded border ${getTypeColor(opp.type)}`}>
                    {opp.type.toUpperCase()}
                  </span>
                </div>
                <span className={`text-lg font-bold ${getConfidenceColor(opp.confidence)}`}>
                  {opp.confidence}%
                </span>
              </div>

              {/* Title & Asset */}
              <h3 className="text-white font-semibold mb-1 group-hover:text-purple-400 transition-colors">
                {opp.title}
              </h3>
              <p className="text-gray-400 text-sm mb-3">
                {opp.asset.toUpperCase()}
              </p>

              {/* Rationale Preview */}
              <p className="text-gray-300 text-sm line-clamp-2 mb-3">
                {opp.rationale}
              </p>

              {/* Tags */}
              {opp.tags && opp.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {opp.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 bg-slate-700/50 text-gray-300 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                <span className="text-xs text-gray-500">
                  {new Date(opp.created_at).toLocaleDateString()}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${
                  opp.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {opp.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedOpp && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedOpp(null)}
        >
          <div
            className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 border-b border-slate-700">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getTypeIcon(selectedOpp.type)}
                  <h2 className="text-2xl font-bold text-white">{selectedOpp.title}</h2>
                </div>
                <p className="text-gray-400">{selectedOpp.asset.toUpperCase()}</p>
              </div>
              <button
                onClick={() => setSelectedOpp(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Confidence & Type */}
              <div className="flex gap-4">
                <div className="flex-1 bg-slate-700/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Confidence Level</p>
                  <p className={`text-3xl font-bold ${getConfidenceColor(selectedOpp.confidence)}`}>
                    {selectedOpp.confidence}%
                  </p>
                </div>
                <div className="flex-1 bg-slate-700/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Type</p>
                  <div className="flex items-center gap-2 mt-2">
                    {getTypeIcon(selectedOpp.type)}
                    <span className="text-xl font-semibold text-white">
                      {selectedOpp.type.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rationale */}
              <div>
                <h3 className="text-white font-semibold mb-2">Analysis</h3>
                <p className="text-gray-300 leading-relaxed">{selectedOpp.rationale}</p>
              </div>

              {/* Sources */}
              {selectedOpp.sources && selectedOpp.sources.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-2">Data Sources</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedOpp.sources.map((source) => (
                      <span
                        key={source}
                        className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm"
                      >
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Metrics */}
              {selectedOpp.metrics && Object.keys(selectedOpp.metrics).length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-2">Key Metrics</h3>
                  <div className="bg-slate-700/30 rounded-lg p-4 space-y-2">
                    {Object.entries(selectedOpp.metrics).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-400">{key}:</span>
                        <span className="text-white font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {selectedOpp.tags && selectedOpp.tags.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedOpp.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-slate-700 text-gray-300 rounded text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-700">
                <button
                  onClick={() => handleUpdateStatus(selectedOpp.id, 'executed')}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Mark as Executed
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedOpp.id, 'dismissed')}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => handleDelete(selectedOpp.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// src/components/memoir/MemoirTrackChanges.tsx

'use client';

import { useState } from 'react';
import { TrackChange } from './types/memoir';

interface MemoirTrackChangesProps {
  changes: TrackChange[];
  onAccept: (changeId: string) => void;
  onReject: (changeId: string) => void;
}

export default function MemoirTrackChanges({
  changes,
  onAccept,
  onReject,
}: MemoirTrackChangesProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all');

  const filteredChanges = changes.filter(change => {
    if (filter === 'pending') return !change.resolved;
    if (filter === 'resolved') return change.resolved;
    return true;
  });

  const getChangeLabel = (type: string) => {
    switch (type) {
      case 'insert':
        return '➕ Insertion';
      case 'delete':
        return '➖ Suppression';
      case 'format':
        return '✏️ Formatage';
      default:
        return type;
    }
  };

  const getChangeColor = (type: string) => {
    switch (type) {
      case 'insert':
        return 'bg-green-50 border-green-200';
      case 'delete':
        return 'bg-red-50 border-red-200';
      case 'format':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (changes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Aucune modification enregistrée</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 text-xs font-medium rounded ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Tout ({changes.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-3 py-1 text-xs font-medium rounded ${
            filter === 'pending'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          En attente ({changes.filter(c => !c.resolved).length})
        </button>
        <button
          onClick={() => setFilter('resolved')}
          className={`px-3 py-1 text-xs font-medium rounded ${
            filter === 'resolved'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Résolues ({changes.filter(c => c.resolved).length})
        </button>
      </div>

      {/* Changes List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredChanges.map(change => (
          <div
            key={change.id}
            className={`border rounded-lg p-4 ${getChangeColor(change.type)}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="font-semibold text-gray-900">
                  {getChangeLabel(change.type)}
                </span>
                {change.resolved && (
                  <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    Résolue
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500">
                {new Date(change.timestamp).toLocaleDateString('fr-FR')} à{' '}
                {new Date(change.timestamp).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            <div className="mb-2">
              <p className="text-sm text-gray-700 font-mono bg-white bg-opacity-50 p-2 rounded">
                {change.content}
              </p>
            </div>

            {change.author && (
              <p className="text-xs text-gray-600 mb-3">
                Auteur: <span className="font-semibold">{change.author}</span>
              </p>
            )}

            {!change.resolved && (
              <div className="flex gap-2">
                <button
                  onClick={() => onAccept(change.id)}
                  className="flex-1 px-3 py-2 text-xs font-medium bg-green-600 hover:bg-green-700 text-white rounded transition"
                >
                  ✓ Accepter
                </button>
                <button
                  onClick={() => onReject(change.id)}
                  className="flex-1 px-3 py-2 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded transition"
                >
                  ✗ Rejeter
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
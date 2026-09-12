// src/components/memoir/MemoirTableOfContents.tsx

'use client';

import { useState, useEffect } from 'react';
import { X, BookOpen } from 'lucide-react';
import { TableOfContentsEntry } from './types/memoir';

interface MemoirTableOfContentsProps {
  content: string;
  onClose: () => void;
}

export default function MemoirTableOfContents({
  content,
  onClose,
}: MemoirTableOfContentsProps) {
  const [entries, setEntries] = useState<TableOfContentsEntry[]>([]);

  useEffect(() => {
    // Parser le HTML pour extraire les titres
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headings = doc.querySelectorAll('h1, h2, h3, h4');

    const toc: TableOfContentsEntry[] = [];
    headings.forEach((heading, idx) => {
      const level = parseInt(heading.tagName.substring(1));
      toc.push({
        id: `heading-${idx}`,
        title: heading.textContent || '',
        level,
        position: idx,
      });
    });

    setEntries(toc);
  }, [content]);

  const handleClick = (entryId: string) => {
    // Scroll vers le titre
    const element = document.getElementById(entryId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const exportTOC = () => {
    const tocText = entries
      .map(entry => {
        const indent = '  '.repeat(entry.level - 1);
        return `${indent}${entry.title}`;
      })
      .join('\n');

    const blob = new Blob([tocText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'table-des-matieres.txt';
    a.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Table des Matières</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {entries.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">Aucun titre détecté</p>
              <p className="text-sm mt-1">Ajoutez des titres (H1-H4) pour générer une table des matières</p>
            </div>
          ) : (
            <div className="space-y-2">
              {entries.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => handleClick(entry.id)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 rounded-lg transition border border-transparent hover:border-blue-200 group"
                  style={{ paddingLeft: `${1 + (entry.level - 1) * 1.5}rem` }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900 group-hover:text-blue-600 font-medium">
                      {entry.title || '(Titre vide)'}
                    </span>
                    <span className="text-xs bg-gray-100 group-hover:bg-blue-100 text-gray-600 group-hover:text-blue-600 px-2 py-1 rounded">
                      H{entry.level}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Niveau {entry.level}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {entries.length > 0 && (
          <div className="bg-gray-50 border-t border-gray-200 p-6 flex justify-between gap-3">
            <button
              onClick={exportTOC}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition"
            >
              📥 Exporter en TXT
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
            >
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
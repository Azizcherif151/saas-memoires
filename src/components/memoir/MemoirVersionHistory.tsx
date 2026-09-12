// src/components/memoir/MemoirVersionHistory.tsx

'use client';

import { useState } from 'react';
import { X, RotateCcw, Trash2 } from 'lucide-react';
import { MemoirVersion } from './types/memoir';

interface MemoirVersionHistoryProps {
  versions: MemoirVersion[];
  onClose: () => void;
  onRestore: (versionId: string) => void;
}

export default function MemoirVersionHistory({
  versions,
  onClose,
  onRestore,
}: MemoirVersionHistoryProps) {
  const [selectedVersion, setSelectedVersion] = useState<string | null>(
    versions.length > 0 ? versions[0].id : null
  );
  const [isRestoring, setIsRestoring] = useState(false);

  const handleRestore = async () => {
    if (!selectedVersion) return;
    setIsRestoring(true);
    onRestore(selectedVersion);
    setIsRestoring(false);
  };

  const currentVersion = versions.find(v => v.id === selectedVersion);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Historique des Versions</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Versions List */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Versions</h3>
            <div className="space-y-2 border border-gray-200 rounded-lg overflow-hidden">
              {versions.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Aucune version enregistrée
                </div>
              ) : (
                versions.map((version, idx) => (
                  <button
                    key={version.id}
                    onClick={() => setSelectedVersion(version.id)}
                    className={`w-full text-left px-4 py-3 border-b last:border-b-0 transition ${
                      selectedVersion === version.id
                        ? 'bg-blue-50 border-l-4 border-l-blue-600'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900 text-sm">
                          Version {version.version}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(version.createdAt).toLocaleDateString('fr-FR')}{' '}
                          {new Date(version.createdAt).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                        {version.changeDescription && (
                          <div className="text-xs text-gray-600 mt-1 italic">
                            {version.changeDescription}
                          </div>
                        )}
                      </div>
                      {idx === 0 && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                          Actuelle
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Preview & Actions */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Aperçu</h3>
            {currentVersion ? (
              <div className="space-y-4">
                {/* Preview */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 max-h-48 overflow-y-auto">
                  <div
                    className="prose prose-sm max-w-none text-sm text-gray-700"
                    dangerouslySetInnerHTML={{
                      __html: currentVersion.content.substring(0, 500) + '...',
                    }}
                  />
                </div>

                {/* Metadata */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                  <div>
                    <span className="text-xs font-semibold text-gray-600">Version</span>
                    <p className="text-sm text-gray-900">{currentVersion.version}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-600">Date</span>
                    <p className="text-sm text-gray-900">
                      {new Date(currentVersion.createdAt).toLocaleDateString('fr-FR')} à{' '}
                      {new Date(currentVersion.createdAt).toLocaleTimeString('fr-FR')}
                    </p>
                  </div>
                  {currentVersion.createdBy && (
                    <div>
                      <span className="text-xs font-semibold text-gray-600">Créée par</span>
                      <p className="text-sm text-gray-900">{currentVersion.createdBy}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {versions[0].id !== currentVersion.id && (
                  <button
                    onClick={handleRestore}
                    disabled={isRestoring}
                    className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition flex items-center justify-center gap-2 ${
                      isRestoring
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <RotateCcw className="w-4 h-4" />
                    {isRestoring ? 'Restauration...' : 'Restaurer cette version'}
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Sélectionnez une version pour voir l'aperçu
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
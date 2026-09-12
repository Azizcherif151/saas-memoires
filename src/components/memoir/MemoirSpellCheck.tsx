// src/components/memoir/MemoirSpellCheck.tsx

'use client';

import { useState } from 'react';
import { X, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { Editor } from '@tiptap/react';
import { SpellCheckResult, SpellCheckWord } from './types/memoir';

interface MemoirSpellCheckProps {
  content: string;
  editor: Editor;
  onClose: () => void;
}

export default function MemoirSpellCheck({
  content,
  editor,
  onClose,
}: MemoirSpellCheckProps) {
  const [errors, setErrors] = useState<any[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [selectedError, setSelectedError] = useState<any | null>(null);
  const [checkComplete, setCheckComplete] = useState(false);

  const handleCheck = async () => {
    setIsChecking(true);
    try {
      // Supprimer les balises HTML
      const plainText = content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');

      // Utiliser LanguageTool API (gratuit, open-source)
      const response = await fetch('https://api.languagetool.org/v2/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          text: plainText,
          language: 'fr',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setErrors(data.matches || []);
        setCheckComplete(true);
        if (data.matches && data.matches.length > 0) {
          setSelectedError(data.matches[0]);
        }
      }
    } catch (error) {
      console.error('Erreur vérification orthographe:', error);
      alert('Erreur lors de la vérification. Vérifiez votre connexion.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleApplySuggestion = (suggestion: string) => {
    if (!selectedError || !editor) return;

    const plainText = content.replace(/<[^>]*>/g, '');
    const before = plainText.substring(0, selectedError.offset);
    const after = plainText.substring(selectedError.offset + selectedError.length);
    const correctedText = before + suggestion + after;

    // Appliquer la correction dans l'éditeur
    editor.commands.setContent(correctedText);

    // Passer à l'erreur suivante
    const errorIndex = errors.indexOf(selectedError);
    if (errorIndex < errors.length - 1) {
      setSelectedError(errors[errorIndex + 1]);
    } else {
      setSelectedError(null);
    }
  };

  const handleIgnore = () => {
    const errorIndex = errors.indexOf(selectedError);
    const newErrors = errors.filter((_, idx) => idx !== errorIndex);
    setErrors(newErrors);

    if (errorIndex < newErrors.length) {
      setSelectedError(newErrors[errorIndex]);
    } else {
      setSelectedError(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Vérification Orthographe & Grammaire</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {!checkComplete ? (
            <div className="text-center py-8">
              <button
                onClick={handleCheck}
                disabled={isChecking}
                className={`px-6 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 mx-auto ${
                  isChecking
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isChecking ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Vérification en cours...
                  </>
                ) : (
                  '🔍 Démarrer la vérification'
                )}
              </button>
            </div>
          ) : errors.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">Parfait!</h3>
                <p className="text-gray-600 text-sm">Aucune erreur détectée.</p>
              </div>
            </div>
          ) : selectedError ? (
            <div className="space-y-4">
              {/* Error Info */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900">{selectedError.message}</h3>
                    <p className="text-sm text-red-700 mt-1">
                      Erreur: <span className="font-mono bg-red-100 px-2 py-1 rounded">{selectedError.ruleId}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Context */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <span>Contexte: </span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                    ...{content.substring(Math.max(0, selectedError.offset - 20), selectedError.offset + selectedError.length + 20)}...
                  </code>
                </p>
              </div>

              {/* Suggestions */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Suggestions:</h4>
                <div className="space-y-2">
                  {selectedError.replacements && selectedError.replacements.length > 0 ? (
                    selectedError.replacements.map((replacement: any, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => handleApplySuggestion(replacement.value)}
                        className="w-full text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-blue-700 font-medium transition"
                      >
                        {replacement.value}
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Aucune suggestion disponible</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleIgnore}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Ignorer
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition"
                >
                  Fermer
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 font-medium mb-4">✓ Vérification terminée!</p>
              <button
                onClick={() => setCheckComplete(false)}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 underline"
              >
                Relancer une vérification
              </button>
            </div>
          )}

          {/* Error Summary */}
          {checkComplete && errors.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-900">
                <span className="font-semibold">{errors.length}</span> erreur{errors.length > 1 ? 's' : ''} trouvée{errors.length > 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
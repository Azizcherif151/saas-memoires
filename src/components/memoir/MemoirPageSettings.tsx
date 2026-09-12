// src/components/memoir/MemoirPageSettings.tsx

'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { PageSettings } from './types/memoir';

interface MemoirPageSettingsProps {
  settings: PageSettings;
  onClose: () => void;
  onSave: (settings: PageSettings) => void;
}

export default function MemoirPageSettings({
  settings,
  onClose,
  onSave,
}: MemoirPageSettingsProps) {
  const [formSettings, setFormSettings] = useState<PageSettings>(settings);

  const handleChange = (key: keyof PageSettings, value: any) => {
    setFormSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(formSettings);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Paramètres de la Page</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Paper Size & Orientation */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Format du papier
              </label>
              <select
                value={formSettings.paperSize}
                onChange={(e) => handleChange('paperSize', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-blue-600 bg-white text-gray-900"
              >
                <option value="A4">A4</option>
                <option value="A3">A3</option>
                <option value="Letter">Letter</option>
                <option value="Legal">Legal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Orientation
              </label>
              <select
                value={formSettings.orientation}
                onChange={(e) => handleChange('orientation', e.target.value as 'portrait' | 'landscape')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-blue-600 bg-white text-gray-900"
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Paysage</option>
              </select>
            </div>
          </div>

          {/* Margins */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Marges (mm)</h3>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Haut</label>
                <input
                  type="number"
                  value={formSettings.marginTop}
                  onChange={(e) => handleChange('marginTop', parseFloat(e.target.value))}
                  className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:outline-blue-600 bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Bas</label>
                <input
                  type="number"
                  value={formSettings.marginBottom}
                  onChange={(e) => handleChange('marginBottom', parseFloat(e.target.value))}
                  className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:outline-blue-600 bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Gauche</label>
                <input
                  type="number"
                  value={formSettings.marginLeft}
                  onChange={(e) => handleChange('marginLeft', parseFloat(e.target.value))}
                  className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:outline-blue-600 bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Droite</label>
                <input
                  type="number"
                  value={formSettings.marginRight}
                  onChange={(e) => handleChange('marginRight', parseFloat(e.target.value))}
                  className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:outline-blue-600 bg-white text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Font Settings */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Taille de police (pt)
              </label>
              <input
                type="number"
                value={formSettings.fontSize}
                onChange={(e) => handleChange('fontSize', parseFloat(e.target.value))}
                min="8"
                max="72"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-blue-600 bg-white text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Police
              </label>
              <input
                type="text"
                value={formSettings.fontFamily}
                onChange={(e) => handleChange('fontFamily', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-blue-600 bg-white text-gray-90"
                placeholder="Ex: Calibri"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Interligne
              </label>
              <select
                value={formSettings.lineHeight}
                onChange={(e) => handleChange('lineHeight', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-blue-600 bg-white text-gray-900"
              >
                <option value={1}>Simple (1)</option>
                <option value={1.5}>1.5</option>
                <option value={2}>Double (2)</option>
                <option value={2.5}>2.5</option>
              </select>
            </div>
          </div>

          {/* Header & Footer */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">En-tête et Pied de page</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">En-tête</label>
                <input
                  type="text"
                  value={formSettings.headerText || ''}
                  onChange={(e) => handleChange('headerText', e.target.value)}
                  placeholder="Texte d'en-tête (optionnel)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-blue-600 bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Pied de page</label>
                <input
                  type="text"
                  value={formSettings.footerText || ''}
                  onChange={(e) => handleChange('footerText', e.target.value)}
                  placeholder="Texte de pied de page (optionnel)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-blue-600 bg-white text-gray-900"
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formSettings.showPageNumbers}
                  onChange={(e) => handleChange('showPageNumbers', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Afficher les numéros de page</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
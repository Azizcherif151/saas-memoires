// src/components/memoir/MemoirEditorPro.tsx

'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from "@tiptap/extension-text-style";
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Table } from "@tiptap/extension-table";
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Placeholder from '@tiptap/extension-placeholder';
import { createLowlight } from "lowlight";
import { useEffect, useState } from 'react';
import MemoirToolbar from './MemoirToolbar';
import MemoirPageSettings from './MemoirPageSettings';
import MemoirVersionHistory from './MemoirVersionHistory';
import MemoirTrackChanges from './MemoirTrackChanges';
import MemoirExporter from './MemoirExporter';
import MemoirSpellCheck from './MemoirSpellCheck';
import MemoirTableOfContents from './MemoirTableOfContents';
import { useMemoirEditor } from './hooks/useMemoirEditor';
import { PageSettings } from './types/memoir';
import { Settings, Save, FileText } from 'lucide-react';

interface MemoirEditorProProps {
  memoireId: string;
  canEdit?: boolean;
}

export default function MemoirEditorPro({ memoireId, canEdit = true }: MemoirEditorProProps) {
  const {
    content,
    pageSettings,
    versions,
    editorState,
    editorRef,
    loadMemoir,
    saveMemoir,
    loadVersions,
    restoreVersion,
    updateStats,
    setPageSettings,
    setEditorState,
  } = useMemoirEditor(memoireId);
  const lowlight = createLowlight();

  const [showPageSettings, setShowPageSettings] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showSpellCheck, setShowSpellCheck] = useState(false);
  const [showTableOfContents, setShowTableOfContents] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        codeBlock: false,
      }),
      Underline,
      Strike,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Color,
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Subscript,
      Superscript,
      Image.configure({ allowBase64: true }),
      Link.configure({ openOnClick: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'javascript',
      }),
      Placeholder.configure({
        placeholder: 'Commencez à écrire votre mémoire...',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      updateStats(html);
      setEditorState(prev => ({ ...prev, isDirty: true }));
    },
    editable: canEdit,
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor, editorRef]);

  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  const handleManualSave = async () => {
    if (!editor) return;
    setIsSaving(true);
    setSaveStatus('saving');

    const html = editor.getHTML();
    const success = await saveMemoir(html);

    if (success) {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } else {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
    setIsSaving(false);
  };

  if (editorState.isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50">
        <div className="text-center">
          <Settings className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-600">Chargement de l'éditeur...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Top Bar */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="p-3 space-y-3">
          {/* Row 1: Main Actions */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleManualSave}
                disabled={isSaving}
                className={`px-4 py-2 text-sm font-medium rounded transition flex items-center gap-2 ${
                  saveStatus === 'saved'
                    ? 'bg-green-100 text-green-700'
                    : saveStatus === 'error'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Sauvegarde...' : saveStatus === 'saved' ? 'Sauvegardé' : 'Sauvegarder'}
              </button>

              <button
                onClick={() => {
                  loadVersions();
                  setShowVersionHistory(true);
                }}
                className="px-4 py-2 text-sm font-medium rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Historique
              </button>

              <button
                onClick={() => setShowSpellCheck(true)}
                className="px-4 py-2 text-sm font-medium rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
              >
                ✓ Vérifier l'orthographe
              </button>

              <button
                onClick={() => setShowTableOfContents(true)}
                className="px-4 py-2 text-sm font-medium rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
              >
                📋 Table des matières
              </button>
            </div>

            <div className="flex items-center gap-2">
              {editorState.lastSavedAt && (
                <span className="text-xs text-gray-500">
                  Dernière sauvegarde: {editorState.lastSavedAt.toLocaleTimeString('fr-FR')}
                </span>
              )}
              <button
                onClick={() => setShowPageSettings(true)}
                className="px-3 py-2 text-sm font-medium rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Row 2: Toolbar */}
          {editor && <MemoirToolbar editor={editor} pageSettings={pageSettings} />}
        </div>
      </div>

      {/* Editor Stats */}
      <div className="border-b border-gray-100 bg-gray-50 px-4 py-2 flex items-center justify-between text-xs text-gray-600">
        <div className="flex gap-6">
          <span>Mots: <strong>{editorState.wordCount}</strong></span>
          <span>Caractères: <strong>{editorState.characterCount}</strong></span>
          <span>Temps de lecture: <strong>{editorState.readingTime} min</strong></span>
        </div>
        {editorState.isDirty && <span className="text-amber-600 font-medium">● Non sauvegardé</span>}
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-auto">
        <div
          className="max-w-4xl mx-auto p-8 bg-white"
          style={{
            marginTop: `${pageSettings.marginTop}mm`,
            marginBottom: `${pageSettings.marginBottom}mm`,
            marginLeft: `${pageSettings.marginLeft}mm`,
            marginRight: `${pageSettings.marginRight}mm`,
            fontSize: `${pageSettings.fontSize}pt`,
            fontFamily: pageSettings.fontFamily,
            lineHeight: pageSettings.lineHeight,
          }}
        >
          {editor && <EditorContent editor={editor} className="prose prose-sm max-w-none" />}
        </div>
      </div>

      {/* Modals */}
      {showPageSettings && (
        <MemoirPageSettings
          settings={pageSettings}
          onClose={() => setShowPageSettings(false)}
          onSave={(newSettings) => {
            setPageSettings(newSettings);
            setShowPageSettings(false);
          }}
        />
      )}

      {showVersionHistory && (
        <MemoirVersionHistory
          versions={versions}
          onClose={() => setShowVersionHistory(false)}
          onRestore={(versionId) => {
            restoreVersion(versionId);
            setShowVersionHistory(false);
          }}
        />
      )}

      {showSpellCheck && editor && (
        <MemoirSpellCheck
          content={editor.getHTML()}
          onClose={() => setShowSpellCheck(false)}
          editor={editor}
        />
      )}

      {showTableOfContents && editor && (
        <MemoirTableOfContents
          content={editor.getHTML()}
          onClose={() => setShowTableOfContents(false)}
        />
      )}

      <MemoirExporter
        content={editor?.getHTML() || ''}
        pageSettings={pageSettings}
        memoireId={memoireId}
      />
    </div>
  );
}
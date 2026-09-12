// src/components/memoir/hooks/useMemoirEditor.ts

import { useState, useCallback, useEffect, useRef } from 'react';
import { Editor } from '@tiptap/react';
import { MemoirVersion, PageSettings, EditorState } from '../types/memoir';

const DEFAULT_PAGE_SETTINGS: PageSettings = {
  marginTop: 20,
  marginBottom: 20,
  marginLeft: 25,
  marginRight: 25,
  paperSize: 'A4',
  orientation: 'portrait',
  fontSize: 12,
  fontFamily: 'Calibri',
  lineHeight: 1.5,
  showPageNumbers: true,
};

export function useMemoirEditor(memoireId: string) {
  const [content, setContent] = useState<string>('');
  const [pageSettings, setPageSettings] = useState<PageSettings>(DEFAULT_PAGE_SETTINGS);
  const [versions, setVersions] = useState<MemoirVersion[]>([]);
  const [editorState, setEditorState] = useState<EditorState>({
    isLoading: true,
    isSaving: false,
    isDirty: false,
    selectedText: '',
    wordCount: 0,
    characterCount: 0,
    readingTime: 0,
  });
  const [autoSaveInterval, setAutoSaveInterval] = useState<NodeJS.Timeout | null>(null);
  const editorRef = useRef<Editor | null>(null);
  const contentRef = useRef<string>('');

  // Charger le mémoire
  const loadMemoir = useCallback(async () => {
    try {
      setEditorState(prev => ({ ...prev, isLoading: true }));
      const res = await fetch(`/api/memoires/${memoireId}/contenu/save`);
      if (res.ok) {
        const data = await res.json();
        setContent(data.contenu || '');
        contentRef.current = data.contenu || '';
        
        if (data.pageSettings) {
          setPageSettings(data.pageSettings);
        }
      }
      setEditorState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error('Erreur chargement mémoire:', error);
      setEditorState(prev => ({ ...prev, isLoading: false }));
    }
  }, [memoireId]);

  // Sauvegarder le mémoire
  const saveMemoir = useCallback(async (content: string) => {
    setEditorState(prev => ({ ...prev, isSaving: true }));
    try {
      const res = await fetch(`/api/memoires/${memoireId}/contenu/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contenu: content,
          pageSettings,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setEditorState(prev => ({
          ...prev,
          isSaving: false,
          isDirty: false,
          lastSavedAt: new Date(),
        }));
        contentRef.current = content;
        return true;
      }
    } catch (error) {
      console.error('Erreur sauvegarde mémoire:', error);
    }
    setEditorState(prev => ({ ...prev, isSaving: false }));
    return false;
  }, [memoireId, pageSettings]);

  // Auto-save toutes les 30 secondes
  useEffect(() => {
    if (autoSaveInterval) clearInterval(autoSaveInterval);

    const interval = setInterval(async () => {
      if (editorState.isDirty && editorRef.current) {
        const html = editorRef.current.getHTML();
        await saveMemoir(html);
      }
    }, 30000);

    setAutoSaveInterval(interval);
    return () => clearInterval(interval);
  }, [editorState.isDirty, saveMemoir]);

  // Compter les mots et caractères
  const updateStats = useCallback((html: string) => {
    const plainText = html
      .replace(/<[^>]*>/g, '') // Supprimer les balises HTML
      .replace(/&nbsp;/g, ' ')
      .trim();

    const wordCount = plainText.split(/\s+/).filter(w => w.length > 0).length;
    const characterCount = plainText.length;
    const readingTime = Math.ceil(wordCount / 200); // 200 mots par minute

    setEditorState(prev => ({
      ...prev,
      wordCount,
      characterCount,
      readingTime,
    }));
  }, []);

  // Charger au montage
  useEffect(() => {
    loadMemoir();
  }, [loadMemoir]);

  // Charger les versions
  const loadVersions = useCallback(async () => {
    try {
      const res = await fetch(`/api/memoires/${memoireId}/versions`);
      if (res.ok) {
        const data = await res.json();
        setVersions(data.versions || []);
      }
    } catch (error) {
      console.error('Erreur chargement versions:', error);
    }
  }, [memoireId]);

  // Restaurer une version
  const restoreVersion = useCallback(async (versionId: string) => {
    try {
      const res = await fetch(`/api/memoires/${memoireId}/versions/${versionId}/restore`, {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json();
        setContent(data.contenu);
        if (editorRef.current) {
          editorRef.current.commands.setContent(data.contenu);
        }
        setEditorState(prev => ({ ...prev, isDirty: true }));
        return true;
      }
    } catch (error) {
      console.error('Erreur restauration version:', error);
    }
    return false;
  }, [memoireId]);

  return {
    // État
    content,
    pageSettings,
    versions,
    editorState,
    editorRef,

    // Actions
    loadMemoir,
    saveMemoir,
    loadVersions,
    restoreVersion,
    updateStats,
    setPageSettings,
    setEditorState,
  };
}
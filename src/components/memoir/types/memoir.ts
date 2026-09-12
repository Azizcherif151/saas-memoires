// src/components/memoir/types/memoir.ts

export interface PageSettings {
  marginTop: number; // en mm
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  paperSize: 'A4' | 'A3' | 'Letter' | 'Legal';
  orientation: 'portrait' | 'landscape';
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  headerText?: string;
  footerText?: string;
  showPageNumbers: boolean;
}

export interface MemoirVersion {
  id: string;
  projectId: string;
  content: string;
  version: number;
  createdAt: Date;
  createdBy?: string;
  changeDescription?: string;
  thumbnail?: string; // pour preview
}

export interface TrackChange {
  id: string;
  type: 'insert' | 'delete' | 'format';
  position: number;
  content: string;
  author?: string;
  timestamp: Date;
  resolved: boolean;
}

export interface SpellCheckResult {
  error: {
    offset: number;
    length: number;
    message: string;
    suggestions: string[];
    ruleId: string;
  }[];
}

export interface TableOfContentsEntry {
  id: string;
  title: string;
  level: number; // 1-4 (H1-H4)
  position: number;
}

export interface MemoirContent {
  id: string;
  projectId: string;
  content: string;
  pageSettings: PageSettings;
  versions: MemoirVersion[];
  trackChanges: TrackChange[];
  tableOfContents: TableOfContentsEntry[];
  lastModified: Date;
  lastModifiedBy?: string;
}

export interface ExportOptions {
  format: 'pdf' | 'docx' | 'html';
  includeTableOfContents: boolean;
  includePageNumbers: boolean;
  includeFootnotes: boolean;
}

export interface SpellCheckWord {
  word: string;
  offset: number;
  suggestions: string[];
}

export interface EditorState {
  isLoading: boolean;
  isSaving: boolean;
  isDirty: boolean;
  lastSavedAt?: Date;
  selectedText: string;
  wordCount: number;
  characterCount: number;
  readingTime: number; // en minutes
}
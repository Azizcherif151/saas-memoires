// src/components/memoir/MemoirToolbar.tsx

'use client';

import { Editor } from '@tiptap/react';
import { useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Quote,
  Code,
  Link2,
  Image as ImageIcon,
  Table2,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Plus,
  Trash2,
} from 'lucide-react';
import { HexColorPicker } from "react-colorful";
import { PageSettings } from './types/memoir';

interface MemoirToolbarProps {
  editor: Editor;
  pageSettings: PageSettings;
}

const FONTS = [
  'Calibri',
  'Arial',
  'Times New Roman',
  'Georgia',
  'Courier New',
  'Verdana',
  'Comic Sans MS',
];

const FONT_SIZES = [8, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 32, 36];

export default function MemoirToolbar({ editor, pageSettings }: MemoirToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showFontSizeMenu, setShowFontSizeMenu] = useState(false);
  const [currentFont, setCurrentFont] = useState(pageSettings.fontFamily);
  const [currentFontSize, setCurrentFontSize] = useState(pageSettings.fontSize);

  const ToolbarButton = ({ onClick, isActive, disabled, title, children }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 transition ${
        isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );

  return (
    <div className="space-y-2 bg-gray-50 p-2">
      {/* Row 1: Undo/Redo + Font */}
      <div className="flex flex-wrap gap-1 items-center">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Annuler"
        >
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Refaire"
        >
          <Redo className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px bg-gray-300 h-6 mx-1"></div>

        {/* Font Family */}
        <div className="relative">
          <button
            onClick={() => setShowFontMenu(!showFontMenu)}
            className="px-3 py-2 text-xs bg-white border border-gray-300 hover:bg-gray-50 rounded"
          >
            {currentFont}
          </button>
          {showFontMenu && (
            <div className="absolute top-full mt-1 w-40 bg-white border border-gray-300 shadow-lg rounded z-50">
              {FONTS.map((font) => (
                <button
                  key={font}
                  onClick={() => {
                    setCurrentFont(font);
                    editor.chain().focus().setFontFamily(font).run();
                    setShowFontMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-blue-100 hover:text-blue-700"
                  style={{ fontFamily: font }}
                >
                  {font}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Font Size */}
        <div className="relative">
          <button
            onClick={() => setShowFontSizeMenu(!showFontSizeMenu)}
            className="px-3 py-2 text-xs bg-white border border-gray-300 hover:bg-gray-50 rounded"
          >
            {currentFontSize}pt
          </button>
          {showFontSizeMenu && (
            <div className="absolute top-full mt-1 w-20 bg-white border border-gray-300 shadow-lg rounded z-50 max-h-48 overflow-y-auto">
              {FONT_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    setCurrentFontSize(size);
                    editor.chain().focus().setFontSize(`${size}pt`).run();
                    setShowFontSizeMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-blue-100 hover:text-blue-700"
                >
                  {size}pt
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Text Formatting */}
      <div className="flex flex-wrap gap-1 items-center">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Gras"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italique"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Souligné"
        >
          <Underline className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Barré"
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px bg-gray-300 h-6 mx-1"></div>

        {/* Color Picker */}
        <div className="relative">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="p-2 bg-white border border-gray-300 hover:bg-gray-50 rounded text-gray-700"
            title="Couleur du texte"
          >
            <div className="w-4 h-4 bg-black rounded"></div>
          </button>
          {showColorPicker && (
            <div className="absolute top-full mt-1 p-3 bg-white border border-gray-300 shadow-lg rounded z-50">
              <HexColorPicker
                color="#000000"
                onChange={(color) => editor.chain().focus().setColor(color).run()}
              />
            </div>
          )}
        </div>

        {/* Highlight Picker */}
        <div className="relative">
          <button
            onClick={() => setShowHighlightPicker(!showHighlightPicker)}
            className="p-2 bg-white border border-gray-300 hover:bg-gray-50 rounded text-gray-700"
            title="Surlignage"
          >
            <div className="w-4 h-4 bg-yellow-300 rounded"></div>
          </button>
          {showHighlightPicker && (
            <div className="absolute top-full mt-1 p-3 bg-white border border-gray-300 shadow-lg rounded z-50">
              <HexColorPicker
                color="#ffff00"
                onChange={(color) => editor.chain().focus().setHighlight({ color }).run()}
              />
            </div>
          )}
        </div>

        <div className="w-px bg-gray-300 h-6 mx-1"></div>

        {/* Subscript & Superscript */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          isActive={editor.isActive('subscript')}
          title="Indice"
        >
          <span className="text-xs font-bold">x₂</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          isActive={editor.isActive('superscript')}
          title="Exposant"
        >
          <span className="text-xs font-bold">x²</span>
        </ToolbarButton>
      </div>

      {/* Row 3: Headings & Lists */}
      <div className="flex flex-wrap gap-1 items-center">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Titre 1"
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Titre 2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Titre 3"
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          isActive={editor.isActive('heading', { level: 4 })}
          title="Titre 4"
        >
          <Heading4 className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px bg-gray-300 h-6 mx-1"></div>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Liste à puces"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Liste numérotée"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px bg-gray-300 h-6 mx-1"></div>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Citation"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          title="Bloc de code"
        >
          <Code className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Row 4: Alignment */}
      <div className="flex flex-wrap gap-1 items-center">
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          title="Aligné à gauche"
        >
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          title="Centré"
        >
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          title="Aligné à droite"
        >
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          isActive={editor.isActive({ textAlign: 'justify' })}
          title="Justifié"
        >
          <AlignJustify className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px bg-gray-300 h-6 mx-1"></div>

        {/* Insert Options */}
        <ToolbarButton
          onClick={() => {
            const url = prompt('URL de l\'image:');
            if (url) editor.chain().focus().setImage({ src: url }).run();
          }}
          title="Insérer une image"
        >
          <ImageIcon className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => {
            const url = prompt('URL du lien:');
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
          title="Insérer un lien"
        >
          <Link2 className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          title="Insérer un tableau"
        >
          <Table2 className="w-4 h-4" />
        </ToolbarButton>

        {/* Table Controls */}
        {editor.isActive('table') && (
          <>
            <div className="w-px bg-gray-300 h-6 mx-1"></div>
            <ToolbarButton
              onClick={() => editor.chain().focus().addRowAfter().run()}
              title="Ajouter une ligne"
            >
              <Plus className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().deleteRow().run()}
              title="Supprimer la ligne"
            >
              <Trash2 className="w-4 h-4" />
            </ToolbarButton>
          </>
        )}
      </div>
    </div>
  );
}
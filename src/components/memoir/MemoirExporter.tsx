// src/components/memoir/MemoirExporter.tsx

'use client';

import { useState } from 'react';
import { Download, FileDown, Loader } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, HeadingLevel, PageBreak } from 'docx';
import { PageSettings } from './types/memoir';

interface MemoirExporterProps {
  content: string;
  pageSettings: PageSettings;
  memoireId: string;
}

export default function MemoirExporter({
  content,
  pageSettings,
  memoireId,
}: MemoirExporterProps) {
  const [isExporting, setIsExporting] = useState<'pdf' | 'docx' | null>(null);

  const exportPDF = async () => {
    setIsExporting('pdf');
    try {
      const pdf = new jsPDF({
        orientation: pageSettings.orientation,
        unit: 'mm',
        format: pageSettings.paperSize,
      });

      // Ajouter le contenu HTML
      const element = document.createElement('div');
      element.innerHTML = content;
      element.style.fontFamily = pageSettings.fontFamily;
      element.style.fontSize = `${pageSettings.fontSize}pt`;

      // Simple HTML to PDF conversion
      const text = element.innerText;
      const pageHeight = pdf.internal.pageSize.getHeight();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;

      pdf.setFont(pageSettings.fontFamily);
      pdf.setFontSize(pageSettings.fontSize);

      const splitText = pdf.splitTextToSize(
        text,
        pageWidth - 2 * margin
      );

      let yPosition = margin;
      splitText.forEach((line: string) => {
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += 7;
      });

      // Ajouter les numéros de page
      if (pageSettings.showPageNumbers) {
        const pageCount = pdf.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          pdf.setPage(i);
          pdf.setFontSize(10);
          pdf.text(
            `Page ${i} / ${pageCount}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
          );
        }
      }

      pdf.save(`memoire-${memoireId}.pdf`);
    } catch (error) {
      console.error('Erreur export PDF:', error);
      alert('Erreur lors de l\'export PDF');
    } finally {
      setIsExporting(null);
    }
  };

  const exportDOCX = async () => {
    setIsExporting('docx');
    try {
      // Parser le contenu HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;

      const paragraphs: Paragraph[] = [];
      const elements = tempDiv.children;

      for (let i = 0; i < elements.length; i++) {
        const element = elements[i] as HTMLElement;
        const text = element.innerText || '';

        if (element.tagName === 'H1') {
          paragraphs.push(
            new Paragraph({
              text,
              heading: HeadingLevel.HEADING_1,
              spacing: { line: pageSettings.lineHeight * 240 },
            })
          );
        } else if (element.tagName === 'H2') {
          paragraphs.push(
            new Paragraph({
              text,
              heading: HeadingLevel.HEADING_2,
              spacing: { line: pageSettings.lineHeight * 240 },
            })
          );
        } else if (element.tagName === 'H3') {
          paragraphs.push(
            new Paragraph({
              text,
              heading: HeadingLevel.HEADING_3,
              spacing: { line: pageSettings.lineHeight * 240 },
            })
          );
        } else if (element.tagName === 'H4') {
          paragraphs.push(
            new Paragraph({
              text,
              heading: HeadingLevel.HEADING_4,
              spacing: { line: pageSettings.lineHeight * 240 },
            })
          );
        } else if (element.tagName === 'UL' || element.tagName === 'OL') {
          const items = element.querySelectorAll('li');
          items.forEach((li) => {
            paragraphs.push(
              new Paragraph({
                text: li.innerText,
                bullet: { level: 0 },
                spacing: { line: pageSettings.lineHeight * 240 },
              })
            );
          });
        } else if (text.trim()) {
          paragraphs.push(
            new Paragraph({
              text,
              spacing: { line: pageSettings.lineHeight * 240 },
            })
          );
        }
      }

      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
  margin: {
    top: pageSettings.marginTop * 1440,
    bottom: pageSettings.marginBottom * 1440,
    left: pageSettings.marginLeft * 1440,
    right: pageSettings.marginRight * 1440,
  },
},
            },
            children: paragraphs,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `memoire-${memoireId}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur export DOCX:', error);
      alert('Erreur lors de l\'export DOCX');
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 flex gap-2">
      <button
        onClick={exportPDF}
        disabled={isExporting !== null}
        title="Exporter en PDF"
        className={`p-3 rounded-full shadow-lg transition transform hover:scale-110 flex items-center justify-center gap-2 ${
          isExporting === 'pdf'
            ? 'bg-red-600 text-white'
            : 'bg-red-500 hover:bg-red-600 text-white'
        } ${isExporting && isExporting !== 'pdf' ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isExporting === 'pdf' ? (
          <Loader className="w-5 h-5 animate-spin" />
        ) : (
          <FileDown className="w-5 h-5" />
        )}
        {isExporting === 'pdf' && <span className="text-xs">PDF...</span>}
      </button>

      <button
        onClick={exportDOCX}
        disabled={isExporting !== null}
        title="Exporter en DOCX"
        className={`p-3 rounded-full shadow-lg transition transform hover:scale-110 flex items-center justify-center gap-2 ${
          isExporting === 'docx'
            ? 'bg-blue-600 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        } ${isExporting && isExporting !== 'docx' ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isExporting === 'docx' ? (
          <Loader className="w-5 h-5 animate-spin" />
        ) : (
          <Download className="w-5 h-5" />
        )}
        {isExporting === 'docx' && <span className="text-xs">DOCX...</span>}
      </button>
    </div>
  );
}
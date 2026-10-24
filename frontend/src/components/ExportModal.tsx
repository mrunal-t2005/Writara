import React, { useState } from 'react';
import {
  X,
  Download,
  Printer,
  FileCode,
  FileText,
  FileSpreadsheet,
  Check,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import {
  downloadMarkdown,
  downloadPlainText,
  downloadHtml,
  downloadDocx,
  printDocument
} from '../services/exportService';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  title,
  content,
}) => {
  const [downloadedFormat, setDownloadedFormat] = useState<string | null>(null);

  if (!isOpen) return null;

  const baseFilename = (title || 'writara-document')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const handleDownload = (format: string) => {
    if (format === 'md') {
      downloadMarkdown(content, `${baseFilename}.md`);
    } else if (format === 'txt') {
      downloadPlainText(content, `${baseFilename}.txt`);
    } else if (format === 'html') {
      downloadHtml(title, content, `${baseFilename}.html`);
    } else if (format === 'docx') {
      downloadDocx(title, content, `${baseFilename}.doc`);
    } else if (format === 'print') {
      printDocument(title, content);
    }
    setDownloadedFormat(format);
    setTimeout(() => setDownloadedFormat(null), 2500);
  };

  const formats = [
    {
      id: 'docx',
      title: 'Microsoft Word Document (.docx)',
      description: 'Fully styled Word document with heading tags, lists, and quotes.',
      icon: FileSpreadsheet,
      badge: 'Popular',
      badgeColor: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
      action: 'Download Word DOC',
    },
    {
      id: 'print',
      title: 'Print / Save as PDF (.pdf)',
      description: 'Clean print-ready layout with header, metadata, and typography.',
      icon: Printer,
      badge: 'Universal',
      badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
      action: 'Open Print Dialog',
    },
    {
      id: 'html',
      title: 'Standalone Web Page (.html)',
      description: 'Single-file HTML document with modern responsive styling and fonts.',
      icon: FileCode,
      badge: 'Web Ready',
      badgeColor: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
      action: 'Download HTML',
    },
    {
      id: 'md',
      title: 'Markdown Document (.md)',
      description: 'Standard Github Flavored Markdown for developers and Notion/Obsidian.',
      icon: FileText,
      badge: 'Raw Text',
      badgeColor: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
      action: 'Download Markdown',
    },
    {
      id: 'txt',
      title: 'Plain Text (.txt)',
      description: 'Stripped of all formatting tags, ready for email and plain text editors.',
      icon: FileText,
      badge: 'Unformatted',
      badgeColor: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
      action: 'Download TXT',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-violet-600/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Export Final Document</h3>
            <p className="text-xs text-slate-400">Choose your preferred format for publishing</p>
          </div>
        </div>

        <div className="p-3 my-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
          <span className="font-semibold text-slate-200 truncate pr-2">
            📄 {title || 'Untitled Draft'}
          </span>
          <span className="text-slate-500 shrink-0">
            {content.trim().split(/\s+/).filter(Boolean).length} words
          </span>
        </div>

        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {formats.map((fmt) => {
            const Icon = fmt.icon;
            const isDone = downloadedFormat === fmt.id;
            return (
              <div
                key={fmt.id}
                onClick={() => handleDownload(fmt.id)}
                className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-violet-500/50 hover:bg-slate-900 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-violet-400 group-hover:scale-110 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white group-hover:text-violet-300 transition-colors">
                        {fmt.title}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${fmt.badgeColor}`}>
                        {fmt.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      {fmt.description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className={`ml-3 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                    isDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 group-hover:bg-violet-600 text-slate-200 group-hover:text-white'
                  }`}
                >
                  {isDone ? (
                    <span className="flex items-center gap-1">
                      <Check className="w-3 h-3" /> Done
                    </span>
                  ) : (
                    <span>Export</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

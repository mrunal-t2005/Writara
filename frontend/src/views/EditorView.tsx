import React, { useState } from 'react';
import {
  FileEdit,
  Sparkles,
  Scissors,
  Maximize2,
  CheckCheck,
  Languages,
  Save,
  Copy,
  Check,
  Download,
  RotateCcw,
  Sliders,
  FileText
} from 'lucide-react';
import { smartEdit, createDocument, updateDocument } from '../services/api';
import { Document } from '../types';

interface EditorViewProps {
  initialText?: string;
  initialTitle?: string;
  documentId?: string;
  onSaved?: () => void;
}

export const EditorView: React.FC<EditorViewProps> = ({
  initialText = '',
  initialTitle = 'Untitled Draft',
  documentId,
  onSaved,
}) => {
  const [content, setContent] = useState(initialText);
  const [title, setTitle] = useState(initialTitle);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([initialText]);
  const [historyIdx, setHistoryIdx] = useState(0);

  const [targetTone, setTargetTone] = useState('Persuasive');
  const [targetLang, setTargetLang] = useState('Spanish');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const chars = content.length;

  const pushHistory = (newText: string) => {
    const updated = history.slice(0, historyIdx + 1);
    updated.push(newText);
    setHistory(updated);
    setHistoryIdx(updated.length - 1);
    setContent(newText);
  };

  const handleUndo = () => {
    if (historyIdx > 0) {
      setHistoryIdx(historyIdx - 1);
      setContent(history[historyIdx - 1]);
    }
  };

  const handleAction = async (action: string, customPayload: Record<string, string> = {}) => {
    if (!content.trim()) return;
    setLoadingAction(action);
    try {
      const res = await smartEdit({
        action,
        text: content,
        target_tone: customPayload.tone || targetTone,
        target_language: customPayload.lang || targetLang,
      });
      pushHistory(res.edited_text);
    } catch (e) {
      console.error(e);
      alert('Error performing AI edit action');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSave = async () => {
    try {
      if (documentId) {
        await updateDocument(documentId, {
          title,
          content,
        });
      } else {
        await createDocument({
          title: title || 'Untitled Draft',
          content,
          content_type: 'custom_draft',
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      if (onSaved) onSaved();
    } catch (e) {
      console.error(e);
      alert('Failed to save document');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/\s+/g, '-')}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <FileEdit className="w-5 h-5" />
          </div>
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Document Title..."
              className="bg-transparent text-xl font-bold text-white focus:outline-none focus:border-b focus:border-violet-500 placeholder:text-slate-600"
            />
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
              <span>{words} words</span>
              <span>•</span>
              <span>{chars} characters</span>
              <span>•</span>
              <span className="text-violet-400">Markdown enabled</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {historyIdx > 0 && (
            <button
              onClick={handleUndo}
              title="Undo last AI revision"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Undo AI Edit</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/30 transition-all active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saved ? 'Saved!' : 'Save Document'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Editor Area (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 min-h-[600px] flex flex-col">
            <textarea
              rows={24}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start drafting or paste text to polish with AI..."
              className="w-full flex-1 bg-transparent text-slate-200 text-sm leading-relaxed placeholder:text-slate-600 focus:outline-none resize-none font-mono"
            />
          </div>
        </div>

        {/* AI Smart Editing Assistant Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-5 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl">
          <div>
            <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>AI Writing Assistant</span>
            </h3>
            <p className="text-xs text-slate-400">
              Apply precision transformations with single-click actions.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <button
              onClick={() => handleAction('rewrite')}
              disabled={!!loadingAction}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-violet-500/40 text-xs font-semibold text-slate-200 hover:text-white transition-all text-left"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span>Rewrite & Polish</span>
              </div>
              {loadingAction === 'rewrite' && <div className="w-3.5 h-3.5 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin"></div>}
            </button>

            <button
              onClick={() => handleAction('shorten')}
              disabled={!!loadingAction}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-violet-500/40 text-xs font-semibold text-slate-200 hover:text-white transition-all text-left"
            >
              <div className="flex items-center gap-2.5">
                <Scissors className="w-4 h-4 text-pink-400" />
                <span>Shorten & Tighten Flow</span>
              </div>
              {loadingAction === 'shorten' && <div className="w-3.5 h-3.5 border-2 border-pink-400/30 border-t-pink-400 rounded-full animate-spin"></div>}
            </button>

            <button
              onClick={() => handleAction('expand')}
              disabled={!!loadingAction}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-violet-500/40 text-xs font-semibold text-slate-200 hover:text-white transition-all text-left"
            >
              <div className="flex items-center gap-2.5">
                <Maximize2 className="w-4 h-4 text-indigo-400" />
                <span>Expand & Add Depth</span>
              </div>
              {loadingAction === 'expand' && <div className="w-3.5 h-3.5 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin"></div>}
            </button>

            <button
              onClick={() => handleAction('grammar')}
              disabled={!!loadingAction}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-violet-500/40 text-xs font-semibold text-slate-200 hover:text-white transition-all text-left"
            >
              <div className="flex items-center gap-2.5">
                <CheckCheck className="w-4 h-4 text-emerald-400" />
                <span>Fix Grammar & Punctuation</span>
              </div>
              {loadingAction === 'grammar' && <div className="w-3.5 h-3.5 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin"></div>}
            </button>

            <button
              onClick={() => handleAction('summarize')}
              disabled={!!loadingAction}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-violet-500/40 text-xs font-semibold text-slate-200 hover:text-white transition-all text-left"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Summarize to Key Bullets</span>
              </div>
              {loadingAction === 'summarize' && <div className="w-3.5 h-3.5 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin"></div>}
            </button>
          </div>

          {/* Tone Conversion */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Convert Tone
            </span>
            <div className="flex gap-2">
              <select
                value={targetTone}
                onChange={(e) => setTargetTone(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
              >
                <option value="Persuasive">Persuasive & Direct</option>
                <option value="Casual & Friendly">Casual & Friendly</option>
                <option value="Executive & Formal">Executive & Formal</option>
                <option value="Urgent & Action-Oriented">Urgent & Action-Oriented</option>
                <option value="Inspirational">Inspirational</option>
              </select>
              <button
                onClick={() => handleAction('tone', { tone: targetTone })}
                disabled={!!loadingAction}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Translation */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Translate Document
            </span>
            <div className="flex gap-2">
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
              >
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Japanese">Japanese</option>
                <option value="Hindi">Hindi</option>
                <option value="Portuguese">Portuguese</option>
              </select>
              <button
                onClick={() => handleAction('translate', { lang: targetLang })}
                disabled={!!loadingAction}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
              >
                Translate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

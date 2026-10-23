import React, { useState } from 'react';
import {
  Repeat,
  Sparkles,
  Copy,
  Check,
  Download,
  Share2,
  MessageCircle,
  Camera,
  Mail,
  Video,
  FileSpreadsheet,
  CheckCircle2,
  FileEdit,
  Save
} from 'lucide-react';
import { repurposeContent, createDocument } from '../services/api';
import type { BrandVoice } from '../types';

interface RepurposerViewProps {
  initialContent?: string;
  brandVoices: BrandVoice[];
  activeVoiceId: string;
  onEditInStudio: (text: string, title: string) => void;
}

export const RepurposerView: React.FC<RepurposerViewProps> = ({
  initialContent = '',
  brandVoices: _brandVoices,
  activeVoiceId,
  onEditInStudio,
}) => {
  const [sourceText, setSourceText] = useState(initialContent);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('linkedin');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  const platforms = [
    { id: 'linkedin', label: 'LinkedIn Post', icon: Share2, color: 'text-blue-400' },
    { id: 'twitter_thread', label: 'X / Twitter Thread', icon: MessageCircle, color: 'text-sky-400' },
    { id: 'instagram_caption', label: 'Instagram Carousel', icon: Camera, color: 'text-pink-400' },
    { id: 'email_newsletter', label: 'Email Newsletter', icon: Mail, color: 'text-amber-400' },
    { id: 'video_script', label: 'Reel / TikTok Script', icon: Video, color: 'text-rose-400' },
    { id: 'executive_summary', label: 'Executive Brief', icon: FileSpreadsheet, color: 'text-emerald-400' },
  ];

  const [selectedFormats, setSelectedFormats] = useState<string[]>([
    'linkedin',
    'twitter_thread',
    'instagram_caption',
    'email_newsletter',
    'video_script',
    'executive_summary'
  ]);

  const toggleFormat = (id: string) => {
    if (selectedFormats.includes(id)) {
      if (selectedFormats.length > 1) {
        setSelectedFormats(selectedFormats.filter(f => f !== id));
      }
    } else {
      setSelectedFormats([...selectedFormats, id]);
    }
  };

  const handleRepurpose = async () => {
    if (!sourceText.trim()) return;
    setLoading(true);
    try {
      const res = await repurposeContent({
        source_content: sourceText,
        target_formats: selectedFormats,
        brand_voice_id: activeVoiceId,
      });
      setResults(res.repurposed);
      if (selectedFormats.length > 0) {
        setActiveTab(selectedFormats[0]);
      }
    } catch (e) {
      console.error(e);
      alert('Error repurposing content.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (fmt: string) => {
    if (!results[fmt]) return;
    navigator.clipboard.writeText(results[fmt]);
    setCopiedKey(fmt);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveAsDraft = async (fmt: string) => {
    if (!results[fmt]) return;
    try {
      const title = `Repurposed ${fmt.replace('_', ' ').toUpperCase()}: ${sourceText.slice(0, 30)}...`;
      await createDocument({
        title,
        content: results[fmt],
        content_type: fmt,
        tags: ['repurposed', fmt],
      });
      setSavedKey(fmt);
      setTimeout(() => setSavedKey(null), 2000);
    } catch (e) {
      console.error(e);
      alert('Failed to save draft');
    }
  };

  const handleDownloadAll = () => {
    let combined = `# Repurposed Content Package\n\n`;
    combined += `Generated via Writara 1-Click Multi-Platform Engine\n\n---\n\n`;
    for (const [key, text] of Object.entries(results)) {
      combined += `## FORMAT: ${key.replace('_', ' ').toUpperCase()}\n\n${text}\n\n---\n\n`;
    }
    const blob = new Blob([combined], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `repurposed-content-pack.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20 text-[11px] font-semibold mb-1">
            <Repeat className="w-3 h-3 text-pink-400" />
            <span>Signature Engine #1</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            One-Click Multi-Platform Repurposing
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Transform any single piece of content into 6 high-performing, channel-native formats while preserving your core message.
          </p>
        </div>

        {Object.keys(results).length > 0 && (
          <button
            onClick={handleDownloadAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export All 6 Formats (.md)</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Source Text & Platform Selector (5 cols) */}
        <div className="lg:col-span-5 space-y-5 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Master Source Content
              </label>
              <span className="text-[11px] text-slate-500">
                {sourceText.trim().split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
            <textarea
              rows={9}
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Paste your blog article, podcast notes, speech, or marketing brief here..."
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 leading-relaxed font-mono"
            />
          </div>

          {/* Select Channels */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Target Distribution Channels
            </label>
            <div className="grid grid-cols-2 gap-2">
              {platforms.map((p) => {
                const Icon = p.icon;
                const isSelected = selectedFormats.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleFormat(p.id)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-slate-800/90 text-white border-pink-500/40 shadow-sm'
                        : 'bg-slate-950/60 text-slate-500 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? p.color : 'text-slate-600'}`} />
                    <span className="truncate">{p.label}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-pink-400 ml-auto shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleRepurpose}
            disabled={loading || !sourceText.trim()}
            className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-xl transition-all ${
              loading || !sourceText.trim()
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 shadow-pink-600/30 active:scale-[0.98]'
            }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Repurposing To All Channels...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Repurpose Now (1-Click)</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Tabbed Multi-Channel Results (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 min-h-[580px] flex flex-col justify-between">
          <div>
            {/* Platform Tabs Header */}
            <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-800 pb-3">
              {platforms
                .filter(p => selectedFormats.includes(p.id))
                .map((p) => {
                  const Icon = p.icon;
                  const isActive = activeTab === p.id;
                  const hasData = !!results[p.id];
                  return (
                    <button
                      key={p.id}
                      onClick={() => setActiveTab(p.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                        isActive
                          ? 'bg-pink-600/20 text-pink-300 border-pink-500/40 shadow-sm'
                          : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${p.color}`} />
                      <span>{p.label}</span>
                      {hasData && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      )}
                    </button>
                  );
                })}
            </div>

            {/* Repurposed Content Container */}
            <div className="py-5 overflow-y-auto max-h-[460px]">
              {loading ? (
                <div className="h-72 flex flex-col items-center justify-center space-y-3 text-center">
                  <div className="w-10 h-10 rounded-2xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center animate-spin">
                    <Repeat className="w-5 h-5 text-pink-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-200">Adapting into native platform formats...</p>
                  <p className="text-xs text-slate-400">Reformatting hooks, adding carousel slides, structuring threads</p>
                </div>
              ) : results[activeTab] ? (
                <div className="prose prose-invert prose-pink max-w-none text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80">
                  {results[activeTab]}
                </div>
              ) : (
                <div className="h-72 flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-800 rounded-2xl">
                  <Repeat className="w-8 h-8 text-slate-600 mb-2" />
                  <p className="text-sm font-semibold text-slate-300 mb-1">Select your source content & hit Repurpose Now</p>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Writara will simultaneously construct LinkedIn posts, tweet threads, Instagram slides, email newsletters, and video scripts.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Actions for Active Format */}
          {results[activeTab] && (
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
              <div className="text-xs text-slate-400 font-medium">
                Format: <strong className="text-slate-200">{activeTab.replace('_', ' ').toUpperCase()}</strong>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(activeTab)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                >
                  {copiedKey === activeTab ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === activeTab ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => handleSaveAsDraft(activeTab)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 text-xs font-medium transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savedKey === activeTab ? 'Saved!' : 'Save Draft'}</span>
                </button>
                <button
                  onClick={() => onEditInStudio(results[activeTab], `Repurposed ${activeTab.toUpperCase()}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600/20 text-violet-300 border border-violet-500/30 hover:bg-violet-600/30 text-xs font-semibold transition-colors"
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  <span>Open in Editor</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

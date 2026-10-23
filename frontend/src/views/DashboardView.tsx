import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  FileText,
  Clock,
  Layers,
  Award,
  ArrowRight,
  Plus,
  Repeat,
  Radio,
  FileSearch,
  ExternalLink,
  Trash2,
  FolderOpen
} from 'lucide-react';
import { AnalyticsData, Document, ContentTemplate } from '../types';
import { getAnalytics, getDocuments, deleteDocument } from '../services/api';
import { TEMPLATES } from '../data/templates';

interface DashboardViewProps {
  onSelectTemplate: (template: ContentTemplate) => void;
  onOpenDocument: (doc: Document) => void;
  setActiveTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectTemplate,
  onOpenDocument,
  setActiveTab,
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentDocs, setRecentDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [stats, docs] = await Promise.all([getAnalytics(), getDocuments()]);
      setAnalytics(stats);
      setRecentDocs(docs.slice(0, 5));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this draft?')) {
      await deleteDocument(id);
      loadData();
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-950/80 via-slate-900 to-indigo-950/60 border border-violet-500/20 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-violet-600/10 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Writara Next-Gen AI Workspace</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Transform ideas into <span className="gradient-text">high-impact content</span> in seconds.
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Generate, rewrite, repurpose, and fact-audit your content in one unified operating system.
            Equipped with Brand Voice Memory and 1-Click Multi-Channel Repurposing.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('generator')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-lg shadow-violet-600/30 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Start Blank Generation</span>
            </button>
            <button
              onClick={() => setActiveTab('repurpose')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors"
            >
              <Repeat className="w-3.5 h-3.5 text-pink-400" />
              <span>1-Click Repurposing</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-violet-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Words Created</span>
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {analytics ? analytics.total_words_generated.toLocaleString() : '1,840'}
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <span className="text-emerald-400 font-medium">↑ High Velocity</span>
            <span>across all drafts</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-violet-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Time Saved</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {analytics ? `${analytics.hours_saved} hrs` : '1.5 hrs'}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            <span>Estimated editorial research & drafting</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-violet-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Saved Drafts</span>
            <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {analytics ? analytics.total_documents : '3'}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            <span>Organized in workspace</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-violet-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Quality Score</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400">
            94.6%
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <span className="text-emerald-400 font-medium">✓ Editorial Grade</span>
          </div>
        </div>
      </div>

      {/* Signature Capabilities Spotlight */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <span>Three Signature Engines</span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
            What makes Writara stand out
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => setActiveTab('brand_voice')}
            className="group p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-all hover:bg-slate-900/90"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Radio className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5 flex items-center justify-between">
              <span>Brand Voice Memory</span>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Feed your writing samples or style rules. Writara extracts vocabulary, cadence, and banned words to guarantee 100% brand consistency.
            </p>
          </div>

          <div
            onClick={() => setActiveTab('repurpose')}
            className="group p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-pink-500/40 cursor-pointer transition-all hover:bg-slate-900/90"
          >
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Repeat className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5 flex items-center justify-between">
              <span>1-Click Repurposing</span>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-pink-400 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Convert 1 blog post into a viral LinkedIn thought-piece, numbered Twitter thread, Instagram carousel script, and email newsletter simultaneously.
            </p>
          </div>

          <div
            onClick={() => setActiveTab('evaluator')}
            className="group p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all hover:bg-slate-900/90"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileSearch className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5 flex items-center justify-between">
              <span>AI Quality & Fact Audit</span>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automatic Flesch readability, prompt adherence score, and fact-checking radar that detects unverified statistical claims and superlatives.
            </p>
          </div>
        </div>
      </div>

      {/* Featured Templates Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Quick Start Content Templates</h2>
            <p className="text-xs text-slate-400">Launch a prompt-engineered framework in 1-click</p>
          </div>
          <button
            onClick={() => setActiveTab('generator')}
            className="text-xs text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TEMPLATES.slice(0, 6).map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => onSelectTemplate(tpl)}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-violet-500/50 hover:bg-slate-900/90 cursor-pointer transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                    {tpl.category}
                  </span>
                  <span className="text-xs text-violet-400 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-violet-300 transition-colors">
                  {tpl.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                  {tpl.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span>Tone: <strong className="text-slate-300">{tpl.tone}</strong></span>
                <span className="text-violet-400 font-semibold group-hover:underline">Use Template</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Drafts List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Recent Projects & Drafts</h2>
            <p className="text-xs text-slate-400">Continue editing your finalized content</p>
          </div>
          <button
            onClick={() => setActiveTab('documents')}
            className="text-xs text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1"
          >
            <span>All Documents</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentDocs.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/30 border border-slate-800 text-center">
            <p className="text-sm text-slate-400 mb-3">No saved documents yet. Start generating above!</p>
            <button
              onClick={() => setActiveTab('generator')}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold"
            >
              Generate First Document
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentDocs.map((doc) => (
              <div
                key={doc.id}
                onClick={() => onOpenDocument(doc)}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-violet-500/40 hover:bg-slate-900/90 cursor-pointer transition-all group relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20">
                      {doc.content_type.replace('_', ' ')}
                    </span>
                    <button
                      onClick={(e) => handleDelete(doc.id, e)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2 line-clamp-1 group-hover:text-violet-300">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                    {doc.content.replace(/[#*`]/g, '')}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{doc.word_count} words</span>
                  <span className="text-violet-400 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Open <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

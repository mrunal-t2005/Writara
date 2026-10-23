import React, { useState } from 'react';
import {
  FileSearch,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Award,
  BookOpen,
  Hash,
  ArrowRight,
  TrendingUp,
  FileEdit,
  Clock
} from 'lucide-react';
import { QualityMetrics } from '../types';
import { evaluateQuality } from '../services/api';

interface QualityEvaluatorViewProps {
  initialContent?: string;
  initialPrompt?: string;
  onEditInStudio: (text: string, title: string) => void;
}

export const QualityEvaluatorView: React.FC<QualityEvaluatorViewProps> = ({
  initialContent = '',
  initialPrompt = '',
  onEditInStudio,
}) => {
  const [text, setText] = useState(initialContent);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [targetTone, setTargetTone] = useState('Professional & Engaging');
  const [evaluating, setEvaluating] = useState(false);
  const [metrics, setMetrics] = useState<QualityMetrics | null>(null);

  const handleEvaluate = async () => {
    if (!text.trim()) return;
    setEvaluating(true);
    try {
      const res = await evaluateQuality({
        text,
        prompt,
        target_tone: targetTone,
      });
      setMetrics(res);
    } catch (e) {
      console.error(e);
      alert('Error evaluating content');
    } finally {
      setEvaluating(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score >= 75) return 'text-violet-400 border-violet-500/40 bg-violet-500/10';
    if (score >= 60) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px] font-semibold mb-1">
            <FileSearch className="w-3 h-3 text-emerald-400" />
            <span>Signature Engine #3</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            AI Content Quality & Fact Audit
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit readability, prompt adherence, tone consistency, and scan for factual statistical claims requiring citation.
          </p>
        </div>

        {metrics && (
          <button
            onClick={() => onEditInStudio(text, 'Quality Audited Document')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/30 transition-all"
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>Open in Smart Editor</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Input Text to Audit (5 cols) */}
        <div className="lg:col-span-5 space-y-5 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Content to Audit <span className="text-rose-400">*</span>
              </label>
              <span className="text-[11px] text-slate-500">
                {text.trim().split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
            <textarea
              rows={12}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste any article, copy, or draft to run comprehensive readability, tone, and factuality evaluation..."
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 leading-relaxed font-mono"
            />
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Original Prompt / Objective (Optional)
              </label>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Write an engaging guide for SaaS founders..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Target Tone Standard
              </label>
              <input
                type="text"
                value={targetTone}
                onChange={(e) => setTargetTone(e.target.value)}
                placeholder="e.g. Professional yet Conversational"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            onClick={handleEvaluate}
            disabled={evaluating || !text.trim()}
            className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-xl transition-all ${
              evaluating || !text.trim()
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/30 active:scale-[0.98]'
            }`}
          >
            {evaluating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Running Deep Quality Audit...</span>
              </>
            ) : (
              <>
                <FileSearch className="w-4 h-4" />
                <span>Run Quality & Fact Audit</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Audit Report (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {evaluating ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-3 min-h-[480px]">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center animate-pulse">
                <Award className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="text-sm font-bold text-white">Analyzing Linguistic Pacing & Factual Assertions...</p>
              <p className="text-xs text-slate-400 max-w-sm">
                Calculating Flesch Reading Ease, detecting unverified statistics, and checking tone adherence.
              </p>
            </div>
          ) : metrics ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Top Score Banner */}
              <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 flex flex-wrap items-center justify-between gap-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Composite Quality Index
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white">
                      {metrics.overall_score}%
                    </span>
                    <span className="text-xs text-emerald-400 font-semibold">
                      {metrics.overall_score >= 85 ? 'Publication Ready' : 'Needs Minor Polish'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Based on adherence, tone consistency, and readability metrics.
                  </p>
                </div>

                {/* Score Pill Breakdown */}
                <div className="flex items-center gap-2">
                  <div className="px-3.5 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                    <span className="text-[10px] uppercase text-slate-500 font-bold block">Adherence</span>
                    <span className="text-sm font-black text-violet-400">{metrics.adherence_score}%</span>
                  </div>
                  <div className="px-3.5 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                    <span className="text-[10px] uppercase text-slate-500 font-bold block">Tone Match</span>
                    <span className="text-sm font-black text-amber-400">{metrics.tone_consistency_score}%</span>
                  </div>
                  <div className="px-3.5 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                    <span className="text-[10px] uppercase text-slate-500 font-bold block">Clarity</span>
                    <span className="text-sm font-black text-emerald-400">{metrics.clarity_score}%</span>
                  </div>
                </div>
              </div>

              {/* Readability Card */}
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-violet-400" />
                  <span>Flesch-Kincaid Readability Analysis</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
                    <span className="text-[11px] text-slate-400 block mb-0.5">Reading Ease</span>
                    <div className="text-xl font-black text-white">{metrics.readability.score} / 100</div>
                    <span className="text-[11px] text-emerald-400 font-medium">
                      {metrics.readability.interpretation}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
                    <span className="text-[11px] text-slate-400 block mb-0.5">Grade Level</span>
                    <div className="text-xl font-black text-white">Grade {metrics.readability.grade_level}</div>
                    <span className="text-[11px] text-slate-400">Target audience tier</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
                    <span className="text-[11px] text-slate-400 block mb-0.5">Sentence Rhythm</span>
                    <div className="text-xl font-black text-white">{metrics.readability.avg_words_per_sentence} w/s</div>
                    <span className="text-[11px] text-slate-400">Average word count</span>
                  </div>
                </div>
              </div>

              {/* Factual Claims & Verification Radar (SIGNATURE FEATURE) */}
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <span>Factual Claims & Verification Radar</span>
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 uppercase">
                    Anti-Hallucination
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Scans for numbers, statistics, percentages, and ungrounded superlatives that require verification before publishing.
                </p>

                <div className="space-y-2">
                  {metrics.fact_check_flags.map((flag, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-start gap-3"
                    >
                      <div className="mt-0.5">
                        {flag.severity === 'medium' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        ) : flag.severity === 'info' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-sky-400 shrink-0" />
                        )}
                      </div>
                      <div className="text-xs space-y-1">
                        <div className="font-semibold text-slate-200">"{flag.claim}"</div>
                        <div className="text-slate-400 text-[11px]">{flag.reason}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SEO & Keywords */}
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Hash className="w-4 h-4 text-pink-400" />
                  <span>Keyword Density & Frequency</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {metrics.seo_keywords.map((kw, i) => (
                    <div
                      key={i}
                      className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2 text-xs"
                    >
                      <span className="font-semibold text-white">{kw.keyword}</span>
                      <span className="text-[11px] text-slate-400">×{kw.count}</span>
                      <span className="text-[10px] font-bold text-violet-400 bg-violet-500/10 px-1.5 py-0.2 rounded">
                        {kw.density}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Editorial Suggestions */}
              {metrics.suggestions.length > 0 && (
                <div className="p-6 rounded-3xl bg-violet-950/20 border border-violet-500/20 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-violet-300">
                    Recommendations for Perfection
                  </h4>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                    {metrics.suggestions.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-3 min-h-[480px]">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-500">
                <FileSearch className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-300">No Content Audited Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Paste your content on the left and click <strong className="text-slate-300">Run Quality & Fact Audit</strong> to analyze readability, tone consistency, and factual integrity.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

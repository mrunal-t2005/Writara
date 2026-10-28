import React, { useState } from 'react';
import {
  Flame,
  Sparkles,
  Copy,
  Check,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  FileEdit,
  Sliders,
  CheckCircle2,
  Zap,
  Tag
} from 'lucide-react';
import { HeadlineVariation, ClicheScanResult } from '../types';
import { generateAbHeadlines, scanCliches } from '../services/api';

interface HeadlineAbViewProps {
  initialTopic?: string;
  onUseHeadline: (headline: string) => void;
  onEditInStudio: (text: string, title: string) => void;
}

export const HeadlineAbView: React.FC<HeadlineAbViewProps> = ({
  initialTopic = '',
  onUseHeadline,
  onEditInStudio,
}) => {
  const [activeTab, setActiveTab] = useState<'headlines' | 'cliches'>('headlines');

  // Headlines State
  const [topic, setTopic] = useState(initialTopic);
  const [audience, setAudience] = useState('Founders & Creators');
  const [generatingHeadlines, setGeneratingHeadlines] = useState(false);
  const [headlines, setHeadlines] = useState<HeadlineVariation[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  // Cliché Scanner State
  const [clicheText, setClicheText] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ClicheScanResult | null>(null);

  const handleGenerateHeadlines = async () => {
    if (!topic.trim()) return;
    setGeneratingHeadlines(true);
    try {
      const res = await generateAbHeadlines({
        topic,
        target_audience: audience,
      });
      setHeadlines(res.headlines);
    } catch (e) {
      console.error(e);
      alert('Error generating headlines');
    } finally {
      setGeneratingHeadlines(false);
    }
  };

  const handleScanCliches = async () => {
    if (!clicheText.trim()) return;
    setScanning(true);
    try {
      const res = await scanCliches(clicheText);
      setScanResult(res);
    } catch (e) {
      console.error(e);
      alert('Error scanning clichés');
    } finally {
      setScanning(false);
    }
  };

  const handleCopyHeadline = (headline: string, idx: number) => {
    navigator.clipboard.writeText(headline);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-300 border border-orange-500/20 text-[11px] font-semibold mb-1">
            <Flame className="w-3 h-3 text-orange-400" />
            <span>Growth & Engagement Suite</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Headline A/B Matrix & AI Cliché Scanner
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Predict CTR with 5 high-converting headline variations, and eliminate robotic AI tropes with natural human replacements.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('headlines')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'headlines'
                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>A/B Headline Matrix</span>
          </button>
          <button
            onClick={() => setActiveTab('cliches')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'cliches'
                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AI Cliché Scanner</span>
          </button>
        </div>
      </div>

      {activeTab === 'headlines' ? (
        /* Tab 1: Headline A/B Testing Matrix */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Inputs */}
          <div className="lg:col-span-5 space-y-5 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Core Topic / Big Idea <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={3}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Scaling an AI startup to $1M ARR with a lean 3-person team..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Target Audience Demographics
              </label>
              <input
                type="text"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g. Founders, Marketers, Remote Workers"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="p-4 rounded-2xl bg-orange-950/20 border border-orange-500/20 text-xs text-slate-300 leading-relaxed space-y-1.5">
              <span className="font-semibold text-orange-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> The 5 Tested Formulas:
              </span>
              <p className="text-[11px] text-slate-400">
                1. How-To Blueprint • 2. Contrarian Pattern-Interrupt • 3. Data-Backed ROI • 4. High-Stakes Urgency • 5. Aspirational Transformation
              </p>
            </div>

            <button
              onClick={handleGenerateHeadlines}
              disabled={generatingHeadlines || !topic.trim()}
              className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-xl transition-all ${
                generatingHeadlines || !topic.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-orange-600/30 active:scale-[0.98]'
              }`}
            >
              {generatingHeadlines ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Generating 5 Viral Angles...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Headline Variations</span>
                </>
              )}
            </button>
          </div>

          {/* Right Variations Output */}
          <div className="lg:col-span-7 space-y-4">
            {headlines.length > 0 ? (
              headlines.map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-orange-500/40 hover:bg-slate-900/90 transition-all flex flex-col justify-between group space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {item.angle}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">CTR Potential:</span>
                      <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {item.ctr_score}%
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug group-hover:text-orange-200 transition-colors">
                    "{item.headline}"
                  </h3>

                  <div className="text-xs text-slate-400 flex items-center gap-3">
                    <span className="flex items-center gap-1 text-orange-400">
                      <Tag className="w-3 h-3" /> {item.emotional_hook}
                    </span>
                    <span>•</span>
                    <span>{item.char_count || item.headline.length} chars</span>
                  </div>

                  <p className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 leading-relaxed">
                    💡 <strong className="text-slate-300">Strategy:</strong> {item.rationale}
                  </p>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleCopyHeadline(item.headline, idx)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                    >
                      {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedIdx === idx ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={() => onUseHeadline(item.headline)}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-md shadow-orange-600/30 transition-all hover:scale-105"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Use in Draft</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-3 min-h-[460px]">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                  <Flame className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-200">No Headlines Generated Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  Enter your core topic and target audience on the left and click <strong className="text-slate-300">Generate Headline Variations</strong> to predict CTR across 5 angles.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Tab 2: AI Cliché & Human Voice Scanner */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 space-y-5 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Paste Content to Audit for AI Tropes <span className="text-rose-400">*</span>
                </label>
                <span className="text-[11px] text-slate-500">
                  {clicheText.trim().split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <textarea
                rows={12}
                value={clicheText}
                onChange={(e) => setClicheText(e.target.value)}
                placeholder="Paste your draft to scan for overused AI phrases like 'delve into', 'in today's fast-paced world', 'testament to', and 'game-changer'..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-orange-500 font-mono leading-relaxed"
              />
            </div>

            <button
              onClick={handleScanCliches}
              disabled={scanning || !clicheText.trim()}
              className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-xl transition-all ${
                scanning || !clicheText.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-orange-600/30 active:scale-[0.98]'
              }`}
            >
              {scanning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Scanning for AI Tropes...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Scan for AI Clichés & Human Tone</span>
                </>
              )}
            </button>
          </div>

          {/* Right: Scan Results */}
          <div className="lg:col-span-6 space-y-5">
            {scanResult ? (
              <div className="space-y-5 animate-in fade-in duration-300">
                {/* Score Banner */}
                <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Human Voice & Originality Score
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-white">
                        {scanResult.originality_score}%
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        scanResult.originality_score >= 85
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : scanResult.originality_score >= 65
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}>
                        {scanResult.verdict}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">AI Tropes Detected</span>
                    <span className="text-xl font-black text-orange-400">{scanResult.cliches_found_count}</span>
                  </div>
                </div>

                {/* Detected Clichés List */}
                <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Robotic Phrases & Human Replacements</span>
                  </h3>

                  {scanResult.findings.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Zero robotic AI tropes detected! Your draft reads authentic and human.</span>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {scanResult.findings.map((f, i) => (
                        <div
                          key={i}
                          className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-rose-400 line-through">
                              "{f.cliche}"
                            </span>
                            <span className="text-[10px] text-slate-500">
                              found ×{f.occurrences}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300">
                            ✨ <strong className="text-emerald-400">Replacement:</strong> {f.suggestion}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end">
                  <button
                    onClick={() => onEditInStudio(clicheText, 'De-Roboticized Draft')}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-lg shadow-violet-600/30 transition-all"
                  >
                    <FileEdit className="w-4 h-4" />
                    <span>Apply Replacements in Smart Editor</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-3 min-h-[460px]">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-200">No Content Scanned Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  Paste your draft on the left and click <strong className="text-slate-300">Scan for AI Clichés & Human Tone</strong> to detect overused filler words.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

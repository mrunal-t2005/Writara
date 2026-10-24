import React, { useState } from 'react';
import {
  Globe,
  Sparkles,
  Smartphone,
  Monitor,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Copy,
  Check,
  Hash,
  Layers,
  FileEdit,
  Code2,
  Sliders,
  ArrowRight
} from 'lucide-react';
import { SeoAnalysisResult } from '../types';
import { analyzeSeo } from '../services/api';

interface SeoViewProps {
  initialContent?: string;
  initialKeyword?: string;
  onEditInStudio: (text: string, title: string) => void;
}

export const SeoView: React.FC<SeoViewProps> = ({
  initialContent = '',
  initialKeyword = '',
  onEditInStudio,
}) => {
  const [content, setContent] = useState(initialContent);
  const [targetKeyword, setTargetKeyword] = useState(initialKeyword);
  const [secondaryKeywords, setSecondaryKeywords] = useState<string[]>([]);
  const [kwInput, setKwInput] = useState('');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [analyzing, setAnalyzing] = useState(false);
  const [seoResult, setSeoResult] = useState<SeoAnalysisResult | null>(null);

  const [copiedMeta, setCopiedMeta] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);

  const handleAddKeyword = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && kwInput.trim()) {
      e.preventDefault();
      if (!secondaryKeywords.includes(kwInput.trim())) {
        setSecondaryKeywords([...secondaryKeywords, kwInput.trim()]);
      }
      setKwInput('');
    }
  };

  const handleRemoveKeyword = (kw: string) => {
    setSecondaryKeywords(secondaryKeywords.filter(k => k !== kw));
  };

  const handleAnalyze = async () => {
    if (!content.trim()) return;
    setAnalyzing(true);
    try {
      const res = await analyzeSeo({
        content,
        target_keyword: targetKeyword,
        secondary_keywords: secondaryKeywords,
      });
      setSeoResult(res);
    } catch (e) {
      console.error(e);
      alert('Error analyzing SEO metrics');
    } finally {
      setAnalyzing(false);
    }
  };

  const copyMetaTags = () => {
    if (!seoResult) return;
    const tags = `<title>${seoResult.meta_title}</title>\n<meta name="description" content="${seoResult.meta_description}" />\n<link rel="canonical" href="${seoResult.serp_url}" />`;
    navigator.clipboard.writeText(tags);
    setCopiedMeta(true);
    setTimeout(() => setCopiedMeta(false), 2000);
  };

  const copySchemaJson = () => {
    if (!seoResult) return;
    navigator.clipboard.writeText(seoResult.schema_json_ld);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[11px] font-semibold mb-1">
            <Globe className="w-3 h-3 text-cyan-400" />
            <span>Search Engine Optimization</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            SEO Suite & Google SERP Simulator
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit meta titles, descriptions, heading structure, and keyword density with pixel-perfect SERP simulation.
          </p>
        </div>

        {seoResult && (
          <div className="flex items-center gap-2">
            <button
              onClick={copyMetaTags}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
            >
              {copiedMeta ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedMeta ? 'Tags Copied!' : 'Copy <meta> Tags'}</span>
            </button>
            <button
              onClick={() => onEditInStudio(content, seoResult.meta_title)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/30 transition-all"
            >
              <FileEdit className="w-3.5 h-3.5" />
              <span>Polish in Editor</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-5 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Primary Target Keyword
            </label>
            <input
              type="text"
              value={targetKeyword}
              onChange={(e) => setTargetKeyword(e.target.value)}
              placeholder="e.g. AI content generation, sustainable fashion..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Secondary / LSI Keywords (Press Enter)
            </label>
            <input
              type="text"
              value={kwInput}
              onChange={(e) => setKwInput(e.target.value)}
              onKeyDown={handleAddKeyword}
              placeholder="Type secondary keyword and press Enter..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 mb-2"
            />
            <div className="flex flex-wrap gap-1.5">
              {secondaryKeywords.map((sk) => (
                <span
                  key={sk}
                  className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                >
                  {sk}
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(sk)}
                    className="hover:text-rose-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Article / Page Content <span className="text-rose-400">*</span>
              </label>
              <span className="text-[11px] text-slate-500">
                {content.trim().split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
            <textarea
              rows={11}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your blog article, landing page copy, or product text here..."
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-mono leading-relaxed"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={analyzing || !content.trim()}
            className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-xl transition-all ${
              analyzing || !content.trim()
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-600 via-teal-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 shadow-cyan-600/30 active:scale-[0.98]'
            }`}
          >
            {analyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Auditing SEO & SERP Factors...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run SEO & SERP Audit</span>
              </>
            )}
          </button>
        </div>

        {/* Right Output: SERP Preview & Metrics (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {seoResult ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Top SEO Health Score Banner */}
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Overall SEO Health Score
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white">
                      {seoResult.seo_score}%
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      seoResult.seo_score >= 85
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                        : seoResult.seo_score >= 65
                        ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                        : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                    }`}>
                      {seoResult.seo_score >= 85 ? 'Strong Visibility' : seoResult.seo_score >= 65 ? 'Good Foundation' : 'Optimization Needed'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Total Words</span>
                    <span className="text-lg font-bold text-white">{seoResult.word_count}</span>
                  </div>
                  <div className="w-px h-8 bg-slate-800"></div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Headings</span>
                    <span className="text-lg font-bold text-cyan-400">{seoResult.headings.total_headings}</span>
                  </div>
                </div>
              </div>

              {/* Live Google SERP Snippet Preview */}
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <span>Google SERP Snippet Preview</span>
                  </h3>
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => setPreviewDevice('desktop')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                        previewDevice === 'desktop' ? 'bg-slate-800 text-white' : 'text-slate-400'
                      }`}
                    >
                      <Monitor className="w-3 h-3" />
                      <span>Desktop</span>
                    </button>
                    <button
                      onClick={() => setPreviewDevice('mobile')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                        previewDevice === 'mobile' ? 'bg-slate-800 text-white' : 'text-slate-400'
                      }`}
                    >
                      <Smartphone className="w-3 h-3" />
                      <span>Mobile</span>
                    </button>
                  </div>
                </div>

                {/* Google Snippet Card */}
                <div className={`p-5 rounded-2xl bg-[#202124] border border-[#3c4043] font-sans ${previewDevice === 'mobile' ? 'max-w-md mx-auto shadow-2xl' : ''}`}>
                  {/* Google Breadcrumb */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[9px] font-bold">
                      W
                    </div>
                    <div className="text-xs text-[#bdc1c6] truncate">
                      writara.app <span className="text-[#9aa0a6]">› blog › {seoResult.serp_url.split('/').pop()}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h4 className="text-[#8ab4f8] hover:underline cursor-pointer text-base sm:text-lg font-medium leading-snug line-clamp-1 mb-1.5">
                    {seoResult.meta_title}
                  </h4>

                  {/* Description */}
                  <p className="text-[#bdc1c6] text-xs sm:text-sm leading-relaxed line-clamp-2">
                    {seoResult.meta_description}
                  </p>
                </div>

                {/* Character Counter Badges */}
                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Meta Title:</span>
                    <span className={`font-semibold ${seoResult.meta_title_length <= 60 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {seoResult.meta_title_length} / 60 chars
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Meta Description:</span>
                    <span className={`font-semibold ${seoResult.meta_description_length <= 160 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {seoResult.meta_description_length} / 160 chars
                    </span>
                  </div>
                </div>
              </div>

              {/* Keyword Density & Prominence Matrix */}
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Hash className="w-4 h-4 text-pink-400" />
                  <span>Keyword Prominence & Placement</span>
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="pb-2 font-semibold">Keyword</th>
                        <th className="pb-2 font-semibold text-center">Count</th>
                        <th className="pb-2 font-semibold text-center">Density</th>
                        <th className="pb-2 font-semibold text-center">In Title</th>
                        <th className="pb-2 font-semibold text-center">In Intro</th>
                        <th className="pb-2 font-semibold text-center">In Headings</th>
                        <th className="pb-2 font-semibold text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {seoResult.keywords.map((kw, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/20">
                          <td className="py-2.5 font-bold text-slate-200">
                            {kw.keyword} {kw.is_primary && <span className="text-[10px] text-cyan-400 ml-1 font-normal">(Primary)</span>}
                          </td>
                          <td className="py-2.5 text-center text-slate-300">{kw.count}</td>
                          <td className="py-2.5 text-center font-bold text-cyan-400">{kw.density}</td>
                          <td className="py-2.5 text-center">{kw.in_title ? '✅' : '❌'}</td>
                          <td className="py-2.5 text-center">{kw.in_first_100_words ? '✅' : '❌'}</td>
                          <td className="py-2.5 text-center">{kw.in_headings ? '✅' : '❌'}</td>
                          <td className="py-2.5 text-right">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              kw.status === 'optimal'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            }`}>
                              {kw.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Actionable SEO Checklist */}
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>On-Page SEO Audit Checklist</span>
                </h3>

                <div className="space-y-2">
                  {seoResult.checks.map((chk, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        {chk.status === 'pass' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : chk.status === 'warning' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                        <span className="text-slate-200 font-medium">{chk.item}</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase text-slate-500">{chk.impact} Impact</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Structured JSON-LD Article Schema */}
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-indigo-400" />
                    <span>Schema.org JSON-LD (Rich Snippet Markup)</span>
                  </h3>
                  <button
                    onClick={copySchemaJson}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                  >
                    {copiedSchema ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSchema ? 'Copied' : 'Copy JSON-LD'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-mono overflow-x-auto leading-relaxed">
                  {seoResult.schema_json_ld}
                </pre>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-3 min-h-[480px]">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-200">Ready to Simulate Google Search Results</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Paste your content, enter target keywords on the left, and click <strong className="text-slate-300">Run SEO & SERP Audit</strong> to preview desktop/mobile snippets, keyword prominence, and schema markup.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

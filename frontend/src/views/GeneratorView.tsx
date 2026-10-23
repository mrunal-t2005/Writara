import React, { useState, useEffect } from 'react';
import {
  Wand2,
  Sparkles,
  Save,
  Copy,
  Check,
  Repeat,
  FileSearch,
  FileEdit,
  Download,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  Radio,
  Clock,
  BookOpen
} from 'lucide-react';
import { BrandVoice, ContentTemplate, QualityMetrics } from '../types';
import { generateContent, createDocument } from '../services/api';

interface GeneratorViewProps {
  selectedTemplate: ContentTemplate | null;
  brandVoices: BrandVoice[];
  activeVoiceId: string;
  onRepurpose: (text: string) => void;
  onAuditQuality: (text: string, prompt: string) => void;
  onEditInStudio: (text: string, title: string) => void;
}

export const GeneratorView: React.FC<GeneratorViewProps> = ({
  selectedTemplate,
  brandVoices,
  activeVoiceId,
  onRepurpose,
  onAuditQuality,
  onEditInStudio,
}) => {
  const [topic, setTopic] = useState('');
  const [contentType, setContentType] = useState('blog_post');
  const [tone, setTone] = useState('Engaging & Authoritative');
  const [audience, setAudience] = useState('Tech Founders and Marketers');
  const [length, setLength] = useState('medium');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [voiceId, setVoiceId] = useState(activeVoiceId);

  const [generating, setGenerating] = useState(false);
  const [output, setOutput] = useState('');
  const [provider, setProvider] = useState('');
  const [metrics, setMetrics] = useState<QualityMetrics | null>(null);

  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [docTitle, setDocTitle] = useState('');

  // Sync when template changes
  useEffect(() => {
    if (selectedTemplate) {
      setTopic(selectedTemplate.defaultPrompt);
      setContentType(selectedTemplate.contentType);
      setTone(selectedTemplate.tone);
      setAudience(selectedTemplate.audience);
      setDocTitle(selectedTemplate.title);
    }
  }, [selectedTemplate]);

  useEffect(() => {
    setVoiceId(activeVoiceId);
  }, [activeVoiceId]);

  const handleAddKeyword = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && keywordInput.trim()) {
      e.preventDefault();
      if (!keywords.includes(keywordInput.trim())) {
        setKeywords([...keywords, keywordInput.trim()]);
      }
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (kw: string) => {
    setKeywords(keywords.filter(k => k !== kw));
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setGenerating(true);
    setOutput('');
    setSaved(false);

    try {
      const res = await generateContent({
        topic,
        content_type: contentType,
        tone,
        audience,
        length,
        keywords,
        brand_voice_id: voiceId,
        custom_instructions: customInstructions,
      });

      setOutput(res.content);
      setProvider(res.provider);
      setMetrics(res.metrics);
      if (!docTitle) {
        setDocTitle(topic.slice(0, 40));
      }
    } catch (err) {
      console.error(err);
      alert('Generation error. Please check your network or API settings.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveDocument = async () => {
    if (!output) return;
    try {
      await createDocument({
        title: docTitle || topic.slice(0, 40) || 'Untitled Draft',
        content: output,
        content_type: contentType,
        tone,
        audience,
        tags: keywords,
        quality_score: metrics?.overall_score || 90.0,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error(e);
      alert('Failed to save document');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(docTitle || 'writara-draft').toLowerCase().replace(/\s+/g, '-')}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const wordCount = output ? output.trim().split(/\s+/).length : 0;
  const readingTime = Math.ceil(wordCount / 200);

  const contentTypes = [
    { id: 'blog_post', label: 'Blog Article' },
    { id: 'social_caption', label: 'Social Post' },
    { id: 'email_newsletter', label: 'Newsletter' },
    { id: 'product_description', label: 'Product Copy' },
    { id: 'ad_copy', label: 'Ad Copy (AIDA)' },
    { id: 'video_script', label: 'Video Script' },
  ];

  const toneOptions = [
    'Engaging & Authoritative',
    'Conversational & Friendly',
    'Persuasive & Direct',
    'Thought-Provoking',
    'Witty & Playful',
    'Formal & Academic',
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Wand2 className="w-6 h-6 text-violet-400" />
            <span>AI Content Generator Studio</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Construct structured prompts, customize persona parameters, and generate publication-ready drafts.
          </p>
        </div>

        {/* Brand voice active pill */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Brand Persona:</span>
          <select
            value={voiceId}
            onChange={(e) => setVoiceId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-violet-300 focus:outline-none focus:border-violet-500"
          >
            {brandVoices.map(v => (
              <option key={v.id} value={v.id} className="bg-slate-900 text-slate-200">
                {v.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Input Configuration (5 columns) */}
        <div className="lg:col-span-5 space-y-5 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl">
          {/* Content Type Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Content Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {contentTypes.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setContentType(t.id)}
                  className={`px-2.5 py-2 rounded-xl text-xs font-semibold transition-all text-center border ${
                    contentType === t.id
                      ? 'bg-violet-600 text-white border-violet-500 shadow-md shadow-violet-600/30'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt / Topic */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Topic, Prompt or Idea Brief <span className="text-rose-400">*</span>
              </label>
            </div>
            <textarea
              rows={4}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Create a compelling launch post for an AI-powered content platform that cuts drafting time by 80% while preserving brand voice..."
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 leading-relaxed"
            />
          </div>

          {/* Tone & Audience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Desired Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-200 focus:outline-none focus:border-violet-500"
              >
                {toneOptions.map(to => (
                  <option key={to} value={to} className="bg-slate-900 text-slate-200">
                    {to}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Target Audience
              </label>
              <input
                type="text"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g. SaaS Founders, Marketers"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          {/* Length & Keywords */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Output Length
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'short', label: 'Short (~300w)' },
                  { id: 'medium', label: 'Medium (~600w)' },
                  { id: 'long', label: 'In-Depth (~1200w)' }
                ].map(l => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setLength(l.id)}
                    className={`py-2 px-2 text-xs font-medium rounded-xl border transition-all text-center ${
                      length === l.id
                        ? 'bg-slate-800 text-violet-300 border-violet-500/50'
                        : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Target Keywords (Press Enter)
              </label>
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={handleAddKeyword}
                placeholder="Type keyword and press Enter..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500 mb-2"
              />
              <div className="flex flex-wrap gap-1.5">
                {keywords.map(kw => (
                  <span
                    key={kw}
                    className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20"
                  >
                    {kw}
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(kw)}
                      className="hover:text-rose-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            type="button"
            disabled={generating || !topic.trim()}
            onClick={handleGenerate}
            className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-xl transition-all ${
              generating || !topic.trim()
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-violet-600/30 hover:shadow-violet-600/50 active:scale-[0.98]'
            }`}
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Crafting With Intelligence...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Content Now</span>
              </>
            )}
          </button>
        </div>

        {/* Right Output Area (7 columns) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 min-h-[580px] flex flex-col justify-between">
            {/* Top Bar above output */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="Document Title..."
                  className="bg-transparent font-bold text-white text-base focus:outline-none focus:border-b focus:border-violet-500 placeholder:text-slate-600"
                />
                {provider && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/30">
                    {provider}
                  </span>
                )}
              </div>

              {output && (
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                    <strong>{wordCount}</strong> words
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    ~{readingTime} min read
                  </span>
                  {metrics && (
                    <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Score: {metrics.overall_score}%
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Output Content */}
            <div className="py-6 flex-1 overflow-y-auto max-h-[520px]">
              {generating ? (
                <div className="h-72 flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center animate-bounce">
                    <Sparkles className="w-6 h-6 text-violet-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-200">Writara AI is synthesizing your draft...</p>
                    <p className="text-xs text-slate-400">Harmonizing brand voice, structuring hooks, and optimizing readability</p>
                  </div>
                </div>
              ) : output ? (
                <div className="prose prose-invert prose-violet max-w-none text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {output}
                </div>
              ) : (
                <div className="h-72 flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-800 rounded-2xl">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800/60 flex items-center justify-center text-slate-500 mb-3">
                    <Wand2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-300 mb-1">Your Generated Content Will Appear Here</h3>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Configure your parameters on the left and hit <strong className="text-slate-300">Generate Content Now</strong>.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Action Toolbar */}
            {output && (
              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download (.md)</span>
                  </button>
                  <button
                    onClick={handleSaveDocument}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 text-xs font-medium transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saved ? 'Saved!' : 'Save Draft'}</span>
                  </button>
                </div>

                {/* Signature Features Fast Handoff */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onRepurpose(output)}
                    title="Convert into LinkedIn, Twitter Thread, Instagram, Newsletter"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500/10 text-pink-300 border border-pink-500/20 hover:bg-pink-500/20 text-xs font-semibold transition-all hover:scale-105"
                  >
                    <Repeat className="w-3.5 h-3.5" />
                    <span>Repurpose</span>
                  </button>
                  <button
                    onClick={() => onAuditQuality(output, topic)}
                    title="Audit Flesch score and detect unverified factual claims"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20 text-xs font-semibold transition-all hover:scale-105"
                  >
                    <FileSearch className="w-3.5 h-3.5" />
                    <span>Quality Audit</span>
                  </button>
                  <button
                    onClick={() => onEditInStudio(output, docTitle || topic)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600/20 text-violet-300 border border-violet-500/30 hover:bg-violet-600/30 text-xs font-semibold transition-all hover:scale-105"
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    <span>Smart Editor</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

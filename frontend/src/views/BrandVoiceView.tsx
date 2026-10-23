import React, { useState } from 'react';
import {
  Radio,
  Sparkles,
  Plus,
  Trash2,
  Check,
  CheckCircle2,
  Sliders,
  ShieldAlert,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { BrandVoice } from '../types';
import { analyzeBrandVoiceSample, createBrandVoice, deleteBrandVoice } from '../services/api';

interface BrandVoiceViewProps {
  brandVoices: BrandVoice[];
  activeVoiceId: string;
  setActiveVoiceId: (id: string) => void;
  onRefreshVoices: () => void;
}

export const BrandVoiceView: React.FC<BrandVoiceViewProps> = ({
  brandVoices,
  activeVoiceId,
  setActiveVoiceId,
  onRefreshVoices,
}) => {
  const [activeTab, setActiveTab] = useState<'library' | 'analyze'>('library');

  // Analyzer state
  const [sampleText, setSampleText] = useState('');
  const [voiceName, setVoiceName] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [extractedVoice, setExtractedVoice] = useState<BrandVoice | null>(null);

  // Manual / extracted edit state
  const [saving, setSaving] = useState(false);

  const handleAnalyze = async () => {
    if (!sampleText.trim()) return;
    setAnalyzing(true);
    try {
      const res = await analyzeBrandVoiceSample(sampleText, voiceName || 'Custom Brand Persona');
      setExtractedVoice(res);
    } catch (e) {
      console.error(e);
      alert('Error analyzing sample text');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveExtracted = async () => {
    if (!extractedVoice) return;
    setSaving(true);
    try {
      await createBrandVoice({
        name: extractedVoice.name || voiceName || 'New Brand Voice',
        industry: extractedVoice.industry || 'Digital Technology',
        voice_attributes: extractedVoice.voice_attributes,
        banned_phrases: extractedVoice.banned_phrases,
        preferred_keywords: extractedVoice.preferred_keywords,
        guidelines: extractedVoice.guidelines,
        sample_text: sampleText,
        is_default: true,
      });
      await onRefreshVoices();
      setActiveTab('library');
      setExtractedVoice(null);
      setSampleText('');
      setVoiceName('');
    } catch (e) {
      console.error(e);
      alert('Failed to save brand voice profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this brand voice profile?')) {
      await deleteBrandVoice(id);
      onRefreshVoices();
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[11px] font-semibold mb-1">
            <Radio className="w-3 h-3 text-amber-400" />
            <span>Signature Engine #2</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Brand Voice Memory
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Train Writara on your writing samples. It extracts and remembers your tone, preferred vocabulary, and banned phrases for future drafts.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('library')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'library'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Voice Library ({brandVoices.length})
          </button>
          <button
            onClick={() => setActiveTab('analyze')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'analyze'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Train New Voice</span>
          </button>
        </div>
      </div>

      {activeTab === 'library' ? (
        /* Brand Voice Library */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brandVoices.map((voice) => {
            const isActive = voice.id === activeVoiceId;
            return (
              <div
                key={voice.id}
                onClick={() => setActiveVoiceId(voice.id)}
                className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between relative group ${
                  isActive
                    ? 'bg-slate-900/90 border-amber-500/60 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/20'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`}></span>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {voice.industry || 'General Brand'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {isActive && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Active Persona
                        </span>
                      )}
                      {brandVoices.length > 1 && (
                        <button
                          onClick={(e) => handleDelete(voice.id, e)}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-amber-200 transition-colors">
                    {voice.name}
                  </h3>

                  {/* Attributes Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {voice.voice_attributes.map((attr, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700"
                      >
                        {attr}
                      </span>
                    ))}
                  </div>

                  {/* Guidelines */}
                  {voice.guidelines && (
                    <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 mb-4 leading-relaxed">
                      <strong className="text-amber-400 block mb-1">Tone & Cadence Rules:</strong>
                      {voice.guidelines}
                    </div>
                  )}

                  {/* Banned Phrases */}
                  {voice.banned_phrases.length > 0 && (
                    <div className="space-y-1 mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" /> Banned Buzzwords
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {voice.banned_phrases.map((bp, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 line-through border border-rose-500/20"
                          >
                            {bp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    Preferred: {voice.preferred_keywords.slice(0, 2).join(', ') || 'Dynamic'}
                  </span>
                  <button
                    type="button"
                    className={`font-semibold transition-colors ${
                      isActive ? 'text-amber-400' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {isActive ? '✓ In Use' : 'Set as Active'}
                  </button>
                </div>
              </div>
            );
          })}

          {/* Quick Create Card */}
          <div
            onClick={() => setActiveTab('analyze')}
            className="p-8 rounded-3xl border border-dashed border-slate-800 hover:border-amber-500/50 bg-slate-900/30 hover:bg-slate-900/60 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-3 group min-h-[300px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Train a New Brand Voice</h3>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Paste any article or writing sample and let AI reverse-engineer your signature tone.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Analyze Writing Sample Tab */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 space-y-5 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Brand Persona Name
              </label>
              <input
                type="text"
                value={voiceName}
                onChange={(e) => setVoiceName(e.target.value)}
                placeholder="e.g. Modern Minimalist SaaS, Direct Founder Voice"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Paste Sample Writing or Brand Rules <span className="text-rose-400">*</span>
                </label>
                <span className="text-[11px] text-slate-500">
                  {sampleText.trim().split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <textarea
                rows={10}
                value={sampleText}
                onChange={(e) => setSampleText(e.target.value)}
                placeholder="Paste 1-3 paragraphs of your best-performing blog, newsletter, or company mission statement. Writara will decode the voice parameters..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 font-mono leading-relaxed"
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={analyzing || !sampleText.trim()}
              className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-xl transition-all ${
                analyzing || !sampleText.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-600/30 active:scale-[0.98]'
              }`}
            >
              {analyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Extracting Tone DNA & Rules...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Sample & Extract Voice</span>
                </>
              )}
            </button>
          </div>

          {/* Right: Extracted Result Preview */}
          <div className="lg:col-span-6 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 min-h-[460px] flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <Radio className="w-4 h-4 text-amber-400" />
                <span>Extracted Persona DNA</span>
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Review the reverse-engineered parameters before saving to your persistent memory.
              </p>

              {extractedVoice ? (
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Detected Tone Attributes
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {extractedVoice.voice_attributes.map((attr, i) => (
                        <span
                          key={i}
                          className="text-xs px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold"
                        >
                          {attr}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Editorial Guidelines
                    </span>
                    <p className="text-xs text-slate-200 bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed">
                      {extractedVoice.guidelines}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Signature Vocabulary & Phrases
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {extractedVoice.preferred_keywords.map((kw, i) => (
                        <span
                          key={i}
                          className="text-xs px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                        >
                          +{kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block mb-1.5">
                      Restricted / Banned Buzzwords
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {extractedVoice.banned_phrases.map((bp, i) => (
                        <span
                          key={i}
                          className="text-xs px-2.5 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20 line-through"
                        >
                          {bp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-800 rounded-2xl">
                  <Radio className="w-8 h-8 text-slate-600 mb-2" />
                  <p className="text-sm font-semibold text-slate-300 mb-1">Ready to decode your writing sample</p>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Paste sample paragraphs on the left to extract tone keywords, rhythm patterns, and banned words.
                  </p>
                </div>
              )}
            </div>

            {extractedVoice && (
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  onClick={() => setExtractedVoice(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Discard
                </button>
                <button
                  onClick={handleSaveExtracted}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/30 transition-all active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save & Activate Voice'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

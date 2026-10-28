import React from 'react';
import { Sparkles, Key, Plus, CheckCircle2, Sliders, Sun, Moon } from 'lucide-react';
import { BrandVoice } from '../types';
import { getApiKey } from '../services/api';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  brandVoices: BrandVoice[];
  activeVoiceId: string;
  setActiveVoiceId: (id: string) => void;
  onOpenApiKeyModal: () => void;
  onNewDraft: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  setActiveTab,
  brandVoices,
  activeVoiceId,
  setActiveVoiceId,
  onOpenApiKeyModal,
  onNewDraft,
  theme = 'dark',
  onToggleTheme,
}) => {
  const hasKey = !!getApiKey();
  const activeVoice = brandVoices.find(v => v.id === activeVoiceId) || brandVoices[0];

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20 ring-1 ring-white/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xl tracking-tight text-white">Writara</span>
            <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 uppercase">
              AI Studio
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">Intelligent Content Operating System</p>
        </div>
      </div>

      {/* Middle: Active Brand Voice Indicator */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="text-slate-400">Voice:</span>
        <select
          value={activeVoiceId}
          onChange={(e) => setActiveVoiceId(e.target.value)}
          className="bg-transparent text-violet-300 font-medium focus:outline-none cursor-pointer pr-1"
        >
          {brandVoices.map(v => (
            <option key={v.id} value={v.id} className="bg-slate-900 text-slate-200">
              {v.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => setActiveTab('brand_voice')}
          title="Configure Brand Voices"
          className="text-slate-400 hover:text-white transition-colors"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* API Key Status Pill */}
        <button
          onClick={onOpenApiKeyModal}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
            hasKey
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
              : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-violet-500/50'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {hasKey ? 'Gemini API Active' : 'API Settings'}
          </span>
          {hasKey && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
        </button>

        {/* Light/Dark Mode Switcher */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode (White Background)'}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-700/80 bg-slate-800/40 hover:bg-slate-800 text-slate-300 hover:text-white transition-all"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-violet-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>
        )}

        {/* Quick New Draft Button */}
        <button
          onClick={onNewDraft}
          className="flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md shadow-violet-600/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Content</span>
        </button>
      </div>
    </header>
  );
};

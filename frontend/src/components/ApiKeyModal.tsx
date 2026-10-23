import React, { useState } from 'react';
import { X, Key, ShieldCheck, ExternalLink, Check, AlertCircle } from 'lucide-react';
import { getApiKey, setApiKey } from '../services/api';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onKeySaved }) => {
  const [keyInput, setKeyInput] = useState(getApiKey());
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setApiKey(keyInput);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onKeySaved();
      onClose();
    }, 700);
  };

  const handleClear = () => {
    setKeyInput('');
    setApiKey('');
    onKeySaved();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">AI Engine & API Configuration</h3>
            <p className="text-xs text-slate-400">Configure your Google Gemini API key</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-violet-950/20 border border-violet-500/20 text-xs text-slate-300 leading-relaxed">
            <span className="font-semibold text-violet-300">⚡ Seamless Operation:</span> If you don't provide an API key, Writara will automatically use its high-fidelity local algorithmic engine so you can test all features offline.
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Google Gemini API Key
            </label>
            <div className="relative">
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Your key is stored securely in your browser's local storage.</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-violet-400 hover:text-violet-300 inline-flex items-center gap-1 hover:underline"
              >
                Get Free Key <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleClear}
              className="text-xs text-slate-400 hover:text-rose-400 font-medium px-2 py-1 transition-colors"
            >
              Reset to Mock Engine
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30 transition-all active:scale-95"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save Configuration</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

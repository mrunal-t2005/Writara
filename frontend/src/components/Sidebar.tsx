import React from 'react';
import {
  LayoutDashboard,
  Wand2,
  FileEdit,
  Repeat,
  Radio,
  FileSearch,
  FolderKanban,
  Sparkles,
  Settings,
  Globe,
  Flame,
  Calendar,
  BarChart3
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenApiKeyModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenApiKeyModal,
}) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'generator',
      label: 'AI Generator',
      icon: Wand2,
      badge: 'Core',
      badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    },
    {
      id: 'editor',
      label: 'Smart Editor',
      icon: FileEdit,
      badge: null,
    },
    {
      id: 'repurpose',
      label: 'Content Repurposer',
      icon: Repeat,
      badge: '1-Click',
      badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    },
    {
      id: 'brand_voice',
      label: 'Brand Voice Memory',
      icon: Radio,
      badge: 'Memory',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'evaluator',
      label: 'Quality & Fact Audit',
      icon: FileSearch,
      badge: 'Radar',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'seo',
      label: 'SEO & SERP Suite',
      icon: Globe,
      badge: 'Rank',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    },
    {
      id: 'headlines',
      label: 'Headline A/B & Clichés',
      icon: Flame,
      badge: 'Viral',
      badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    },
    {
      id: 'calendar',
      label: 'Content Calendar',
      icon: Calendar,
      badge: 'Schedule',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'analytics',
      label: 'Analytics & Velocity',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'documents',
      label: 'Projects & Drafts',
      icon: FolderKanban,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-950/60 backdrop-blur-xl flex flex-col justify-between p-4 shrink-0">
      <div className="space-y-6">
        <div>
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
            Platform Modules
          </div>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-600/20 to-indigo-600/20 text-violet-200 border border-violet-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-violet-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Feature Highlights Card */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-violet-950/40 to-slate-900/60 border border-violet-500/20">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-xs font-semibold text-slate-200">Signature Suite</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
            Writara adapts to your voice, repurposes to all channels, and audits factuality in one place.
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-violet-300 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
            Zero tool-switching
          </div>
        </div>
      </div>

      {/* Bottom Profile / Settings */}
      <div className="pt-4 border-t border-slate-800/80 space-y-2">
        <button
          onClick={onOpenApiKeyModal}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 transition-colors"
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>API & Engine Settings</span>
        </button>

        <div className="px-3.5 py-2 flex items-center gap-3 rounded-xl bg-slate-900/40 border border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
            W
          </div>
          <div className="truncate">
            <div className="text-xs font-semibold text-slate-200 truncate">Workspace User</div>
            <div className="text-[10px] text-emerald-400 font-medium">Pro Creator Plan</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

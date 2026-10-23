import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  Search,
  Plus,
  FileText,
  Trash2,
  ExternalLink,
  Repeat,
  FileSearch,
  Copy,
  Check,
  Download,
  Calendar,
  Layers
} from 'lucide-react';
import { Document, Project } from '../types';
import { getDocuments, deleteDocument, getProjects, createProject } from '../services/api';

interface DocumentsViewProps {
  onOpenDocument: (doc: Document) => void;
  onRepurpose: (text: string) => void;
  onAuditQuality: (text: string, prompt: string) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  onOpenDocument,
  onRepurpose,
  onAuditQuality,
}) => {
  const [docs, setDocs] = useState<Document[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // New project modal
  const [showNewProj, setShowNewProj] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [d, p] = await Promise.all([
        getDocuments(selectedProjectId || undefined, searchTerm || undefined),
        getProjects(),
      ]);
      setDocs(d);
      setProjects(p);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedProjectId, searchTerm]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this document?')) {
      await deleteDocument(id);
      loadData();
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return;
    try {
      await createProject(newProjName, newProjDesc);
      setNewProjName('');
      setNewProjDesc('');
      setShowNewProj(false);
      loadData();
    } catch (err) {
      console.error(err);
      alert('Failed to create project');
    }
  };

  const handleCopy = (doc: Document, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(doc.content);
    setCopiedId(doc.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (doc: Document, e: React.MouseEvent) => {
    e.stopPropagation();
    const blob = new Blob([doc.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${doc.title.toLowerCase().replace(/\s+/g, '-')}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <FolderKanban className="w-6 h-6 text-violet-400" />
            <span>Workspace & Projects</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Organize drafts, monitor word metrics, and access past generated assets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search documents..."
              className="pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500 w-52 sm:w-64"
            />
          </div>

          <button
            onClick={() => setShowNewProj(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Plus className="w-4 h-4 text-violet-400" />
            <span>New Folder</span>
          </button>
        </div>
      </div>

      {/* Project Folders Horizontal Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedProjectId(null)}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border ${
            selectedProjectId === null
              ? 'bg-violet-600/20 text-violet-300 border-violet-500/40 shadow-sm'
              : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          All Documents ({docs.length})
        </button>
        {projects.map((p) => {
          const isSelected = selectedProjectId === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedProjectId(p.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border ${
                isSelected
                  ? 'bg-violet-600/20 text-violet-300 border-violet-500/40 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || '#8B5CF6' }}></span>
              <span>{p.name}</span>
              <span className="text-[10px] text-slate-500 font-normal">({p.doc_count})</span>
            </button>
          );
        })}
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading workspace documents...</div>
      ) : docs.length === 0 ? (
        <div className="p-16 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
          <FileText className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No documents found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Generate content in the AI Studio or start a new draft to save it to your workspace.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {docs.map((doc) => (
            <div
              key={doc.id}
              onClick={() => onOpenDocument(doc)}
              className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-violet-500/40 hover:bg-slate-900/90 cursor-pointer transition-all flex flex-col justify-between group relative"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20">
                    {doc.content_type.replace('_', ' ')}
                  </span>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleCopy(doc, e)}
                      title="Copy text"
                      className="p-1 rounded text-slate-400 hover:text-white"
                    >
                      {copiedId === doc.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={(e) => handleDownload(doc, e)}
                      title="Download Markdown"
                      className="p-1 rounded text-slate-400 hover:text-white"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(doc.id, e)}
                      title="Delete draft"
                      className="p-1 rounded text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white mb-2 line-clamp-1 group-hover:text-violet-300 transition-colors">
                  {doc.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                  {doc.content.replace(/[#*`]/g, '')}
                </p>

                {doc.tags && doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {doc.tags.map((t, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500 mb-3">
                  <span>{doc.word_count} words</span>
                  {doc.quality_score && (
                    <span className="text-emerald-400 font-semibold">
                      Score: {doc.quality_score}%
                    </span>
                  )}
                </div>

                {/* Bottom Quick Handoffs */}
                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRepurpose(doc.content);
                    }}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <Repeat className="w-3 h-3" />
                    <span>Repurpose</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAuditQuality(doc.content, doc.title);
                    }}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <FileSearch className="w-3 h-3" />
                    <span>Audit</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Project Modal */}
      {showNewProj && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6">
            <h3 className="text-base font-bold text-white mb-1">Create New Project Folder</h3>
            <p className="text-xs text-slate-400 mb-4">Organize your campaigns, client deliverables, or topics.</p>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Folder Name
                </label>
                <input
                  type="text"
                  required
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  placeholder="e.g. Q4 Growth Campaign"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  placeholder="e.g. Social, emails, and landing page copies"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewProj(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-md shadow-violet-600/30"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  Share2,
  MessageCircle,
  Camera,
  Mail,
  Video,
  FileText,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ExternalLink,
  Filter,
  Check,
  FileEdit,
  X
} from 'lucide-react';
import { ScheduledPost } from '../types';
import { getCalendarPosts, createCalendarPost, updateCalendarPost, deleteCalendarPost } from '../services/api';

interface CalendarViewProps {
  onEditInStudio: (text: string, title: string) => void;
  onRepurpose: (text: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  onEditInStudio,
  onRepurpose,
}) => {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [platformFilter, setPlatformFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // New post modal
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newPlatform, setNewPlatform] = useState('linkedin');
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newTime, setNewTime] = useState('10:00 AM');
  const [saving, setSaving] = useState(false);

  const loadPosts = async () => {
    try {
      const data = await getCalendarPosts();
      setPosts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    setSaving(true);
    try {
      await createCalendarPost({
        title: newTitle,
        content: newContent,
        platform: newPlatform,
        scheduled_date: newDate,
        scheduled_time: newTime,
        status: 'scheduled',
      });
      setShowModal(false);
      setNewTitle('');
      setNewContent('');
      loadPosts();
    } catch (err) {
      console.error(err);
      alert('Failed to schedule post');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (post: ScheduledPost) => {
    const nextStatus = post.status === 'published' ? 'scheduled' : 'published';
    await updateCalendarPost(post.id, { status: nextStatus });
    loadPosts();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this scheduled post?')) {
      await deleteCalendarPost(id);
      loadPosts();
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'linkedin': return <Share2 className="w-4 h-4 text-blue-400" />;
      case 'twitter': return <MessageCircle className="w-4 h-4 text-sky-400" />;
      case 'instagram': return <Camera className="w-4 h-4 text-pink-400" />;
      case 'email': return <Mail className="w-4 h-4 text-amber-400" />;
      case 'youtube': return <Video className="w-4 h-4 text-rose-400" />;
      default: return <FileText className="w-4 h-4 text-purple-400" />;
    }
  };

  const filteredPosts = posts.filter(p => {
    const matchPlat = platformFilter === 'all' || p.platform.toLowerCase() === platformFilter.toLowerCase();
    const matchStat = statusFilter === 'all' || p.status.toLowerCase() === statusFilter.toLowerCase();
    return matchPlat && matchStat;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px] font-semibold mb-1">
            <CalendarIcon className="w-3 h-3 text-emerald-400" />
            <span>Multi-Channel Publisher</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Content Calendar & Publishing Planner
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Orchestrate and schedule your multi-platform campaigns across LinkedIn, X/Twitter, Newsletters, and Blogs.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-lg shadow-violet-600/30 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Post</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1">
            <Filter className="w-3 h-3" /> Platform:
          </span>
          {['all', 'linkedin', 'twitter', 'instagram', 'email', 'youtube', 'blog'].map(plat => (
            <button
              key={plat}
              onClick={() => setPlatformFilter(plat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all border ${
                platformFilter === plat
                  ? 'bg-violet-600 text-white border-violet-500 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {plat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Status:</span>
          {['all', 'scheduled', 'published', 'draft'].map(stat => (
            <button
              key={stat}
              onClick={() => setStatusFilter(stat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all border ${
                statusFilter === stat
                  ? 'bg-slate-800 text-violet-300 border-violet-500/50'
                  : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {stat}
            </button>
          ))}
        </div>
      </div>

      {/* Scheduled Timeline & Cards */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading publishing schedule...</div>
      ) : filteredPosts.length === 0 ? (
        <div className="p-16 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
          <CalendarIcon className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No scheduled posts found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Schedule a post above or repurpose generated content directly to your multi-channel calendar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-violet-500/40 hover:bg-slate-900/90 transition-all flex flex-col justify-between group space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                      {getPlatformIcon(post.platform)}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                        {post.platform}
                      </span>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{post.scheduled_date} • {post.scheduled_time}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDelete(post.id, e)}
                    className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-base font-bold text-white mb-2 line-clamp-1 group-hover:text-violet-300 transition-colors">
                  {post.title}
                </h3>
                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed font-sans bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
                  {post.content}
                </p>
              </div>

              <div>
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleToggleStatus(post)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${
                      post.status === 'published'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {post.status === 'published' ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    <span className="capitalize">{post.status}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onRepurpose(post.content)}
                      className="px-2.5 py-1 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 text-[11px] font-semibold transition-colors"
                    >
                      Repurpose
                    </button>
                    <button
                      onClick={() => onEditInStudio(post.content, post.title)}
                      className="px-2.5 py-1 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 text-[11px] font-semibold transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Schedule Multi-Channel Post</h3>
                <p className="text-xs text-slate-400">Assign release slot and destination platform</p>
              </div>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Platform
                  </label>
                  <select
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-violet-500 capitalize"
                  >
                    <option value="linkedin">LinkedIn</option>
                    <option value="twitter">X / Twitter</option>
                    <option value="instagram">Instagram</option>
                    <option value="email">Email Newsletter</option>
                    <option value="youtube">YouTube / Shorts</option>
                    <option value="blog">Blog Article</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Target Time
                  </label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="e.g. 10:00 AM"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Scheduled Date
                </label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Headline / Post Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. The 3 Pillars of AI Automation in 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Post Content
                </label>
                <textarea
                  rows={5}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Paste or write your scheduled copy here..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-violet-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
                >
                  {saving ? 'Scheduling...' : 'Confirm Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

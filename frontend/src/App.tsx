import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ApiKeyModal } from './components/ApiKeyModal';
import { DashboardView } from './views/DashboardView';
import { GeneratorView } from './views/GeneratorView';
import { EditorView } from './views/EditorView';
import { RepurposerView } from './views/RepurposerView';
import { BrandVoiceView } from './views/BrandVoiceView';
import { QualityEvaluatorView } from './views/QualityEvaluatorView';
import { SeoView } from './views/SeoView';
import { DocumentsView } from './views/DocumentsView';
import { BrandVoice, ContentTemplate, Document } from './types';
import { getBrandVoices, checkHealth } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [brandVoices, setBrandVoices] = useState<BrandVoice[]>([]);
  const [activeVoiceId, setActiveVoiceId] = useState('');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // Cross-view state handoffs
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);
  const [repurposeSource, setRepurposeSource] = useState('');
  const [auditSource, setAuditSource] = useState<{ text: string; prompt: string }>({ text: '', prompt: '' });
  const [seoSource, setSeoSource] = useState<{ text: string; keyword: string }>({ text: '', keyword: '' });
  const [editorDoc, setEditorDoc] = useState<{ text: string; title: string; id?: string }>({
    text: '',
    title: 'Untitled Draft',
  });

  const loadVoices = async () => {
    try {
      const voices = await getBrandVoices();
      setBrandVoices(voices);
      if (voices.length > 0 && !activeVoiceId) {
        const def = voices.find(v => v.is_default) || voices[0];
        setActiveVoiceId(def.id);
      }
    } catch (e) {
      console.error('Error fetching brand voices:', e);
    }
  };

  useEffect(() => {
    loadVoices();
  }, []);

  // Handlers for cross-module handoffs
  const handleSelectTemplate = (template: ContentTemplate) => {
    setSelectedTemplate(template);
    setActiveTab('generator');
  };

  const handleRepurposeHandoff = (text: string) => {
    setRepurposeSource(text);
    setActiveTab('repurpose');
  };

  const handleAuditHandoff = (text: string, prompt: string = '') => {
    setAuditSource({ text, prompt });
    setActiveTab('evaluator');
  };

  const handleSeoHandoff = (text: string, keyword: string = '') => {
    setSeoSource({ text, keyword });
    setActiveTab('seo');
  };

  const handleEditHandoff = (text: string, title: string = 'Untitled Draft', docId?: string) => {
    setEditorDoc({ text, title, id: docId });
    setActiveTab('editor');
  };

  const handleOpenDocument = (doc: Document) => {
    handleEditHandoff(doc.content, doc.title, doc.id);
  };

  const handleNewDraft = () => {
    setSelectedTemplate(null);
    setActiveTab('generator');
  };

  return (
    <div className="min-h-screen bg-[#0b0d14] text-slate-100 flex flex-col font-sans selection:bg-violet-600/30 selection:text-violet-200">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        brandVoices={brandVoices}
        activeVoiceId={activeVoiceId}
        setActiveVoiceId={setActiveVoiceId}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onNewDraft={handleNewDraft}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        />

        {/* Center Main Stage */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-[#0b0d14] via-[#0d101a] to-[#0b0d14]">
          {activeTab === 'dashboard' && (
            <DashboardView
              onSelectTemplate={handleSelectTemplate}
              onOpenDocument={handleOpenDocument}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'generator' && (
            <GeneratorView
              selectedTemplate={selectedTemplate}
              brandVoices={brandVoices}
              activeVoiceId={activeVoiceId}
              onRepurpose={handleRepurposeHandoff}
              onAuditQuality={handleAuditHandoff}
              onAuditSeo={handleSeoHandoff}
              onEditInStudio={handleEditHandoff}
            />
          )}

          {activeTab === 'editor' && (
            <EditorView
              initialText={editorDoc.text}
              initialTitle={editorDoc.title}
              documentId={editorDoc.id}
              onSaved={loadVoices}
            />
          )}

          {activeTab === 'repurpose' && (
            <RepurposerView
              initialContent={repurposeSource}
              brandVoices={brandVoices}
              activeVoiceId={activeVoiceId}
              onEditInStudio={handleEditHandoff}
            />
          )}

          {activeTab === 'brand_voice' && (
            <BrandVoiceView
              brandVoices={brandVoices}
              activeVoiceId={activeVoiceId}
              setActiveVoiceId={setActiveVoiceId}
              onRefreshVoices={loadVoices}
            />
          )}

          {activeTab === 'evaluator' && (
            <QualityEvaluatorView
              initialContent={auditSource.text}
              initialPrompt={auditSource.prompt}
              onEditInStudio={handleEditHandoff}
            />
          )}

          {activeTab === 'seo' && (
            <SeoView
              initialContent={seoSource.text}
              initialKeyword={seoSource.keyword}
              onEditInStudio={handleEditHandoff}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentsView
              onOpenDocument={handleOpenDocument}
              onRepurpose={handleRepurposeHandoff}
              onAuditQuality={handleAuditHandoff}
            />
          )}
        </main>
      </div>

      {/* Global API Key Configuration Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onKeySaved={loadVoices}
      />
    </div>
  );
}

export default App;

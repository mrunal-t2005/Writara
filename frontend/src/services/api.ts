import { QualityMetrics, BrandVoice, Document, Project, AnalyticsData } from '../types';

const API_BASE = '/api';

export function getApiKey(): string {
  return localStorage.getItem('writara_gemini_key') || '';
}

export function setApiKey(key: string): void {
  localStorage.setItem('writara_gemini_key', key.trim());
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

export async function generateContent(params: {
  topic: string;
  content_type: string;
  tone?: string;
  audience?: string;
  length?: string;
  keywords?: string[];
  brand_voice_id?: string;
  language?: string;
  custom_instructions?: string;
}): Promise<{
  id: string;
  content: string;
  content_type: string;
  provider: string;
  metrics: QualityMetrics;
}> {
  const apiKey = getApiKey();
  const res = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...params, api_key: apiKey }),
  });
  if (!res.ok) throw new Error('Failed to generate content');
  return res.json();
}

export async function smartEdit(params: {
  action: string;
  text: string;
  target_tone?: string;
  target_language?: string;
  custom_prompt?: string;
}): Promise<{
  action: string;
  original_text: string;
  edited_text: string;
  metrics: QualityMetrics;
}> {
  const apiKey = getApiKey();
  const res = await fetch(`${API_BASE}/edit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...params, api_key: apiKey }),
  });
  if (!res.ok) throw new Error('Failed to perform edit');
  return res.json();
}

export async function repurposeContent(params: {
  source_content: string;
  target_formats?: string[];
  brand_voice_id?: string;
}): Promise<{
  source_length: number;
  formats_generated: number;
  repurposed: Record<string, string>;
}> {
  const apiKey = getApiKey();
  const res = await fetch(`${API_BASE}/repurpose`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...params, api_key: apiKey }),
  });
  if (!res.ok) throw new Error('Failed to repurpose content');
  return res.json();
}

export async function evaluateQuality(params: {
  text: string;
  prompt?: string;
  content_type?: string;
  target_tone?: string;
}): Promise<QualityMetrics> {
  const apiKey = getApiKey();
  const res = await fetch(`${API_BASE}/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...params, api_key: apiKey }),
  });
  if (!res.ok) throw new Error('Failed to evaluate content quality');
  return res.json();
}

export async function analyzeSeo(params: {
  content: string;
  target_keyword?: string;
  secondary_keywords?: string[];
  slug?: string;
  site_url?: string;
}): Promise<import('../types').SeoAnalysisResult> {
  const apiKey = getApiKey();
  const res = await fetch(`${API_BASE}/seo/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...params, api_key: apiKey }),
  });
  if (!res.ok) throw new Error('Failed to analyze SEO metrics');
  return res.json();
}

// Brand Voice
export async function getBrandVoices(): Promise<BrandVoice[]> {
  const res = await fetch(`${API_BASE}/brand-voice`);
  if (!res.ok) throw new Error('Failed to fetch brand voices');
  return res.json();
}

export async function createBrandVoice(voice: Partial<BrandVoice>): Promise<{ id: string }> {
  const res = await fetch(`${API_BASE}/brand-voice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(voice),
  });
  if (!res.ok) throw new Error('Failed to create brand voice');
  return res.json();
}

export async function deleteBrandVoice(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/brand-voice/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete brand voice');
}

export async function analyzeBrandVoiceSample(sample_text: string, name?: string): Promise<BrandVoice> {
  const apiKey = getApiKey();
  const res = await fetch(`${API_BASE}/brand-voice/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sample_text, name, api_key: apiKey }),
  });
  if (!res.ok) throw new Error('Failed to analyze brand voice sample');
  return res.json();
}

// Documents
export async function getDocuments(project_id?: string, search?: string): Promise<Document[]> {
  const params = new URLSearchParams();
  if (project_id) params.append('project_id', project_id);
  if (search) params.append('search', search);
  const res = await fetch(`${API_BASE}/documents?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch documents');
  return res.json();
}

export async function createDocument(doc: {
  title: string;
  content: string;
  content_type: string;
  project_id?: string;
  tone?: string;
  audience?: string;
  tags?: string[];
  quality_score?: number;
}): Promise<{ id: string }> {
  const res = await fetch(`${API_BASE}/documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(doc),
  });
  if (!res.ok) throw new Error('Failed to save document');
  return res.json();
}

export async function updateDocument(id: string, updates: Partial<Document>): Promise<void> {
  const res = await fetch(`${API_BASE}/documents/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update document');
}

export async function deleteDocument(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/documents/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete document');
}

// Projects
export async function getProjects(): Promise<Project[]> {
  const res = await fetch(`${API_BASE}/projects`);
  if (!res.ok) throw new Error('Failed to fetch projects');
  return res.json();
}

export async function createProject(name: string, description?: string, color?: string): Promise<{ id: string }> {
  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description, color }),
  });
  if (!res.ok) throw new Error('Failed to create project');
  return res.json();
}

// Analytics
export async function getAnalytics(): Promise<AnalyticsData> {
  const res = await fetch(`${API_BASE}/analytics`);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

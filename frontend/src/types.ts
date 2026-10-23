export interface QualityMetrics {
  overall_score: number;
  readability: {
    score: number;
    grade_level: number;
    interpretation: string;
    words: number;
    sentences: number;
    avg_words_per_sentence: number;
  };
  adherence_score: number;
  tone_consistency_score: number;
  clarity_score: number;
  word_count: number;
  character_count: number;
  seo_keywords: Array<{ keyword: string; count: number; density: string }>;
  fact_check_flags: Array<{ claim: string; reason: string; severity: string }>;
  suggestions: string[];
  ai_editorial_review?: string;
}

export interface BrandVoice {
  id: string;
  name: string;
  company_or_creator?: string;
  industry?: string;
  voice_attributes: string[];
  banned_phrases: string[];
  preferred_keywords: string[];
  sample_text?: string;
  guidelines?: string;
  is_default: boolean;
  created_at?: string;
}

export interface Document {
  id: string;
  project_id: string;
  title: string;
  content: string;
  content_type: string;
  tone?: string;
  audience?: string;
  word_count: number;
  tags: string[];
  quality_score?: number;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  doc_count: number;
  created_at: string;
  updated_at: string;
}

export interface ContentTemplate {
  id: string;
  title: string;
  description: string;
  category: 'blog' | 'social' | 'marketing' | 'sales' | 'video' | 'copywriting';
  icon: string;
  contentType: string;
  defaultPrompt: string;
  tone: string;
  audience: string;
}

export interface AnalyticsData {
  total_words_generated: number;
  total_documents: number;
  total_generations: number;
  hours_saved: number;
  content_type_breakdown: Record<string, number>;
}

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
  cost_saved?: number;
  avg_quality_score?: number;
  total_scheduled_posts?: number;
  content_type_breakdown: Record<string, number>;
  platform_breakdown?: Record<string, number>;
}

export interface ScheduledPost {
  id: string;
  title: string;
  content: string;
  platform: 'linkedin' | 'twitter' | 'instagram' | 'email' | 'blog' | 'youtube' | string;
  scheduled_date: string;
  scheduled_time: string;
  status: 'draft' | 'scheduled' | 'published';
  created_at: string;
  updated_at: string;
}


export interface SeoKeywordMetric {
  keyword: string;
  is_primary: boolean;
  count: number;
  density: string;
  density_num: number;
  in_title: boolean;
  in_first_100_words: boolean;
  in_headings: boolean;
  status: 'optimal' | 'underused' | 'stuffed';
}

export interface SeoCheck {
  item: string;
  status: 'pass' | 'warning' | 'fail';
  impact: string;
}

export interface SeoAnalysisResult {
  seo_score: number;
  meta_title: string;
  meta_title_length: number;
  meta_description: string;
  meta_description_length: number;
  serp_url: string;
  word_count: number;
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
    total_headings: number;
  };
  keywords: SeoKeywordMetric[];
  checks: SeoCheck[];
  schema_json_ld: string;
}

export interface HeadlineVariation {
  angle: string;
  headline: string;
  ctr_score: number;
  emotional_hook: string;
  rationale: string;
  type?: string;
  char_count?: number;
  word_count?: number;
}

export interface ClicheFinding {
  cliche: string;
  occurrences: number;
  suggestion: string;
  severity: 'high' | 'medium' | 'low';
}

export interface ClicheScanResult {
  originality_score: number;
  cliches_found_count: number;
  verdict: string;
  findings: ClicheFinding[];
}



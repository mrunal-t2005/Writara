import { ContentTemplate } from '../types';

export const TEMPLATES: ContentTemplate[] = [
  {
    id: 'blog-post',
    title: 'Comprehensive SEO Blog Post',
    description: 'Structured long-form article with engaging hook, clear H2/H3 subheadings, and actionable takeaways.',
    category: 'blog',
    icon: 'FileText',
    contentType: 'blog_post',
    defaultPrompt: 'How AI-driven automation is transforming sustainable supply chains in 2026',
    tone: 'Informative & Engaging',
    audience: 'Supply Chain Directors & Tech Innovators'
  },
  {
    id: 'viral-linkedin',
    title: 'High-Engagement LinkedIn Post',
    description: 'Punchy hook, concise line breaks, value-packed insights, and a discussion-sparking question.',
    category: 'social',
    icon: 'Linkedin',
    contentType: 'social_caption',
    defaultPrompt: 'The hardest lesson I learned scaling a SaaS startup from 0 to $1M ARR in 18 months',
    tone: 'Thought-Provoking & Authentic',
    audience: 'Founders, Tech Executives, and Creators'
  },
  {
    id: 'product-email',
    title: 'Product Launch Newsletter',
    description: 'High-converting announcement email featuring value-focused benefits, teaser story, and clear CTA.',
    category: 'marketing',
    icon: 'Mail',
    contentType: 'email_newsletter',
    defaultPrompt: 'Introducing Writara 2.0: The unified AI content operating system for modern creators',
    tone: 'Excited & Persuasive',
    audience: 'Existing Subscribers & Power Users'
  },
  {
    id: 'instagram-caption',
    title: 'Instagram Carousel & Caption',
    description: 'Multi-slide storytelling script with magnetic hook, actionable tips, and curated hashtags.',
    category: 'social',
    icon: 'Instagram',
    contentType: 'instagram_caption',
    defaultPrompt: '5 subtle habits that distinguish top 1% content creators from everyone else',
    tone: 'Inspirational & Relatable',
    audience: 'Aspiring Creators and Freelancers'
  },
  {
    id: 'short-video-script',
    title: 'Viral Reel / TikTok Script',
    description: '45-second short-form script with visual cues, timestamped narration, and punchy hook.',
    category: 'video',
    icon: 'Video',
    contentType: 'video_script',
    defaultPrompt: 'Stop using generic AI prompts: Here is the 3-step prompt framework top agencies use',
    tone: 'Energetic & Fast-Paced',
    audience: 'Gen Z & Millennial Marketers'
  },
  {
    id: 'ad-copy-frameworks',
    title: 'High-Converting Ad Copy (AIDA/PAS)',
    description: 'Direct-response ad variations formatted in Attention-Interest-Desire-Action and Problem-Agitation-Solution.',
    category: 'copywriting',
    icon: 'Sparkles',
    contentType: 'ad_copy',
    defaultPrompt: 'An all-in-one ergonomic standing desk designed for remote software engineers',
    tone: 'Persuasive & Urgent',
    audience: 'Remote Tech Workers & Home Office Enthusiasts'
  },
  {
    id: 'product-description',
    title: 'E-Commerce Product Description',
    description: 'Sensory-rich, feature-to-benefit product listing engineered for buyer confidence and SEO.',
    category: 'sales',
    icon: 'ShoppingBag',
    contentType: 'product_description',
    defaultPrompt: 'Smart noise-canceling headphones with 60-hour battery and spatial audio',
    tone: 'Premium & Benefit-Focused',
    audience: 'Audiophiles & Frequent Travelers'
  },
  {
    id: 'press-release',
    title: 'Company Announcement & PR',
    description: 'Formal press release with boilerplate, quotes, and executive statement.',
    category: 'marketing',
    icon: 'Newspaper',
    contentType: 'blog_post',
    defaultPrompt: 'Series A funding announcement: Securing $12M to accelerate AI safety and creator tools',
    tone: 'Authoritative & Professional',
    audience: 'Tech Journalists & Investors'
  }
];

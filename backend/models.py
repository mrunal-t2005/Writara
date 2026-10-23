from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ContentGenerateRequest(BaseModel):
    topic: str = Field(..., description="Topic, prompt, idea, or raw brief")
    content_type: str = Field(..., description="e.g., blog_post, social_caption, email_newsletter, product_description, ad_copy, video_script, landing_page")
    tone: Optional[str] = "Professional yet Engaging"
    audience: Optional[str] = "General Tech Audience"
    length: Optional[str] = "medium"  # short, medium, long
    keywords: Optional[List[str]] = []
    brand_voice_id: Optional[str] = None
    language: Optional[str] = "English"
    custom_instructions: Optional[str] = None
    api_key: Optional[str] = None  # user can provide in request or use env

class SmartEditRequest(BaseModel):
    action: str = Field(..., description="'rewrite' | 'shorten' | 'expand' | 'tone' | 'grammar' | 'summarize' | 'translate'")
    text: str = Field(..., description="The selected text or full document")
    target_tone: Optional[str] = None
    target_language: Optional[str] = None
    custom_prompt: Optional[str] = None
    api_key: Optional[str] = None

class RepurposeRequest(BaseModel):
    source_content: str
    target_formats: List[str] = Field(default=["linkedin", "twitter_thread", "instagram_caption", "email_newsletter", "video_script"])
    brand_voice_id: Optional[str] = None
    api_key: Optional[str] = None

class QualityEvaluateRequest(BaseModel):
    text: str
    prompt: Optional[str] = None
    content_type: Optional[str] = None
    target_tone: Optional[str] = None
    target_audience: Optional[str] = None
    api_key: Optional[str] = None

class BrandVoiceCreateRequest(BaseModel):
    name: str
    company_or_creator: Optional[str] = ""
    industry: Optional[str] = ""
    voice_attributes: Optional[List[str]] = []
    banned_phrases: Optional[List[str]] = []
    preferred_keywords: Optional[List[str]] = []
    sample_text: Optional[str] = ""
    guidelines: Optional[str] = ""
    is_default: Optional[bool] = False

class BrandVoiceAnalyzeRequest(BaseModel):
    sample_text: str
    name: Optional[str] = "Extracted Brand Voice"
    api_key: Optional[str] = None

class ProjectCreateRequest(BaseModel):
    name: str
    description: Optional[str] = ""
    color: Optional[str] = "#8B5CF6"

class DocumentCreateRequest(BaseModel):
    project_id: Optional[str] = None
    title: str
    content: str
    content_type: str
    tone: Optional[str] = None
    audience: Optional[str] = None
    tags: Optional[List[str]] = []
    quality_score: Optional[float] = 0.0

class DocumentUpdateRequest(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    content_type: Optional[str] = None
    tone: Optional[str] = None
    audience: Optional[str] = None
    project_id: Optional[str] = None
    tags: Optional[List[str]] = None
    quality_score: Optional[float] = None

import os
import uuid
import json
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from database import get_connection, init_db
from models import (
    ContentGenerateRequest,
    SmartEditRequest,
    RepurposeRequest,
    QualityEvaluateRequest,
    BrandVoiceCreateRequest,
    BrandVoiceAnalyzeRequest,
    ProjectCreateRequest,
    DocumentCreateRequest,
    DocumentUpdateRequest
)
from services.ai_service import (
    call_gemini,
    generate_mock_content,
    generate_mock_repurpose,
    mock_quality_evaluation,
    calculate_readability,
    extract_factual_claims
)

app = FastAPI(
    title="Writara API",
    description="Backend AI orchestration engine for Writara Content Generation Platform",
    version="1.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "Writara AI Platform", "version": "1.0.0"}

# ----------------- 1. AI Content Generation -----------------
@app.post("/api/generate")
async def generate_content(req: ContentGenerateRequest):
    conn = get_connection()
    brand_voice_data = None
    if req.brand_voice_id:
        cur = conn.cursor()
        cur.execute("SELECT * FROM brand_voices WHERE id = ?", (req.brand_voice_id,))
        row = cur.fetchone()
        if row:
            brand_voice_data = {
                "name": row["name"],
                "industry": row["industry"],
                "voice_attributes": json.loads(row["voice_attributes"] or "[]"),
                "banned_phrases": json.loads(row["banned_phrases"] or "[]"),
                "preferred_keywords": json.loads(row["preferred_keywords"] or "[]"),
                "guidelines": row["guidelines"]
            }

    # Construct prompt
    system_instruction = f"""You are Writara, an elite AI copywriter, content strategist, and digital editor.
Your objective is to generate world-class, engaging, well-formatted content.
Format all responses with clean Markdown, headings, bullet points, and appropriate emphasis."""

    if brand_voice_data:
        system_instruction += f"""
BRAND VOICE CONSTRAINTS:
- Profile: {brand_voice_data['name']} ({brand_voice_data.get('industry', '')})
- Tone Attributes: {', '.join(brand_voice_data['voice_attributes'])}
- Guidelines: {brand_voice_data['guidelines']}
- Preferred Vocabulary: {', '.join(brand_voice_data['preferred_keywords'])}
- DO NOT USE THESE BANNED PHRASES: {', '.join(brand_voice_data['banned_phrases'])}"""

    prompt = f"""Content Type: {req.content_type}
Topic / Prompt: {req.topic}
Tone: {req.tone}
Target Audience: {req.audience}
Length Preference: {req.length}
Target Language: {req.language}
Target Keywords: {', '.join(req.keywords) if req.keywords else 'None specified'}
Custom Instructions: {req.custom_instructions or 'None'}

Please produce the finalized, publication-ready piece of content now."""

    # Try Gemini if key is provided or env var exists
    output_text = None
    ai_provider = "Algorithmic Engine (Local)"
    
    if req.api_key or os.getenv("GEMINI_API_KEY"):
        gemini_result = await call_gemini(prompt, system_instruction, api_key=req.api_key or "")
        if gemini_result:
            output_text = gemini_result
            ai_provider = "Google Gemini 2.5 Flash"

    if not output_text:
        output_text = generate_mock_content(
            topic=req.topic,
            content_type=req.content_type,
            tone=req.tone or "Engaging",
            audience=req.audience or "General Readers",
            length=req.length or "medium",
            keywords=req.keywords or [],
            brand_voice=brand_voice_data
        )

    # Calculate metrics
    readability = calculate_readability(output_text)
    eval_metrics = mock_quality_evaluation(output_text, prompt=req.topic)
    
    # Save to history
    hist_id = f"hist-{uuid.uuid4().hex[:8]}"
    cur = conn.cursor()
    cur.execute("""
    INSERT INTO history (id, prompt, content_type, brand_voice_name, output_text, word_count, quality_metrics, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        hist_id,
        req.topic,
        req.content_type,
        brand_voice_data["name"] if brand_voice_data else "Default",
        output_text,
        readability["words"],
        json.dumps(eval_metrics),
        datetime.utcnow().isoformat()
    ))
    conn.commit()
    conn.close()

    return {
        "id": hist_id,
        "content": output_text,
        "content_type": req.content_type,
        "provider": ai_provider,
        "metrics": eval_metrics
    }

# ----------------- 2. Smart Editing Assistant -----------------
@app.post("/api/edit")
async def smart_edit(req: SmartEditRequest):
    prompt = f"""Act as an expert content editor.
Action: {req.action.upper()}
Target Tone: {req.target_tone or 'Retain original'}
Target Language: {req.target_language or 'English'}
Specific Instruction: {req.custom_prompt or 'None'}

Original Text:
{req.text}

Output ONLY the edited/improved text with no conversational preamble."""

    edited_text = None
    if req.api_key or os.getenv("GEMINI_API_KEY"):
        gemini_result = await call_gemini(prompt, api_key=req.api_key or "")
        if gemini_result:
            edited_text = gemini_result

    if not edited_text:
        # Algorithmic editing simulation
        if req.action == "shorten":
            sentences = [s.strip() for s in req.text.split(".") if s.strip()]
            edited_text = ". ".join(sentences[:max(1, len(sentences)//2)]) + "."
        elif req.action == "expand":
            edited_text = req.text + f"\n\nFurthermore, when we analyze the compounding advantages, the strategic leverage becomes undeniable. By maintaining clear checkpoints and consistent execution, teams consistently unlock greater ROI and reader engagement."
        elif req.action == "grammar":
            # Clean punctuation and capitalize
            edited_text = req.text.replace("teh ", "the ").replace(" dont ", " don't ").replace(" wont ", " won't ")
            edited_text = "\n".join([line.capitalize() for line in edited_text.split("\n")])
        elif req.action == "summarize":
            sentences = [s.strip() for s in req.text.split(".") if s.strip()]
            edited_text = f"**Key Summary:**\n• " + "\n• ".join(sentences[:3])
        elif req.action == "tone":
            tone_name = req.target_tone or "Persuasive"
            edited_text = f"[{tone_name} Formulation]\n\n" + req.text.replace("maybe", "definitely").replace("could", "will").replace("I think", "Evidence demonstrates that")
        elif req.action == "translate":
            lang = req.target_language or "Spanish"
            edited_text = f"[{lang} Translation Preview]\n\n" + req.text
        else: # rewrite
            edited_text = f"✨ **Refined Version:**\n\n" + req.text

    metrics = mock_quality_evaluation(edited_text)
    return {
        "action": req.action,
        "original_text": req.text,
        "edited_text": edited_text,
        "metrics": metrics
    }

# ----------------- 3. One-Click Content Repurposing -----------------
@app.post("/api/repurpose")
async def repurpose_content(req: RepurposeRequest):
    results = {}
    if req.api_key or os.getenv("GEMINI_API_KEY"):
        for fmt in req.target_formats:
            p = f"""Repurpose the following master content into a top-performing {fmt.replace('_', ' ').upper()} asset.
Target Format: {fmt}
Master Content:
{req.source_content}

Produce a complete, optimized post ready for immediate deployment on that platform."""
            res = await call_gemini(p, api_key=req.api_key or "")
            if res:
                results[fmt] = res

    # If any format is missing or without API key, use rich mock
    mock_results = generate_mock_repurpose(req.source_content, req.target_formats)
    for fmt in req.target_formats:
        if fmt not in results:
            results[fmt] = mock_results.get(fmt, "")

    return {
        "source_length": len(req.source_content),
        "formats_generated": len(results),
        "repurposed": results
    }

# ----------------- 4. AI Content Quality Evaluator -----------------
@app.post("/api/evaluate")
async def evaluate_quality(req: QualityEvaluateRequest):
    metrics = mock_quality_evaluation(req.text, prompt=req.prompt or "")
    
    # Check if Gemini can provide deep qualitative commentary
    if req.api_key or os.getenv("GEMINI_API_KEY"):
        prompt = f"""Evaluate this content for editorial quality:
Original Intent/Topic: {req.prompt or 'Unspecified'}
Target Tone: {req.target_tone or 'Professional'}
Content:
{req.text}

Provide:
1. Two high-impact strengths
2. Two precise suggestions to improve engagement
3. Factuality check flag if any claim needs verification"""
        gemini_feedback = await call_gemini(prompt, api_key=req.api_key or "")
        if gemini_feedback:
            metrics["ai_editorial_review"] = gemini_feedback

    return metrics

# ----------------- 5. Brand Voice Memory -----------------
@app.get("/api/brand-voice")
def list_brand_voices():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM brand_voices ORDER BY created_at DESC")
    rows = cur.fetchall()
    voices = []
    for r in rows:
        voices.append({
            "id": r["id"],
            "name": r["name"],
            "company_or_creator": r["company_or_creator"],
            "industry": r["industry"],
            "voice_attributes": json.loads(r["voice_attributes"] or "[]"),
            "banned_phrases": json.loads(r["banned_phrases"] or "[]"),
            "preferred_keywords": json.loads(r["preferred_keywords"] or "[]"),
            "sample_text": r["sample_text"],
            "guidelines": r["guidelines"],
            "is_default": bool(r["is_default"]),
            "created_at": r["created_at"]
        })
    conn.close()
    return voices

@app.post("/api/brand-voice")
def create_brand_voice(req: BrandVoiceCreateRequest):
    conn = get_connection()
    cur = conn.cursor()
    vid = f"voice-{uuid.uuid4().hex[:8]}"
    now = datetime.utcnow().isoformat()
    
    if req.is_default:
        cur.execute("UPDATE brand_voices SET is_default = 0")

    cur.execute("""
    INSERT INTO brand_voices (id, name, company_or_creator, industry, voice_attributes, banned_phrases, preferred_keywords, sample_text, guidelines, is_default, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        vid,
        req.name,
        req.company_or_creator or "",
        req.industry or "",
        json.dumps(req.voice_attributes or []),
        json.dumps(req.banned_phrases or []),
        json.dumps(req.preferred_keywords or []),
        req.sample_text or "",
        req.guidelines or "",
        1 if req.is_default else 0,
        now,
        now
    ))
    conn.commit()
    conn.close()
    return {"id": vid, "message": "Brand voice created successfully"}

@app.delete("/api/brand-voice/{voice_id}")
def delete_brand_voice(voice_id: str):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM brand_voices WHERE id = ?", (voice_id,))
    conn.commit()
    conn.close()
    return {"message": "Brand voice deleted"}

@app.post("/api/brand-voice/analyze")
async def analyze_brand_voice(req: BrandVoiceAnalyzeRequest):
    """Extract brand tone, attributes, dos and don'ts from provided writing sample."""
    sample = req.sample_text.strip()
    if not sample:
        raise HTTPException(status_code=400, detail="Sample text cannot be empty")
        
    # Algorithmic extraction default
    attributes = ["Authentic", "Direct", "Value-driven", "Engaging", "Clear"]
    banned = ["synergy", "pinnacle", "game-changing"]
    keywords = ["results", "impact", "focus", "streamline"]
    guidelines = "Keep phrasing energetic, avoid unnecessary jargon, and use direct second-person address ('you/your')."

    if req.api_key or os.getenv("GEMINI_API_KEY"):
        prompt = f"""Analyze this writing sample and extract brand voice attributes in valid JSON format:
Sample:
\"\"\"{sample}\"\"\"

Return ONLY a JSON object with:
{{
  "voice_attributes": ["3-5 tone adjectives"],
  "banned_phrases": ["3 phrases to avoid"],
  "preferred_keywords": ["3-5 signature vocabulary words"],
  "guidelines": "1-2 sentences on sentence length, cadence, and reader engagement style",
  "industry_inferred": "Likely industry"
}}"""
        gemini_res = await call_gemini(prompt, api_key=req.api_key or "")
        if gemini_res:
            try:
                # clean potential markdown json ticks
                clean_json = gemini_res.strip().replace("```json", "").replace("```", "").strip()
                parsed = json.loads(clean_json)
                return {
                    "name": req.name or "Extracted Brand Voice",
                    "sample_text": sample,
                    "industry": parsed.get("industry_inferred", "Digital & Tech"),
                    "voice_attributes": parsed.get("voice_attributes", attributes),
                    "banned_phrases": parsed.get("banned_phrases", banned),
                    "preferred_keywords": parsed.get("preferred_keywords", keywords),
                    "guidelines": parsed.get("guidelines", guidelines)
                }
            except Exception:
                pass

    return {
        "name": req.name or "Extracted Brand Voice",
        "sample_text": sample,
        "industry": "Content & Tech",
        "voice_attributes": attributes,
        "banned_phrases": banned,
        "preferred_keywords": keywords,
        "guidelines": guidelines
    }

# ----------------- 6. Documents & Drafts -----------------
@app.get("/api/documents")
def list_documents(project_id: Optional[str] = None, search: Optional[str] = None):
    conn = get_connection()
    cur = conn.cursor()
    query = "SELECT * FROM documents WHERE 1=1"
    params = []
    if project_id:
        query += " AND project_id = ?"
        params.append(project_id)
    if search:
        query += " AND (title LIKE ? OR content LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%"])
    query += " ORDER BY updated_at DESC"
    cur.execute(query, params)
    rows = cur.fetchall()
    docs = []
    for r in rows:
        docs.append({
            "id": r["id"],
            "project_id": r["project_id"],
            "title": r["title"],
            "content": r["content"],
            "content_type": r["content_type"],
            "tone": r["tone"],
            "audience": r["audience"],
            "word_count": r["word_count"],
            "tags": json.loads(r["tags"] or "[]"),
            "quality_score": r["quality_score"],
            "created_at": r["created_at"],
            "updated_at": r["updated_at"]
        })
    conn.close()
    return docs

@app.post("/api/documents")
def create_document(req: DocumentCreateRequest):
    conn = get_connection()
    cur = conn.cursor()
    doc_id = f"doc-{uuid.uuid4().hex[:8]}"
    now = datetime.utcnow().isoformat()
    word_count = len(req.content.split())
    cur.execute("""
    INSERT INTO documents (id, project_id, title, content, content_type, tone, audience, word_count, tags, quality_score, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        doc_id,
        req.project_id or "proj-default",
        req.title,
        req.content,
        req.content_type,
        req.tone or "General",
        req.audience or "General",
        word_count,
        json.dumps(req.tags or []),
        req.quality_score or 90.0,
        now,
        now
    ))
    conn.commit()
    conn.close()
    return {"id": doc_id, "message": "Document saved successfully"}

@app.put("/api/documents/{doc_id}")
def update_document(doc_id: str, req: DocumentUpdateRequest):
    conn = get_connection()
    cur = conn.cursor()
    now = datetime.utcnow().isoformat()
    
    fields = []
    values = []
    if req.title is not None:
        fields.append("title = ?")
        values.append(req.title)
    if req.content is not None:
        fields.append("content = ?")
        values.append(req.content)
        fields.append("word_count = ?")
        values.append(len(req.content.split()))
    if req.content_type is not None:
        fields.append("content_type = ?")
        values.append(req.content_type)
    if req.tone is not None:
        fields.append("tone = ?")
        values.append(req.tone)
    if req.audience is not None:
        fields.append("audience = ?")
        values.append(req.audience)
    if req.project_id is not None:
        fields.append("project_id = ?")
        values.append(req.project_id)
    if req.tags is not None:
        fields.append("tags = ?")
        values.append(json.dumps(req.tags))
    if req.quality_score is not None:
        fields.append("quality_score = ?")
        values.append(req.quality_score)
        
    fields.append("updated_at = ?")
    values.append(now)
    values.append(doc_id)
    
    cur.execute(f"UPDATE documents SET {', '.join(fields)} WHERE id = ?", values)
    conn.commit()
    conn.close()
    return {"id": doc_id, "message": "Document updated successfully"}

@app.delete("/api/documents/{doc_id}")
def delete_document(doc_id: str):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM documents WHERE id = ?", (doc_id,))
    conn.commit()
    conn.close()
    return {"message": "Document deleted"}

# ----------------- 7. Projects -----------------
@app.get("/api/projects")
def list_projects():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM projects ORDER BY created_at ASC")
    rows = cur.fetchall()
    projects = []
    for r in rows:
        # count docs
        c2 = conn.cursor()
        c2.execute("SELECT COUNT(*) FROM documents WHERE project_id = ?", (r["id"],))
        doc_count = c2.fetchone()[0]
        projects.append({
            "id": r["id"],
            "name": r["name"],
            "description": r["description"],
            "color": r["color"],
            "doc_count": doc_count,
            "created_at": r["created_at"],
            "updated_at": r["updated_at"]
        })
    conn.close()
    return projects

@app.post("/api/projects")
def create_project(req: ProjectCreateRequest):
    conn = get_connection()
    cur = conn.cursor()
    pid = f"proj-{uuid.uuid4().hex[:8]}"
    now = datetime.utcnow().isoformat()
    cur.execute("""
    INSERT INTO projects (id, name, description, color, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (pid, req.name, req.description or "", req.color or "#8B5CF6", now, now))
    conn.commit()
    conn.close()
    return {"id": pid, "message": "Project created successfully"}

# ----------------- 8. Analytics & History -----------------
@app.get("/api/analytics")
def get_analytics():
    conn = get_connection()
    cur = conn.cursor()
    
    cur.execute("SELECT COUNT(*), SUM(word_count) FROM documents")
    doc_stats = cur.fetchone()
    total_docs = doc_stats[0] or 0
    total_doc_words = doc_stats[1] or 0

    cur.execute("SELECT COUNT(*), SUM(word_count) FROM history")
    hist_stats = cur.fetchone()
    total_generations = hist_stats[0] or 0
    total_generated_words = hist_stats[1] or 0

    total_words = total_doc_words + total_generated_words
    # Estimated time saved: avg person writes 20 words/minute -> 1 hour per 1200 words
    hours_saved = round(total_words / 1200, 1)

    cur.execute("SELECT content_type, COUNT(*) as cnt FROM history GROUP BY content_type")
    type_breakdown = {r["content_type"]: r["cnt"] for r in cur.fetchall()}

    conn.close()
    return {
        "total_words_generated": total_words,
        "total_documents": total_docs,
        "total_generations": total_generations,
        "hours_saved": hours_saved,
        "content_type_breakdown": type_breakdown
    }

@app.get("/api/history")
def get_history(limit: int = 20):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM history ORDER BY created_at DESC LIMIT ?", (limit,))
    rows = cur.fetchall()
    history = []
    for r in rows:
        history.append({
            "id": r["id"],
            "prompt": r["prompt"],
            "content_type": r["content_type"],
            "brand_voice_name": r["brand_voice_name"],
            "output_text": r["output_text"],
            "word_count": r["word_count"],
            "quality_metrics": json.loads(r["quality_metrics"] or "{}"),
            "created_at": r["created_at"]
        })
    conn.close()
    return history

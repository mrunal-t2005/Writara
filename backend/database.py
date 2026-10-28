import sqlite3
import json
import os
from typing import List, Dict, Any, Optional
from datetime import datetime

DB_FILE = os.path.join(os.path.dirname(__file__), "writara.db")

def get_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # Projects
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        color TEXT DEFAULT '#6366F1',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
    """)

    # Documents
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        project_id TEXT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        content_type TEXT NOT NULL,
        tone TEXT,
        audience TEXT,
        word_count INTEGER DEFAULT 0,
        tags TEXT, -- JSON array
        quality_score REAL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE SET NULL
    )
    """)

    # Brand Voice Profiles
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS brand_voices (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        company_or_creator TEXT,
        industry TEXT,
        voice_attributes TEXT, -- JSON array e.g. ["confident", "authoritative", "friendly"]
        banned_phrases TEXT,    -- JSON array
        preferred_keywords TEXT,-- JSON array
        sample_text TEXT,
        guidelines TEXT,
        is_default INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
    """)

    # Generation History
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS history (
        id TEXT PRIMARY KEY,
        prompt TEXT NOT NULL,
        content_type TEXT NOT NULL,
        brand_voice_name TEXT,
        output_text TEXT NOT NULL,
        word_count INTEGER DEFAULT 0,
        quality_metrics TEXT, -- JSON object
        created_at TEXT NOT NULL
    )
    """)

    # Scheduled Calendar Posts
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS scheduled_posts (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        platform TEXT NOT NULL,
        scheduled_date TEXT NOT NULL,
        scheduled_time TEXT DEFAULT '10:00 AM',
        status TEXT DEFAULT 'scheduled',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
    """)

    # Seed default project if empty
    cursor.execute("SELECT COUNT(*) FROM projects")
    if cursor.fetchone()[0] == 0:
        now = datetime.utcnow().isoformat()
        cursor.execute("""
        INSERT INTO projects (id, name, description, color, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
        """, ("proj-default", "General Workspace", "Default project for drafts and ideas", "#8B5CF6", now, now))
        
        # Seed a sample brand voice profile
        cursor.execute("""
        INSERT INTO brand_voices (id, name, company_or_creator, industry, voice_attributes, banned_phrases, preferred_keywords, sample_text, guidelines, is_default, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "voice-default",
            "Tech Innovator & Thought Leader",
            "Writara Labs",
            "SaaS & AI Technology",
            json.dumps(["Visionary", "Concise", "Empowering", "Action-oriented", "Modern"]),
            json.dumps(["synergy", "game-changer", "revolutionary breakthrough", "at the end of the day"]),
            json.dumps(["effortless", "scalable", "high-impact", "streamline", "generative"]),
            "We build AI that empowers real creators to produce extraordinary work in minutes, not days. Simple. Transparent. Transformative.",
            "Always lead with concrete value. Keep paragraphs under 3 sentences where possible. Avoid buzzwords and hype.",
            1,
            now,
            now
        ))

    # Seed initial calendar posts if empty
    cursor.execute("SELECT COUNT(*) FROM scheduled_posts")
    if cursor.fetchone()[0] == 0:
        now = datetime.utcnow().isoformat()
        today = datetime.utcnow().strftime("%Y-%m-%d")
        cursor.execute("""
        INSERT INTO scheduled_posts (id, title, content, platform, scheduled_date, scheduled_time, status, created_at, updated_at)
        VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "post-1", "AI Automation Roadmap for Founders", "Here is our 5-pillar execution guide to reducing operational bottlenecks with AI in 2026.", "linkedin", today, "09:30 AM", "scheduled", now, now,
            "post-2", "Weekly Thought Leadership Digest", "Issue #42: How high-performing product teams ship 3x faster without burnout.", "email", today, "02:00 PM", "scheduled", now, now,
            "post-3", "Shorts Breakdown: 3 AI Writing Hacks", "Stop rewriting the same prompts from scratch: use this 3-step prompt framework.", "youtube", today, "06:00 PM", "published", now, now
        ))


    conn.commit()
    conn.close()

init_db()

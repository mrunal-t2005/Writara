import os
import re
import json
import httpx
from typing import Dict, Any, List, Optional

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

def calculate_readability(text: str) -> Dict[str, Any]:
    """Calculate Flesch Reading Ease & Flesch-Kincaid Grade Level."""
    clean_text = re.sub(r'#+\s*', '', text)
    clean_text = re.sub(r'[*_`]', '', clean_text)
    
    sentences = [s.strip() for s in re.split(r'[.!?]+', clean_text) if s.strip()]
    num_sentences = max(len(sentences), 1)
    
    words = [w.strip() for w in re.split(r'\s+', clean_text) if w.strip()]
    num_words = max(len(words), 1)
    
    # Estimate syllables
    def count_syllables(word: str) -> int:
        word = word.lower()
        if len(word) <= 3:
            return 1
        word = re.sub(r'(?:[^laeiouy]|ed|es|e)$', '', word)
        word = re.sub(r'^y', '', word)
        syllables = len(re.findall(r'[aeiouy]{1,2}', word))
        return max(syllables, 1)

    total_syllables = sum(count_syllables(w) for w in words)
    
    # Flesch Reading Ease: 206.835 - 1.015 * (total_words / total_sentences) - 84.6 * (total_syllables / total_words)
    fre = 206.835 - 1.015 * (num_words / num_sentences) - 84.6 * (total_syllables / num_words)
    fre = round(max(0.0, min(100.0, fre)), 1)
    
    # Grade level
    fk_grade = 0.39 * (num_words / num_sentences) + 11.8 * (total_syllables / num_words) - 15.59
    fk_grade = round(max(1.0, min(16.0, fk_grade)), 1)

    if fre >= 80:
        level = "Very Easy (Middle School)"
    elif fre >= 65:
        level = "Easy & Engaging (General Audience)"
    elif fre >= 50:
        level = "Standard (High School / Professional)"
    elif fre >= 30:
        level = "Fairly Difficult (Academic / Specialized)"
    else:
        level = "Very Complex (Technical / Academic)"

    return {
        "score": fre,
        "grade_level": fk_grade,
        "interpretation": level,
        "words": num_words,
        "sentences": num_sentences,
        "avg_words_per_sentence": round(num_words / num_sentences, 1)
    }

async def call_gemini(prompt: str, system_instruction: str = "", api_key: str = "") -> Optional[str]:
    """Call Google Gemini API if key is available."""
    key = api_key or GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
    if not key:
        return None
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={key}"
    
    payload: Dict[str, Any] = {
        "contents": [
            {
                "parts": [{"text": prompt}]
            }
        ],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 3000,
        }
    }
    if system_instruction:
        payload["systemInstruction"] = {
            "parts": [{"text": system_instruction}]
        }
        
    try:
        async with httpx.AsyncClient(timeout=45.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                return text.strip()
            else:
                # If 2.5-flash not found or quota, try 2.0-flash or 1.5-flash
                fallback_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={key}"
                resp2 = await client.post(fallback_url, json=payload)
                if resp2.status_code == 200:
                    data2 = resp2.json()
                    return data2["candidates"][0]["content"]["parts"][0]["text"].strip()
                return None
    except Exception as e:
        print(f"Gemini API error: {e}")
        return None

def extract_factual_claims(text: str) -> List[Dict[str, str]]:
    """Scan text for statistics, percentages, years, dates, or authoritative claims that need verification."""
    flags = []
    lines = text.split("\n")
    for line in lines:
        line_clean = line.strip()
        if not line_clean or line_clean.startswith("#"):
            continue
        # Check for numbers, %, or claims
        has_stats = bool(re.search(r'\b\d+(?:\.\d+)?%\b|\$\d+|\b(?:increased|decreased|boosted|grew|dropped) by \d+|\b\d{4}\b', line_clean))
        has_superlative = bool(re.search(r'\b(?:proven to|studies show|research reveals|100%|guaranteed|highest in the industry)\b', line_clean, re.IGNORECASE))
        if has_stats or has_superlative:
            flags.append({
                "claim": line_clean[:140] + ("..." if len(line_clean) > 140 else ""),
                "reason": "Contains statistical or definitive claim. Verify empirical source before publishing." if has_stats else "Contains strong claim or research assertion. Verify cited evidence.",
                "severity": "medium" if has_stats else "low"
            })
        if len(flags) >= 5:
            break
            
    if not flags:
        flags.append({
            "claim": "General statements checked.",
            "reason": "No unverified statistical anomalies or ungrounded superlative metrics detected.",
            "severity": "info"
        })
    return flags

def generate_mock_content(topic: str, content_type: str, tone: str, audience: str, length: str, keywords: List[str], brand_voice: Optional[Dict[str, Any]] = None) -> str:
    """High-quality algorithmic fallback generator when offline or no API key provided."""
    kw_str = ", ".join(keywords) if keywords else "digital growth, modern workflow, strategic execution"
    brand_context = f"\n*Aligned with brand persona: {brand_voice['name']}*" if brand_voice else ""
    
    if content_type == "blog_post":
        return f"""# Mastering {topic.title()}: A Practical Guide for {audience}

{brand_context}

In today's fast-moving landscape, **{topic}** has transitioned from an experimental approach into an indispensable strategy. Whether you are leading a team or scaling individual output, mastering this domain can drastically improve your creative velocity and strategic impact.

---

## 1. Why {topic.title()} Matters Now More Than Ever

Most professionals encounter friction not from a lack of ideas, but from bottlenecks in execution. When approaching **{topic}**, the key distinction lies in intentionality:
* **Higher Precision:** Focusing on high-leverage outcomes rather than manual busywork.
* **Streamlined Workflow:** Integrating tools that minimize cognitive load.
* **Measurable Output:** Tracking tangible improvements in quality and delivery.

> *"The future belongs to those who leverage intelligent workflows to augment human ingenuity, rather than replace it."*

---

## 2. Core Framework: Step-by-Step Implementation

To put this into action with **{tone.lower()}** precision, apply the three-pillar execution loop:

### Pillar A: Clarify the Objective & Context
Begin by establishing clear parameters. Incorporating focal points such as `{kw_str}` ensures that every initiative aligns with your broader vision. Avoid vanity metrics and zero in on what directly moves the needle.

### Pillar B: Systematic Execution
Break down complex initiatives into bite-sized sprints. When creating content or systems around {topic}, maintain consistency:
1. **Define the narrative arc:** What problem are we solving?
2. **Engage the target reader:** Address `{audience}` directly with relatable examples.
3. **Refine ruthlessly:** Eliminate fluff and prioritize clarity.

### Pillar C: Continuous Feedback & Optimization
Audit your results regularly. Measure engagement, reader retention, and practical utility. Iterate based on empirical feedback rather than assumptions.

---

## 3. Key Takeaways and Next Steps

Implementing **{topic}** effectively is an iterative process. Start small, validate your fundamentals, and scale what works.

**Call to Action:** What is the biggest hurdle your team faces when dealing with {topic}? Start by auditing your current process today, and share your findings with your peers!
"""

    elif content_type == "social_caption" or content_type == "instagram_caption":
        return f"""💡 The truth about {topic} that most people miss:

It's not about working harder. It's about building smarter systems. 

Here are 3 core rules we follow for {audience}:

1️⃣ **Start with intent:** Don't just follow the crowd—focus on {kw_str.split(',')[0]}.
2️⃣ **Consistency over intensity:** Small daily progress compound into massive wins.
3️⃣ **Keep it {tone.lower()}:** Authentic communication always beats generic templates.

👇 What’s your #1 challenge with {topic}? Drop a comment below—let’s discuss!

.
.
#Writara #{topic.replace(' ', '')} #ContentCreation #{audience.replace(' ', '')} #Productivity #AIWorkflow #Innovation"""

    elif content_type == "email_newsletter":
        return f"""**Subject:** The game plan for {topic} (and what we learned)
**Preview Text:** Why traditional approaches to {topic} are failing in 2026.

Hey there,

If you’ve been paying attention to recent trends, you’ve probably noticed that everyone is talking about **{topic}**.

Yet, when you look beneath the surface, 80% of creators and teams in the {audience} space are still relying on outdated playbooks.

Here is what is actually working right now:

### 1. Zero in on what matters: {kw_str}
When you eliminate distractions and focus purely on your core value proposition, results follow naturally. 

### 2. A {tone} perspective
You don't need complicated jargon. Speak directly to real pain points, offer actionable solutions, and respect your audience's time.

### 3. Your action step for this week
Take 15 minutes to review your current approach to {topic}. Ask yourself: *"Is this delivering tangible value, or am I just going through the motions?"*

Until next week,
**The Writara Editorial Team**

*P.S. Hit reply and let us know your thoughts—we read and respond to every note!*
"""

    elif content_type == "product_description":
        return f"""## Introducing the Next-Gen Solution for {topic.title()}

Designed specifically for **{audience}**, this is the complete system engineered to transform your workflow. Crafted with a **{tone.lower()}** ethos, it pairs intuitive simplicity with uncompromised power.

### Why You'll Love It:
* ✨ **Effortless Performance:** Built from the ground up to optimize `{kw_str}`.
* ⚡ **Accelerate Your Output:** Cut hours of tedious effort down to seconds.
* 🎯 **Tailored Precision:** Engineered to deliver consistent, dependable results every single time.

### What's Inside:
- Comprehensive modules configured for rapid onboarding
- Seamless export options and workflow integrations
- Dedicated support and continuous updates

**Experience the difference today.** Elevate your standard with {topic.title()} and unlock your full creative potential.
"""

    elif content_type == "video_script":
        return f"""# Video Script: The Ultimate Guide to {topic.title()}
**Format:** Short-form Video (Reels / TikTok / YouTube Shorts)
**Target Length:** 45 - 60 seconds
**Tone:** {tone} | **Audience:** {audience}

---

**[00:00 - 00:05] HOOK (Visual: Quick text overlay + dynamic zoom)**
Host (energized): "Stop scrolling if you’re still trying to figure out {topic} the hard way!"

**[00:05 - 00:15] PROBLEM (Visual: B-roll showing frustration / overwhelming workflow)**
Host: "Most {audience} waste hours stuck in over-complicated steps, especially when trying to balance {kw_str.split(',')[0]}."

**[00:15 - 00:35] THE SOLUTION (Visual: Screen recording or clean 3-step graphic)**
Host: "Here is the 3-step framework you need:
Number one: Clarify the core outcome before touching any tools.
Number two: Automate the repetitive groundwork so your creativity actually shines.
And number three: Keep your voice {tone.lower()} and true to your brand."

**[00:35 - 00:45] CALL TO ACTION (Visual: Host pointing down to caption)**
Host: "Save this video for later, and check the caption for the exact breakdown!"
"""

    elif content_type == "ad_copy":
        return f"""### Campaign: {topic.title()} High-Conversion Ad Copy

**Option A (Problem-Agitation-Solution - PAS):**
*Headline:* Tired of Struggling With {topic.title()}?
*Body:* You didn't start your journey to get bogged down by tedious tasks. For {audience}, managing `{kw_str}` shouldn't feel like a full-time headache. Discover how thousands are cutting their production time in half without sacrificing quality.
*CTA:* [Get Started Free Today ->]

---

**Option B (Attention-Interest-Desire-Action - AIDA):**
*Headline:* The Smarter Way to Master {topic.title()}
*Body:* Imagine creating high-impact results in 60 seconds. Our platform delivers a {tone.lower()}, precision-crafted experience built specifically for your goals. 
*CTA:* [Claim Your Free Access Now]

---

**Option C (Short & Punchy Social Ad):**
*Primary Text:* Fast. Reliable. Built for {audience}. Say goodbye to creative bottlenecks and hello to effortless {topic}.
*Headline:* Unlock Your Potential Today
*CTA:* [Learn More]
"""

    else:
        return f"""# {topic.title()}

**Target Audience:** {audience} | **Tone:** {tone} | **Focus:** {kw_str}
{brand_context}

### Overview
This content has been tailored to provide an engaging, {tone.lower()} narrative around **{topic}**. By structuring the information specifically for {audience}, we ensure maximum clarity, relevance, and impact.

### Core Insights
1. **Strategic Foundation:** Achieving success with {topic} requires aligning your objective with practical execution.
2. **Key Enablers:** Incorporating elements like {kw_str} strengthens your core message.
3. **Execution Playbook:** Focus on iterative improvements, clear calls to action, and continuous engagement.

### Conclusion
Deploy this framework across your channels to see measurable improvements in engagement and audience resonance.
"""

def generate_mock_repurpose(source_text: str, formats: List[str]) -> Dict[str, str]:
    """Fallback repurposer when offline or without API key."""
    # Extract first line or summary as topic
    lines = [l.strip() for l in source_text.split("\n") if l.strip()]
    core_idea = lines[0].replace("#", "").strip() if lines else "Core Insights"
    excerpt = " ".join(lines[1:4]) if len(lines) > 1 else source_text[:200]
    
    results = {}
    for fmt in formats:
        if fmt == "linkedin":
            results[fmt] = f"""🚀 {core_idea}

Here is what most professionals overlook:

{excerpt[:250]}...

3 Actionable Takeaways:
1. Simplify your core objective.
2. Focus on consistency over complexity.
3. Measure impact, not vanity metrics.

Agree or disagree? Let's discuss in the comments below.

#Productivity #Leadership #ContentStrategy #Innovation"""

        elif fmt == "twitter_thread":
            results[fmt] = f"""1/6 🧵 The truth about {core_idea}:

Most people make this 10x harder than it needs to be. Here is the distilled breakdown: 👇

2/6 First, understand the core problem:
{excerpt[:180]}...

3/6 Why traditional workflows fail:
They focus on volume instead of leveraged clarity. Quality always wins over endless busywork.

4/6 The 3 rules to follow:
• Keep the barrier to start low
• Standardize the repeatable steps
• Protect your creative energy

5/6 When you streamline your process, your output doesn't just double—it gets noticeably better.

6/6 Found this helpful?
• Retweet the first tweet to share with your network
• Follow @WritaraAI for daily content breakdowns!"""

        elif fmt == "instagram_caption":
            results[fmt] = f"""✨ {core_idea.upper()} ✨

Swipe through to see the exact blueprint 👉

Here's the summary:
{excerpt[:200]}...

📌 Carousel Slide Breakdown:
Slide 1: {core_idea} (Cover)
Slide 2: The common mistake everyone makes
Slide 3: The 3-step framework to fix it
Slide 4: Key metrics that actually matter
Slide 5: Save this for your next project!

Double-tap if this was helpful and tag a friend who needs this reminder! ❤️

#Writara #ContentCreator #GrowthMindset #DailyInspiration"""

        elif fmt == "email_newsletter":
            results[fmt] = f"""Subject: Quick breakdown: {core_idea}
Preview: The 3 insights you need to know this week.

Hi friend,

Earlier this week, I was thinking about how we approach **{core_idea}**.

Here's the main dilemma:
"{excerpt[:220]}..."

To overcome this, here are the three principles we've implemented:
1. Ruthless editing: cut anything that doesn't serve the reader.
2. Contextual clarity: speak directly to the problem.
3. Fast execution: ship first drafts quickly, iterate based on feedback.

What's your current experience with this? Simply hit reply—I'd love to hear your take.

Best,
The Writara Team"""

        elif fmt == "video_script":
            results[fmt] = f"""🎬 VIDEO SCRIPT: {core_idea}
Format: 30-45s Reel / TikTok / Short

[0:00 - 0:04] Hook:
"If you are struggling with {core_idea.lower()}, you need to hear this right now."

[0:04 - 0:18] The Pain Point:
"Most people think they need more hours, but really, they just need a better system. Notice how {excerpt[:100]}...?"

[0:18 - 0:32] The Solution:
"Here's the fix: Stop overcomplicating step one. Focus only on the core message, polish your delivery, and hit publish."

[0:32 - 0:40] CTA:
"Save this for your next draft and follow for more smart creation tips!" """

        elif fmt == "executive_summary":
            results[fmt] = f"""## Executive Summary: {core_idea}

### Context & Background
{excerpt[:250]}

### Key Strategic Findings
* **Operational Efficiency:** Significant friction stems from fragmented tools and non-standardized drafting.
* **Core Opportunity:** Automating baseline generation allows teams to reallocate focus toward high-value editorial judgment.
* **Expected Outcome:** Accelerated time-to-market with elevated consistency across multiple communication channels.

### Recommended Next Steps
1. Standardize brand guidelines across departments.
2. Pilot one-click repurposing across top marketing channels.
3. Establish regular quality evaluation criteria."""

        else:
            results[fmt] = f"### Repurposed format ({fmt.title()}):\n\n**Focus:** {core_idea}\n\n{excerpt}"
            
    return results

def mock_quality_evaluation(text: str, prompt: str = "") -> Dict[str, Any]:
    """Algorithmic quality evaluation with Flesch metrics, tone match, adherence, and fact-checking."""
    readability = calculate_readability(text)
    words = readability["words"]
    
    # Calculate Adherence Score
    adherence = 92 if len(text) > 200 else 78
    if prompt:
        p_words = set(re.findall(r'\w+', prompt.lower()))
        t_words = set(re.findall(r'\w+', text.lower()))
        common = p_words.intersection(t_words)
        ratio = len(common) / max(len(p_words), 1)
        adherence = min(98, max(75, int(70 + ratio * 30)))

    # Tone consistency score
    tone_score = 94 if readability["score"] >= 50 else 86
    
    # Clarity & conciseness score
    avg_len = readability["avg_words_per_sentence"]
    if 10 <= avg_len <= 20:
        clarity_score = 95
    elif avg_len < 10:
        clarity_score = 88
    else:
        clarity_score = max(60, 95 - int((avg_len - 20) * 2))

    # Overall Quality Score
    overall_score = round((adherence * 0.35 + tone_score * 0.25 + clarity_score * 0.25 + min(100, readability["score"] + 20) * 0.15), 1)

    # SEO & Keyword Analysis
    all_words = [w.lower() for w in re.findall(r'\b[a-zA-Z]{4,}\b', text)]
    from collections import Counter
    common_words = Counter(all_words).most_common(5)
    seo_keywords = [{"keyword": kw, "count": count, "density": f"{round(count / max(words, 1) * 100, 1)}%"} for kw, count in common_words]

    # Fact-checking alerts
    factual_claims = extract_factual_claims(text)

    return {
        "overall_score": overall_score,
        "readability": readability,
        "adherence_score": adherence,
        "tone_consistency_score": tone_score,
        "clarity_score": clarity_score,
        "word_count": words,
        "character_count": len(text),
        "seo_keywords": seo_keywords,
        "fact_check_flags": factual_claims,
        "suggestions": [
            "Maintain sentence variety to preserve energetic pacing." if avg_len > 18 else "Sentence rhythm and flow are well-balanced.",
            "Strong formatting with headers and bullet points enhances skimmability.",
            "Verify cited figures or statistics before final client sign-off." if len(factual_claims) > 1 else "Content reads clearly with no unsupported assertions."
        ]
    }

def analyze_seo(
    content: str,
    target_keyword: str = "",
    secondary_keywords: Optional[List[str]] = None,
    slug: str = "",
    site_url: str = "https://writara.app"
) -> Dict[str, Any]:
    """Perform comprehensive SEO audit, SERP simulation, and keyword prominence analysis."""
    if secondary_keywords is None:
        secondary_keywords = []

    words = [w.strip() for w in re.split(r'\s+', content) if w.strip()]
    total_words = max(len(words), 1)

    # Extract Title (from first H1 or first non-empty line)
    h1_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
    h2_matches = re.findall(r'^##\s+(.+)$', content, re.MULTILINE)
    h3_matches = re.findall(r'^###\s+(.+)$', content, re.MULTILINE)

    first_line = content.strip().split("\n")[0].replace("#", "").strip() if content.strip() else "Untitled Page"
    meta_title = h1_match.group(1).strip() if h1_match else first_line[:60]
    if len(meta_title) > 60:
        meta_title = meta_title[:57] + "..."

    # Extract Meta Description (from first standard paragraph)
    paragraphs = [p.strip() for p in content.split("\n\n") if p.strip() and not p.strip().startswith("#")]
    first_para = paragraphs[0] if paragraphs else content[:160]
    clean_desc = re.sub(r'[*_`#]', '', first_para).strip()
    meta_description = clean_desc[:155] + ("..." if len(clean_desc) > 155 else "")

    # Slug generation
    page_slug = slug or re.sub(r'[^a-z0-9]+', '-', meta_title.lower()).strip('-')
    serp_url = f"{site_url.rstrip('/')}/{page_slug}"

    # Target keyword analysis
    first_100_words = " ".join(words[:100]).lower()
    content_lower = content.lower()
    all_headings = " ".join([meta_title] + h2_matches + h3_matches).lower()

    kw_list = []
    candidates = []
    if target_keyword:
        candidates.append((target_keyword, True))
    for sk in secondary_keywords:
        if sk and sk != target_keyword:
            candidates.append((sk, False))

    # If no keyword provided, extract top 3 high-frequency content words
    if not candidates:
        from collections import Counter
        stop_words = {"the", "and", "for", "with", "that", "this", "from", "your", "have", "will", "more", "into", "their"}
        meaningful = [w.lower() for w in re.findall(r'\b[a-zA-Z]{4,}\b', content) if w.lower() not in stop_words]
        top_candidates = Counter(meaningful).most_common(3)
        for kw, _ in top_candidates:
            candidates.append((kw, len(candidates) == 0))

    kw_metrics = []
    for kw, is_primary in candidates:
        pattern = r'\b' + re.escape(kw.lower()) + r'\b'
        count = len(re.findall(pattern, content_lower))
        density = round((count / total_words) * 100, 2)
        in_title = bool(re.search(pattern, meta_title.lower()))
        in_first_100 = bool(re.search(pattern, first_100_words))
        in_headings = bool(re.search(pattern, all_headings))

        kw_metrics.append({
            "keyword": kw,
            "is_primary": is_primary,
            "count": count,
            "density": f"{density}%",
            "density_num": density,
            "in_title": in_title,
            "in_first_100_words": in_first_100,
            "in_headings": in_headings,
            "status": "optimal" if 0.8 <= density <= 2.5 else ("underused" if density < 0.8 else "stuffed")
        })

    # Checklist & Scoring
    checks = []
    seo_score = 100

    # 1. Content Length
    if total_words >= 800:
        checks.append({"item": "Comprehensive Word Count (800+ words)", "status": "pass", "impact": "High"})
    elif total_words >= 300:
        checks.append({"item": "Standard Word Count (300-800 words)", "status": "pass", "impact": "Medium"})
    else:
        checks.append({"item": "Thin Content (Under 300 words recommended)", "status": "fail", "impact": "High"})
        seo_score -= 20

    # 2. Title Tag Check
    if 40 <= len(meta_title) <= 60:
        checks.append({"item": "Optimal Meta Title Length (40-60 characters)", "status": "pass", "impact": "Medium"})
    else:
        checks.append({"item": f"Title Tag Length ({len(meta_title)} chars - ideal is 45-60)", "status": "warning", "impact": "Medium"})
        seo_score -= 10

    # 3. Meta Description Check
    if 120 <= len(meta_description) <= 160:
        checks.append({"item": "Optimal Meta Description (120-160 characters)", "status": "pass", "impact": "Medium"})
    else:
        checks.append({"item": f"Meta Description Length ({len(meta_description)} chars - ideal is 120-160)", "status": "warning", "impact": "Medium"})
        seo_score -= 10

    # 4. Heading Structure
    if h1_match and len(re.findall(r'^#\s+', content, re.MULTILINE)) == 1:
        checks.append({"item": "Single H1 Tag Present", "status": "pass", "impact": "High"})
    else:
        checks.append({"item": "Missing or multiple H1 headings (use exactly one H1)", "status": "fail", "impact": "High"})
        seo_score -= 15

    if len(h2_matches) >= 2:
        checks.append({"item": f"Well-structured subheadings ({len(h2_matches)} H2 tags)", "status": "pass", "impact": "Medium"})
    else:
        checks.append({"item": "Add more H2 subheadings to break up content", "status": "warning", "impact": "Low"})
        seo_score -= 10

    # 5. Keyword Prominence (Primary Keyword)
    primary_kw = kw_metrics[0] if kw_metrics else None
    if primary_kw:
        if primary_kw["in_title"]:
            checks.append({"item": f"Primary keyword '{primary_kw['keyword']}' appears in Title", "status": "pass", "impact": "High"})
        else:
            checks.append({"item": f"Include primary keyword '{primary_kw['keyword']}' in Title", "status": "fail", "impact": "High"})
            seo_score -= 15

        if primary_kw["in_first_100_words"]:
            checks.append({"item": "Primary keyword present in intro paragraph (first 100 words)", "status": "pass", "impact": "Medium"})
        else:
            checks.append({"item": "Include primary keyword in opening paragraph", "status": "warning", "impact": "Medium"})
            seo_score -= 10

    seo_score = max(25, min(100, seo_score))

    # Schema JSON-LD Article
    schema_json_ld = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": meta_title,
        "description": meta_description,
        "url": serp_url,
        "wordCount": total_words,
        "author": {
            "@type": "Organization",
            "name": "Writara Studio"
        }
    }

    return {
        "seo_score": seo_score,
        "meta_title": meta_title,
        "meta_title_length": len(meta_title),
        "meta_description": meta_description,
        "meta_description_length": len(meta_description),
        "serp_url": serp_url,
        "word_count": total_words,
        "headings": {
            "h1": [meta_title],
            "h2": h2_matches,
            "h3": h3_matches,
            "total_headings": 1 + len(h2_matches) + len(h3_matches)
        },
        "keywords": kw_metrics,
        "checks": checks,
        "schema_json_ld": json.dumps(schema_json_ld, indent=2)
    }


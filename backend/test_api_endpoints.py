import urllib.request
import json
import sys

BASE_URL = "http://127.0.0.1:8000"
errors = []

_client = None
try:
    with urllib.request.urlopen(f"{BASE_URL}/api/health", timeout=1):
        pass
except Exception:
    try:
        from fastapi.testclient import TestClient
        from main import app
        _client = TestClient(app)
    except Exception as e:
        print(f"Failed to initialize in-process TestClient fallback: {e}", file=sys.stderr)
        raise RuntimeError(f"Standalone server at {BASE_URL} not reachable and TestClient initialization failed: {e}") from e

def request(method, path, data=None):
    if _client is not None:
        try:
            res = _client.request(method, path, json=data)
            try:
                body = res.json()
            except Exception:
                body = res.text
            return res.status_code, body
        except Exception as e:
            return 500, f"Exception: {e}"

    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    body = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=15) as res:
            res_body = res.read().decode("utf-8")
            return res.status, json.loads(res_body) if res_body else {}
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        return e.code, f"HTTP {e.code}: {err_body}"
    except Exception as e:
        return 500, f"Exception: {e}"

sys.stdout.reconfigure(encoding='utf-8')

def test(name, fn):
    print(f"Testing {name:34} ...", end=" ", flush=True)
    try:
        fn()
        print("[PASS]")
    except Exception as e:
        print(f"[FAIL]: {e}")
        errors.append((name, str(e)))

# 1. Health
def t_health():
    code, data = request("GET", "/api/health")
    assert code == 200, f"Expected 200, got {code}: {data}"
    assert data.get("status") == "ok"

# 2. Generate
def t_generate():
    code, data = request("POST", "/api/generate", {
        "topic": "Benefits of AI in Sustainable Agriculture",
        "content_type": "blog_post",
        "tone": "Informative",
        "audience": "Farmers and Tech Enthusiasts",
        "length": "medium",
        "keywords": ["AI", "Sustainability", "Farming"]
    })
    assert code == 200, f"Expected 200, got {code}: {data}"
    assert "content" in data and len(data["content"]) > 50

# 3. Edit
def t_edit():
    code, data = request("POST", "/api/edit", {
        "action": "improve_clarity",
        "text": "AI can really helps lots of peoples to do they farming way better and good."
    })
    assert code == 200, f"Expected 200, got {code}: {data}"
    assert "edited_text" in data

# 4. Repurpose
def t_repurpose():
    code, data = request("POST", "/api/repurpose", {
        "source_content": "Antigravity enables developer agents to build robust software systems with pair programming."
    })
    assert code == 200, f"Expected 200, got {code}: {data}"
    assert data.get("formats_generated", 0) > 0

# 5. Evaluate
def t_evaluate():
    code, data = request("POST", "/api/evaluate", {
        "text": "Antigravity enables developer agents to build robust software systems with pair programming."
    })
    assert code == 200, f"Expected 200, got {code}: {data}"
    assert "overall_score" in data and "readability" in data

# 6. SEO
def t_seo():
    code, data = request("POST", "/api/seo/analyze", {
        "content": "# Sustainable Farming with AI\nArtificial intelligence empowers modern agriculture by analyzing soil moisture.",
        "target_keyword": "sustainable farming"
    })
    assert code == 200, f"Expected 200, got {code}: {data}"
    assert "seo_score" in data and "meta_title" in data

# 7. Headlines
def t_headlines():
    code, data = request("POST", "/api/headlines/ab-test", {
        "topic": "How AI transforms organic farming in 2026"
    })
    assert code == 200, f"Expected 200, got {code}: {data}"
    assert len(data.get("headlines", [])) > 0

# 8. Cliches
def t_cliches():
    code, data = request("POST", "/api/cliches/scan", {
        "text": "In today's fast-paced digital world, it is a game-changer that pushes the envelope."
    })
    assert code == 200, f"Expected 200, got {code}: {data}"
    assert isinstance(data, dict), f"Data is not dict: {data}"
    assert data.get("cliches_found_count", 0) > 0, f"No cliches found in data: {data}"

# 9. Brand Voice CRUD
def t_brand_voice():
    # List
    code, voices = request("GET", "/api/brand-voice")
    assert code == 200, f"List failed: {code}"
    
    # Create
    code, created = request("POST", "/api/brand-voice", {
        "name": "Integration Test Persona",
        "description": "Created during automated testing",
        "tone_keywords": ["Sharp", "Engaging"],
        "formality_score": 75,
        "enthusiasm_score": 80
    })
    assert code == 200, f"Create failed: {code}"
    vid = created["id"]
    
    # Delete
    code, _ = request("DELETE", f"/api/brand-voice/{vid}")
    assert code == 200, f"Delete failed: {code}"

# 10. Documents CRUD
def t_documents():
    # List
    code, docs = request("GET", "/api/documents")
    assert code == 200, f"List failed: {code}"
    
    # Create
    code, created = request("POST", "/api/documents", {
        "title": "Integration Test Document",
        "content": "Automated verification test draft body.",
        "content_type": "article",
        "tone": "Direct"
    })
    assert code == 200, f"Create failed: {code}"
    did = created["id"]
    
    # Update
    code, _ = request("PUT", f"/api/documents/{did}", {
        "title": "Updated Integration Test Document"
    })
    assert code == 200, f"Update failed: {code}"
    
    # Delete
    code, _ = request("DELETE", f"/api/documents/{did}")
    assert code == 200, f"Delete failed: {code}"

# 11. Calendar CRUD
def t_calendar():
    # List
    code, posts = request("GET", "/api/calendar/posts")
    assert code == 200, f"List failed: {code}"
    
    # Create
    code, created = request("POST", "/api/calendar/posts", {
        "title": "Test Integration Calendar Post",
        "content": "Test scheduled social snippet",
        "platform": "twitter",
        "scheduled_date": "2026-11-26",
        "scheduled_time": "09:00 AM",
        "status": "scheduled"
    })
    assert code == 200, f"Create failed: {code}"
    pid = created["id"]
    
    # Update
    code, _ = request("PUT", f"/api/calendar/posts/{pid}", {
        "status": "published"
    })
    assert code == 200, f"Update failed: {code}"
    
    # Delete
    code, _ = request("DELETE", f"/api/calendar/posts/{pid}")
    assert code == 200, f"Delete failed: {code}"

# 12. Analytics
def t_analytics():
    code, data = request("GET", "/api/analytics")
    assert code == 200, f"Expected 200, got {code}: {data}"
    assert "total_words_generated" in data

# 13. Projects
def t_projects():
    code, data = request("GET", "/api/projects")
    assert code == 200, f"Expected 200, got {code}: {data}"

print("======================================================")
print("       WRITARA FULL-STACK API TEST SUITE              ")
print("======================================================")
test("1. System Health Check", t_health)
test("2. AI Content Generator", t_generate)
test("3. Smart In-Line Editor", t_edit)
test("4. 1-Click Repurposer", t_repurpose)
test("5. Content Quality & Fact Audit", t_evaluate)
test("6. SEO Suite & SERP Analyzer", t_seo)
test("7. Headline A/B Testing Matrix", t_headlines)
test("8. AI Cliché Detector", t_cliches)
test("9. Brand Voice Memory CRUD", t_brand_voice)
test("10. Documents & Drafts CRUD", t_documents)
test("11. Content Calendar CRUD", t_calendar)
test("12. Executive Analytics Dashboard", t_analytics)
test("13. Projects Management", t_projects)

print("======================================================")
if errors:
    print(f"[FAIL] {len(errors)} tests failed!")
    for name, err in errors:
        print(f"  - {name}: {err}")
    sys.exit(1)
else:
    print(">>> ALL 13 ENDPOINT TESTS PASSED WITH 100% SUCCESS! <<<")

import os
import sys
import json
import asyncio
import unittest
from unittest.mock import patch, MagicMock, AsyncMock
from concurrent.futures import ThreadPoolExecutor
import httpx
from fastapi.testclient import TestClient

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main import app
from services.ai_service import call_gemini, get_last_gemini_model


class TestGeminiIntegration(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_missing_api_key(self):
        """When no API key is provided and GEMINI_API_KEY is unset, call_gemini returns None."""
        async def _run():
            with patch.dict(os.environ, {"GEMINI_API_KEY": ""}, clear=False):
                res = await call_gemini("Test prompt", api_key="")
                return res, get_last_gemini_model()

        res, model = asyncio.run(_run())
        self.assertIsNone(res)
        self.assertIsNone(model)

    def test_missing_api_key_endpoint_fallback(self):
        """When no API key is present, /api/generate uses Algorithmic Engine (Local)."""
        with patch.dict(os.environ, {"GEMINI_API_KEY": ""}, clear=False):
            response = self.client.post("/api/generate", json={
                "topic": "Clean Energy",
                "content_type": "blog_post",
                "api_key": ""
            })
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertIn("content", data)
            self.assertGreater(len(data["content"]), 50)
            self.assertEqual(data.get("provider"), "Algorithmic Engine (Local)")

    def test_primary_model_success(self):
        """Primary model (gemini-3.8-flash) generates content successfully with header auth."""
        mock_response = MagicMock(spec=httpx.Response)
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "candidates": [
                {
                    "content": {
                        "parts": [{"text": "Groundbreaking Gemini 3.8 Flash Content"}]
                    }
                }
            ]
        }

        async def _run():
            async def mock_post(url, headers=None, json=None):
                self.assertIn("gemini-3.8-flash", url)
                self.assertEqual(headers.get("x-goog-api-key"), "test-secret-key-123")
                self.assertNotIn("test-secret-key-123", url, "API key should not be in URL query")
                return mock_response

            with patch("httpx.AsyncClient.post", side_effect=mock_post):
                res = await call_gemini("Test prompt", api_key="test-secret-key-123")
                return res, get_last_gemini_model()

        res, model = asyncio.run(_run())
        self.assertEqual(res, "Groundbreaking Gemini 3.8 Flash Content")
        self.assertEqual(model, "gemini-3.8-flash")

    def test_primary_model_success_endpoint_provider(self):
        """Endpoint accurately reports Google Gemini 3.8 Flash when primary model succeeds."""
        mock_response = MagicMock(spec=httpx.Response)
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "candidates": [
                {
                    "content": {
                        "parts": [{"text": "AI revolutionized agriculture in 2026."}]
                    }
                }
            ]
        }

        with patch("httpx.AsyncClient.post", return_value=mock_response):
            response = self.client.post("/api/generate", json={
                "topic": "Future of Farming",
                "content_type": "article",
                "api_key": "valid-gemini-key"
            })
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertEqual(data["content"], "AI revolutionized agriculture in 2026.")
            self.assertEqual(data.get("provider"), "Google Gemini 3.8 Flash")

    def test_backup_model_success_when_primary_fails(self):
        """When primary model returns an error, backup model (gemini-3.5-flash-lite) succeeds."""
        primary_response = MagicMock(spec=httpx.Response)
        primary_response.status_code = 404
        primary_response.json.return_value = {
            "error": {
                "code": 404,
                "message": "models/gemini-3.8-flash not found",
                "status": "NOT_FOUND"
            }
        }
        primary_response.text = '{"error": {"code": 404, "message": "not found"}}'

        backup_response = MagicMock(spec=httpx.Response)
        backup_response.status_code = 200
        backup_response.json.return_value = {
            "candidates": [
                {
                    "content": {
                        "parts": [{"text": "Fast response from Gemini 3.5 Flash Lite"}]
                    }
                }
            ]
        }

        calls = []
        async def _run():
            async def mock_post(url, headers=None, json=None):
                calls.append(url)
                if "gemini-3.8-flash" in url:
                    return primary_response
                elif "gemini-3.5-flash-lite" in url:
                    return backup_response
                raise ValueError(f"Unexpected url {url}")

            with patch("httpx.AsyncClient.post", side_effect=mock_post):
                res = await call_gemini("Test prompt", api_key="test-key")
                return res, get_last_gemini_model()

        res, model = asyncio.run(_run())
        self.assertEqual(res, "Fast response from Gemini 3.5 Flash Lite")
        self.assertEqual(model, "gemini-3.5-flash-lite")
        self.assertEqual(len(calls), 2)

    def test_backup_model_success_endpoint_provider(self):
        """Endpoint accurately reports Google Gemini 3.5 Flash Lite (Backup) when backup succeeds."""
        primary_response = MagicMock(spec=httpx.Response)
        primary_response.status_code = 503
        primary_response.json.return_value = {"error": {"message": "Service unavailable", "status": "UNAVAILABLE"}}
        primary_response.text = "Service unavailable"

        backup_response = MagicMock(spec=httpx.Response)
        backup_response.status_code = 200
        backup_response.json.return_value = {
            "candidates": [
                {
                    "content": {
                        "parts": [{"text": "Reliable backup content generated."}]
                    }
                }
            ]
        }

        async def mock_post(url, headers=None, json=None):
            if "gemini-3.8-flash" in url:
                return primary_response
            return backup_response

        with patch("httpx.AsyncClient.post", side_effect=mock_post):
            response = self.client.post("/api/generate", json={
                "topic": "Resilience in Distributed Systems",
                "content_type": "post",
                "api_key": "test-key"
            })
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertEqual(data["content"], "Reliable backup content generated.")
            self.assertEqual(data.get("provider"), "Google Gemini 3.5 Flash Lite (Backup)")

    def test_http_errors_and_sanitized_logging(self):
        """HTTP errors (400, 403, 429) log sanitized messages without exposing the API key."""
        error_response = MagicMock(spec=httpx.Response)
        error_response.status_code = 403
        error_response.json.return_value = {
            "error": {
                "code": 403,
                "message": "Requests from this API key AIzaSyFakeSecretKey are blocked by API restriction.",
                "status": "PERMISSION_DENIED"
            }
        }
        error_response.text = "Blocked by API restriction"

        async def _run():
            with patch("httpx.AsyncClient.post", return_value=error_response), \
                 patch("builtins.print") as mock_print:
                res = await call_gemini("Test prompt", api_key="AIzaSyFakeSecretKey")
                model = get_last_gemini_model()

                # Verify that the logged text never contains the secret key
                for call in mock_print.call_args_list:
                    log_text = " ".join(str(a) for a in call[0])
                    self.assertNotIn("AIzaSyFakeSecretKey", log_text, "Secret key was leaked in print logs!")
                    if "failed:" in log_text:
                        self.assertIn("Permission denied", log_text)

                return res, model

        res, model = asyncio.run(_run())
        self.assertIsNone(res)
        self.assertIsNone(model)

    def test_timeout_handling(self):
        """Timeout on primary and backup models results in clean fallback without crashing."""
        async def _run():
            with patch("httpx.AsyncClient.post", side_effect=httpx.TimeoutException("Request timed out")), \
                 patch("builtins.print") as mock_print:
                res = await call_gemini("Test prompt", api_key="test-key")
                model = get_last_gemini_model()

                timeout_logged = any("timed out" in " ".join(str(a) for a in c[0]) for c in mock_print.call_args_list)
                self.assertTrue(timeout_logged)
                return res, model

        res, model = asyncio.run(_run())
        self.assertIsNone(res)
        self.assertIsNone(model)

    def test_all_models_fail_endpoint_fallback(self):
        """When all Gemini models fail, /api/generate falls back to Algorithmic Engine (Local - Gemini unavailable)."""
        error_response = MagicMock(spec=httpx.Response)
        error_response.status_code = 429
        error_response.json.return_value = {"error": {"message": "Resource exhausted", "status": "RESOURCE_EXHAUSTED"}}
        error_response.text = "Quota exceeded"

        with patch("httpx.AsyncClient.post", return_value=error_response):
            response = self.client.post("/api/generate", json={
                "topic": "Scaling Web Services",
                "content_type": "guide",
                "api_key": "some-api-key"
            })
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertIn("content", data)
            self.assertGreater(len(data["content"]), 50)
            self.assertEqual(data.get("provider"), "Algorithmic Engine (Local - Gemini unavailable)")

    def test_unknown_or_none_model_reports_generic_gemini_provider(self):
        """When Gemini generates text but get_last_gemini_model() is None or unknown, report 'Google Gemini API'."""
        with patch("main.call_gemini", return_value="Text from custom Gemini call"), \
             patch("main.get_last_gemini_model", return_value=None):
            response = self.client.post("/api/generate", json={
                "topic": "Future Trends",
                "content_type": "article",
                "api_key": "valid-key"
            })
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertEqual(data["content"], "Text from custom Gemini call")
            self.assertEqual(data.get("provider"), "Google Gemini API")

    def test_concurrent_requests_model_isolation(self):
        """Verify request-safety: simultaneous requests with different model outcomes never cross-contaminate providers."""
        def make_success_response(text):
            r = MagicMock(spec=httpx.Response)
            r.status_code = 200
            r.json.return_value = {"candidates": [{"content": {"parts": [{"text": text}]}}]}
            return r

        def make_error_response(status_code=503):
            r = MagicMock(spec=httpx.Response)
            r.status_code = status_code
            r.json.return_value = {"error": {"message": "Service unavailable", "status": "UNAVAILABLE"}}
            r.text = "Service unavailable"
            return r

        # Request 1: Primary succeeds, but we simulate network delay so Request 2 starts and finishes while Request 1 is in-flight.
        # Request 2: Primary fails, Backup succeeds fast.
        async def mock_post(url, headers=None, json=None):
            req_content = json.get("contents", [{}])[0].get("parts", [{}])[0].get("text", "")
            if "Request-Alpha" in req_content:
                # Primary model succeeds after slight delay
                await asyncio.sleep(0.05)
                return make_success_response("Content Alpha from Gemini 3.8 Flash")
            elif "Request-Beta" in req_content:
                # Primary fails, backup succeeds immediately
                if "gemini-3.8-flash" in url:
                    return make_error_response(503)
                else:
                    return make_success_response("Content Beta from Gemini 3.5 Flash Lite")
            return make_success_response("Default response")

        with patch("httpx.AsyncClient.post", side_effect=mock_post):
            with ThreadPoolExecutor(max_workers=2) as executor:
                f1 = executor.submit(
                    self.client.post,
                    "/api/generate",
                    json={"topic": "Request-Alpha", "content_type": "article", "api_key": "test-key"}
                )
                f2 = executor.submit(
                    self.client.post,
                    "/api/generate",
                    json={"topic": "Request-Beta", "content_type": "article", "api_key": "test-key"}
                )

                resp1 = f1.result()
                resp2 = f2.result()

            self.assertEqual(resp1.status_code, 200)
            self.assertEqual(resp2.status_code, 200)

            data1 = resp1.json()
            data2 = resp2.json()

            # Verify complete provider isolation between concurrent requests
            self.assertEqual(data1.get("provider"), "Google Gemini 3.8 Flash")
            self.assertEqual(data1.get("content"), "Content Alpha from Gemini 3.8 Flash")

            self.assertEqual(data2.get("provider"), "Google Gemini 3.5 Flash Lite (Backup)")
            self.assertEqual(data2.get("content"), "Content Beta from Gemini 3.5 Flash Lite")


if __name__ == "__main__":
    unittest.main()

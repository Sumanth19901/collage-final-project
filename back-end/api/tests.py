from datetime import timedelta
from unittest.mock import MagicMock, patch

from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import OTP, Resume


def create_test_resume(user, analysis_data=None):
    return Resume.objects.create(
        user=user,
        file=SimpleUploadedFile("resume.pdf", b"%PDF-1.4\n%%EOF", content_type="application/pdf"),
        analysis_data=analysis_data or {},
    )


class ModelBehaviorTests(TestCase):
    def test_profile_is_created_by_signal_on_user_create(self):
        user = User.objects.create_user(username="signal-user", email="signal@example.com", password="StrongPass123!")
        self.assertTrue(hasattr(user, "profile"))

    def test_otp_is_valid_respects_expiration(self):
        valid_otp = OTP.objects.create(
            email="valid@example.com",
            code="123456",
            expires_at=timezone.now() + timedelta(minutes=5),
        )
        expired_otp = OTP.objects.create(
            email="expired@example.com",
            code="654321",
            expires_at=timezone.now() - timedelta(minutes=1),
        )

        self.assertTrue(valid_otp.is_valid())
        self.assertFalse(expired_otp.is_valid())


class AuthAndOtpApiTests(APITestCase):
    def test_register_creates_user_profile_and_tokens(self):
        payload = {
            "username": "newuser@example.com",
            "email": "newuser@example.com",
            "password": "StrongPass123!",
            "fullName": "New User",
        }
        res = self.client.post("/api/auth/register/", payload, format="json")

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn("user", res.data)
        self.assertIn("access", res.data)
        self.assertIn("refresh", res.data)
        self.assertEqual(res.data["user"]["profile"]["name"], "New User")

    def test_register_duplicate_email_is_rejected(self):
        User.objects.create_user(username="first", email="dup@example.com", password="StrongPass123!")

        res = self.client.post(
            "/api/auth/register/",
            {
                "username": "second",
                "email": "dup@example.com",
                "password": "StrongPass123!",
            },
            format="json",
        )

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(res.data["error"], "A user with that email already exists.")

    def test_login_with_registered_user_returns_tokens(self):
        user = User.objects.create_user(
            username="login-user",
            email="login@example.com",
            password="StrongPass123!",
        )

        res = self.client.post(
            "/api/auth/login/",
            {"email": user.email, "password": "StrongPass123!"},
            format="json",
        )

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("token", res.data)
        self.assertIn("access", res.data)
        self.assertEqual(res.data["user"]["email"], user.email)

    def test_login_invalid_credentials_returns_401(self):
        res = self.client.post(
            "/api/auth/login/",
            {"email": "missing@example.com", "password": "invalid"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(res.data["error"], "Invalid credentials")

    def test_send_otp_requires_email(self):
        res = self.client.post("/api/auth/send-otp/", {}, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(res.data["error"], "Email is required")

    def test_send_and_verify_otp_success_path(self):
        email = "otp@example.com"
        send_res = self.client.post("/api/auth/send-otp/", {"email": email}, format="json")

        self.assertEqual(send_res.status_code, status.HTTP_200_OK)
        otp = OTP.objects.filter(email=email).order_by("-created_at").first()
        self.assertIsNotNone(otp)

        verify_res = self.client.post(
            "/api/auth/verify-otp/",
            {"email": email, "otp": otp.code},
            format="json",
        )
        self.assertEqual(verify_res.status_code, status.HTTP_200_OK)
        self.assertFalse(OTP.objects.filter(id=otp.id).exists())

    def test_verify_otp_rejects_expired_code(self):
        OTP.objects.create(
            email="expired@example.com",
            code="111222",
            expires_at=timezone.now() - timedelta(minutes=1),
        )

        res = self.client.post(
            "/api/auth/verify-otp/",
            {"email": "expired@example.com", "otp": "111222"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(res.data["error"], "Invalid or expired OTP")


class ProfileAndResumeApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="profile-user",
            email="profile@example.com",
            password="StrongPass123!",
        )
        self.client.force_authenticate(user=self.user)

    def test_profile_get_returns_user_payload(self):
        res = self.client.get("/api/auth/profile/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["email"], "profile@example.com")
        self.assertIn("profile", res.data)

    def test_profile_patch_updates_profile_fields(self):
        res = self.client.patch(
            "/api/auth/profile/",
            {"bio": "I build APIs", "target_role": "Backend Engineer"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.profile.bio, "I build APIs")
        self.assertEqual(self.user.profile.target_role, "Backend Engineer")

    def test_resume_upload_without_file_returns_400(self):
        res = self.client.post("/api/resume/upload/", {}, format="multipart")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(res.data["error"], "No resume file provided")

    def test_resume_download_optimized_requires_ai_analysis(self):
        create_test_resume(self.user, analysis_data={"raw_text": "resume text"})
        res = self.client.get("/api/resume/download-optimized/")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("No AI optimized resume found", res.data["error"])

    def test_resume_download_optimized_returns_markdown(self):
        create_test_resume(
            self.user,
            analysis_data={"ai_analysis": {"improved_resume": "# Improved Resume"}},
        )
        res = self.client.get("/api/resume/download-optimized/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["improved_resume"], "# Improved Resume")

    def test_resume_analyze_returns_404_for_missing_resume(self):
        res = self.client.post("/api/resume/analyze/", {"resumeId": 99999}, format="json")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(res.data["error"], "Resume not found")

    @patch("api.views.genai.GenerativeModel")
    def test_resume_analyze_persists_analysis_and_updates_profile(self, mock_model_cls):
        resume = create_test_resume(self.user, analysis_data={"raw_text": "python django"})
        mock_model = MagicMock()
        mock_response = MagicMock()
        mock_response.text = """
        {
          "name": "Jane Doe",
          "bio": "Backend developer",
          "experience_level": "Entry Level",
          "inferred_role": "Software Engineer",
          "extracted_skills": ["Python", "Django"],
          "strengths": ["Fast learner"],
          "weaknesses": ["Testing depth"],
          "score": 82,
          "professional_suggestions": ["Add measurable achievements"],
          "improved_resume": "# Better Resume"
        }
        """
        mock_model.generate_content.return_value = mock_response
        mock_model_cls.return_value = mock_model

        res = self.client.post("/api/resume/analyze/", {"resumeId": resume.id}, format="json")

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["message"], "Analysis complete")
        self.assertEqual(res.data["analysis"]["name"], "Jane Doe")
        resume.refresh_from_db()
        self.assertEqual(resume.analysis_data["ai_analysis"]["score"], 82)
        self.user.refresh_from_db()
        self.assertEqual(self.user.profile.name, "Jane Doe")
        self.assertEqual(self.user.profile.target_role, "Software Engineer")


class AdvancedAgentViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="agent-user",
            email="agent@example.com",
            password="StrongPass123!",
        )
        self.client.force_authenticate(user=self.user)

    def test_agentic_tracker_requires_resume_context(self):
        res = self.client.post("/api/advanced/tracker/", {"command": "find jobs"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Please upload a resume", res.data["error"])

    @patch("api.agent_views.genai.GenerativeModel")
    def test_contextual_embeddings_parses_json_response(self, mock_model_cls):
        mock_model = MagicMock()
        mock_response = MagicMock()
        mock_response.text = '```json {"similarity_score_percentage": 91, "match_reasoning": "Strong match", "crucial_missing_vectors": ["Kafka"]} ```'
        mock_model.generate_content.return_value = mock_response
        mock_model_cls.return_value = mock_model

        res = self.client.post(
            "/api/advanced/embed/",
            {"resume_text": "python django", "job_description": "python django kafka"},
            format="json",
        )

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["similarity_score_percentage"], 91)
        self.assertEqual(res.data["crucial_missing_vectors"], ["Kafka"])

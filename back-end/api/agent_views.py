from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
import json
import os
import google.generativeai as genai
from .models import Resume

# Use Gemini configuration from views.py or .env
genai.configure(api_key=os.environ.get("GEMINI_API_KEY") or "")
MODEL_NAME = 'gemini-2.5-flash'

class ContextualEmbeddingsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        resume_text = request.data.get('resume_text', 'No resume provided')
        jd_text = request.data.get('job_description', 'No JD provided')

        sys_prompt = f"""
        Act as an expert ATS matching engine. Compare this Resume mathematically against the Job Description.
        Calculate a Cosine Similarity percentage (0-100). Provide a short match reasoning and list crucial missing skills.
        Return ONLY a JSON matching this schema:
        {{ "similarity_score_percentage": 85, "match_reasoning": "...", "crucial_missing_vectors": ["...", "..."] }}
        
        Resume: {resume_text}
        JD: {jd_text}
        """
        try:
            model = genai.GenerativeModel(MODEL_NAME)
            response = model.generate_content(sys_prompt)
            text = response.text.replace('```json', '').replace('```', '').strip()
            return Response(json.loads(text))
        except Exception as e:
            print(e)
            return Response({'error': 'Failed predicting embeddings'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MultimodalInterviewView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # In a real multimodal app, this accepts audio chunks. Here we accept transcribed text chunks.
        audio_transcript = request.data.get('transcript', '')
        
        sys_prompt = f"""
        You are a real-time behavioral interview coach. Analyze this 15-second audio transcript chunk for non-verbal cues (filler words, tone, pacing).
        Return ONLY a JSON matching this schema:
        {{ "timestamp_window": "00:00-00:15", "confidence_score": 80, "tone_analysis": "...", "filler_word_count": {{"um": 2}}, "live_coaching_nudge": "..." }}
        
        Transcript chunk: {audio_transcript}
        """
        try:
            model = genai.GenerativeModel(MODEL_NAME)
            response = model.generate_content(sys_prompt)
            text = response.text.replace('```json', '').replace('```', '').strip()
            return Response(json.loads(text))
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AgenticTrackerView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user_command = request.data.get('command', 'Find jobs')
        resume = Resume.objects.filter(user=request.user).order_by('-uploaded_at').first()
        if not resume or 'raw_text' not in (resume.analysis_data or {}):
            return Response({'error': 'Please upload a resume to provide context to the agent.'}, status=status.HTTP_400_BAD_REQUEST)
        
        raw_text = resume.analysis_data.get('raw_text', '')
        
        sys_prompt = f"""
        You are an autonomous Agentic Job Tracker. Simulate an action loop based on the user's command: "{user_command}".
        Using the candidate's exact resume provided below, identify 2-3 REAL companies that actively hire for their specific skill set. 
        DO NOT use fake, dummy, or placeholder companies/data. Draft highly personalized, realistic cover letters addressing those companies based on the candidate's true experience.

        Return ONLY a JSON simulating a function call to search and draft applications:
        {{
          "name": "search_and_draft_agent",
          "parameters": {{
            "action_taken": "search_jobs",
            "search_parameters": {{"role": "inferred from resume", "type": "inferred"}},
            "drafted_applications": [
              {{"company": "Real Company Name", "tailored_cover_letter": "Realistic draft utilizing details from the resume..."}}
            ],
            "jobs_saved_to_tracker": 2
          }}
        }}

        Candidate Resume:
        {raw_text}
        """
        try:
            model = genai.GenerativeModel(MODEL_NAME)
            response = model.generate_content(sys_prompt)
            text = response.text.replace('```json', '').replace('```', '').strip()
            return Response(json.loads(text))
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ShadowAuditView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        resume_text = request.data.get('resume_text', '')
        linkedin_text = request.data.get('linkedin_data', '')

        sys_prompt = f"""
        You are a ruthless technical recruiter. Compare the user's Resume against their public LinkedIn Profile data. Detect discrepancies and format issues.
        Return ONLY a JSON matching this schema:
        {{
          "overall_consistency_score": 70,
          "red_flags": [
            {{ "severity": "High", "issueType": "Date Discrepancy", "resume_value": "...", "linkedin_value": "...", "recommendation": "..." }}
          ],
          "missing_keywords_on_social": ["..."]
        }}
        
        Resume: {resume_text}
        LinkedIn: {linkedin_text}
        """
        try:
            model = genai.GenerativeModel(MODEL_NAME)
            response = model.generate_content(sys_prompt)
            text = response.text.replace('```json', '').replace('```', '').strip()
            return Response(json.loads(text))
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

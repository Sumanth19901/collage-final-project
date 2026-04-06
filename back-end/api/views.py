import random
from datetime import timedelta
from django.utils import timezone
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from .models import OTP, Resume, Profile
from .serializers import RegisterSerializer, UserSerializer, ProfileSerializer
import PyPDF2
import json
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
genai.configure(api_key=os.environ.get("GEMINI_API_KEY") or "")

class ResumeUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, req):
        if 'resume' not in req.FILES:
            return Response({'error': 'No resume file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        file = req.FILES['resume']
        resume = Resume.objects.create(user=req.user, file=file)
        
        # Parse PDF text
        text_content = ""
        try:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                text_content += page.extract_text() + " "
        except Exception as e:
            print("PDF Parse Error:", e)
            
        resume.analysis_data = {'raw_text': text_content}
        resume.save()

        return Response({
            'message': 'Resume uploaded successfully', 
            'resume': {'id': resume.id}
        }, status=status.HTTP_201_CREATED)

class ResumeAnalyzeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, req):
        resume_id = req.data.get('resumeId')
        try:
            resume = Resume.objects.get(id=resume_id, user=req.user)
        except Resume.DoesNotExist:
            return Response({'error': 'Resume not found'}, status=status.HTTP_404_NOT_FOUND)
            
        analysis_data = resume.analysis_data or {}
        text = analysis_data.get('raw_text', '').lower()
        
        target_role = 'developer'
        if hasattr(req.user, 'profile') and req.user.profile.target_role:
            target_role = req.user.profile.target_role.lower()
            
        # Prompt Gemini
        sys_prompt = f"""
        You are an expert ATS optimization engine and career advisor. You are reviewing a raw resume for a candidate aiming to be a '{target_role}'.
        1. Extract their `name`.
        2. Write a short professional `bio` (2-3 sentences max).
        3. Identify their `experience_level` (e.g., 'Entry Level', 'Mid Level', 'Senior').
        4. Infer their primary `inferred_role` from the specific resume content.
        5. Extract their actual skills into the array `extracted_skills`.
        6. List 2-3 `strengths` and 2-3 `weaknesses` (each short bullet points).
        7. Rate their overall ATS profile readiness from 0 to 100 as an integer `score`.
        8. Provide 3-5 `professional_suggestions` for them to improve their narrative or technical depth.
        9. Finally, act like a professional copywriter and rewrite a significantly `improved_resume` in Markdown format designed to easily pass ATS and impress recruiters. Be detailed and make things sound impactful.

        Respond purely with a JSON object in exactly this format, wrapping nothing else:
        {{
            "name": "Full Name",
            "bio": "short professional bio",
            "experience_level": "Entry Level",
            "inferred_role": "Software Engineer",
            "extracted_skills": ["..", ".."],
            "strengths": ["..", ".."],
            "weaknesses": ["..", ".."],
            "score": 85,
            "professional_suggestions": ["..", ".."],
            "improved_resume": "string containing markdown"
        }}

        Raw Resume text:
        {text}
        """

        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            response = model.generate_content(sys_prompt)
            json_text = response.text.strip()
            if json_text.startswith("```json"):
                json_text = json_text[7:-3]
            elif json_text.startswith("```"):
                json_text = json_text[3:-3]
            
            analysis = json.loads(json_text)
        except Exception as e:
            print(f"Gemini LLM Error: {e}")
            analysis = {
                'name': '',
                'bio': '',
                'experience_level': '',
                'inferred_role': '',
                'extracted_skills': ['Skill Extraction Failed'],
                'strengths': ['Ensure GEMINI_API_KEY is properly set in the environment or .env file.'],
                'weaknesses': ['Could not connect to Google Generative AI.'],
                'score': 0,
                'professional_suggestions': ['Please add GEMINI_API_KEY to proceed.'],
                'improved_resume': 'No improved resume available. LLM error occurred.'
            }
        
        resume.analysis_data['ai_analysis'] = analysis
        resume.save()
        
        # --- Update Profile Automatically ---
        profile = getattr(req.user, 'profile', None)
        if profile:
            if analysis.get('name') and not profile.name:
                profile.name = analysis['name']
            if analysis.get('bio') and not profile.bio:
                profile.bio = analysis['bio']
            if analysis.get('experience_level') and not profile.experience_level:
                profile.experience_level = analysis['experience_level']
            if analysis.get('inferred_role') and not profile.target_role:
                profile.target_role = analysis['inferred_role']
            profile.save()
        
        return Response({'message': 'Analysis complete', 'analysis': analysis}, status=status.HTTP_200_OK)

class GapAnalysisView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, req):
        resume = Resume.objects.filter(user=req.user).order_by('-uploaded_at').first()
        if not resume or 'raw_text' not in (resume.analysis_data or {}):
            return Response({'error': 'Please upload a resume first to generate real data.'}, status=status.HTTP_400_BAD_REQUEST)

        target_role = getattr(req.user.profile, 'target_role', 'Software Engineer')
        raw_text = resume.analysis_data.get('raw_text', '')

        sys_prompt = f"""
        You are an expert tech recruiter. Analyzing the resume below for a candidate aiming to be a '{target_role}':
        Identify their current matching skills, missing industry-standard skills for this role, and calculate a gap percentage (0-100).
        Respond exactly in this JSON format:
        {{
            "matchingSkills": ["skill1", "skill2"],
            "missingSkills": ["missing1", "missing2"],
            "gapPercentage": 40
        }}
        Resume text:
        {raw_text}
        """
        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            res = model.generate_content(sys_prompt)
            data_text = res.text.strip()
            if data_text.startswith("```json"): data_text = data_text[7:-3]
            elif data_text.startswith("```"): data_text = data_text[3:-3]
            analysis = json.loads(data_text)
        except Exception as e:
            print("Gemini Error:", e)
            return Response({'error': 'Failed to analyze gap dynamically.'}, status=500)

        return Response(analysis, status=status.HTTP_200_OK)

class RoadmapGenerateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, req):
        resume = Resume.objects.filter(user=req.user).order_by('-uploaded_at').first()
        if not resume or 'raw_text' not in (resume.analysis_data or {}):
            return Response({'error': 'Please upload a resume first.'}, status=status.HTTP_400_BAD_REQUEST)

        target_role = getattr(req.user.profile, 'target_role', 'Full Stack Engineer')
        raw_text = resume.analysis_data.get('raw_text', '')
        
        sys_prompt = f"""
        Based on the following resume and the target role '{target_role}':
        Generate a strictly personalized 5-step learning roadmap evaluating their current experience.
        Return ONLY valid JSON format:
        {{
            "roadmap_steps": [
                {{"id": 1, "title": "...", "description": "...", "status": "completed"}},
                {{"id": 2, "title": "...", "description": "...", "status": "in-progress"}},
                {{"id": 3, "title": "...", "description": "...", "status": "pending"}}
            ]
        }}
        Resume text:
        {raw_text}
        """
        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            res = model.generate_content(sys_prompt)
            data_text = res.text.strip()
            if data_text.startswith("```json"): data_text = data_text[7:-3]
            elif data_text.startswith("```"): data_text = data_text[3:-3]
            analysis = json.loads(data_text)
            roadmap_steps = analysis.get("roadmap_steps", [])
        except Exception as e:
            print("Gemini Error:", e)
            return Response({'error': 'Failed to generate roadmap dynamically.'}, status=500)

        return Response({
            'roadmap': {
                'id': f'roadmap-{req.user.id}',
                'target_role': target_role,
                'roadmap_steps': roadmap_steps
            }
        }, status=status.HTTP_200_OK)

class PlacementPredictView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, req):
        resume = Resume.objects.filter(user=req.user).order_by('-uploaded_at').first()
        if not resume or 'raw_text' not in (resume.analysis_data or {}):
            return Response({'error': 'Please upload a resume first.'}, status=status.HTTP_400_BAD_REQUEST)
        
        raw_text = resume.analysis_data.get('raw_text', '')
        sys_prompt = f"""
        Analyze this resume and predict realistic companies that would hire this candidate based on their exact tech stack and level.
        Return ONLY valid JSON:
        {{
            "readiness_score": 85,
            "predicted_companies": [
                {{"name": "RealCompany1 (based on skills)", "probability": "80%"}},
                {{"name": "RealCompany2", "probability": "70%"}}
            ]
        }}
        Resume: {raw_text}
        """
        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            res = model.generate_content(sys_prompt)
            data_text = res.text.strip()
            if data_text.startswith("```json"): data_text = data_text[7:-3]
            elif data_text.startswith("```"): data_text = data_text[3:-3]
            prediction = json.loads(data_text)
        except Exception as e:
            return Response({'error': 'Failed to predict.'}, status=500)
            
        return Response({'prediction': prediction}, status=status.HTTP_200_OK)

class MockInterviewView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, req):
        resume = Resume.objects.filter(user=req.user).order_by('-uploaded_at').first()
        if not resume or 'raw_text' not in (resume.analysis_data or {}):
            return Response({'error': 'Please upload a resume first.'}, status=status.HTTP_400_BAD_REQUEST)
            
        target_role = getattr(req.user.profile, 'target_role', 'Software Engineer')
        raw_text = resume.analysis_data.get('raw_text', '')

        sys_prompt = f"""
        Based on this candidate's resume and their target role '{target_role}', generate 3 realistic, highly specific mock interview questions they would face.
        Return ONLY valid JSON:
        {{
            "questions": [
                {{"id": 1, "text": "...", "type": "technical"}},
                {{"id": 2, "text": "...", "type": "behavioral"}},
                {{"id": 3, "text": "...", "type": "technical"}}
            ]
        }}
        Resume text:
        {raw_text}
        """
        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            res = model.generate_content(sys_prompt)
            data_text = res.text.strip()
            if data_text.startswith("```json"): data_text = data_text[7:-3]
            elif data_text.startswith("```"): data_text = data_text[3:-3]
            analysis = json.loads(data_text)
            questions = analysis.get("questions", [])
        except Exception:
            return Response({'error': 'Failed to generate.'}, status=500)

        return Response({'questions': questions}, status=status.HTTP_200_OK)

    def post(self, req):
        resume = Resume.objects.filter(user=req.user).order_by('-uploaded_at').first()
        raw_text = resume.analysis_data.get('raw_text', '') if resume else ''
        answers = req.data.get('answers', {})
        
        sys_prompt = f"""
        Evaluate these interview answers for a candidate with this resume: 
        Resume: {raw_text}
        Answers: {json.dumps(answers)}
        Return JSON: {{"feedback": "detailed paragraph...", "score": 85}}
        """
        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            res = model.generate_content(sys_prompt)
            data_text = res.text.strip()
            if data_text.startswith("```json"): data_text = data_text[7:-3]
            elif data_text.startswith("```"): data_text = data_text[3:-3]
            analysis = json.loads(data_text)
            return Response({
                'message': 'Evaluated successfully',
                'feedback': analysis.get('feedback', 'Good attempt.'),
                'score': analysis.get('score', 80)
            }, status=status.HTTP_200_OK)
        except Exception:
            return Response({'error': 'Evaluation failed'}, status=500)

class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, req):
        serializer = UserSerializer(req.user)
        return Response(serializer.data)

    def patch(self, req):
        profile, _ = Profile.objects.get_or_create(user=req.user)
        serializer = ProfileSerializer(profile, data=req.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(req.user).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, req):
        serializer = RegisterSerializer(data=req.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        
        first_error_list = next(iter(serializer.errors.values())) if serializer.errors else ['Registration failed']
        first_error = first_error_list[0] if isinstance(first_error_list, list) else first_error_list
        return Response({'error': first_error}, status=status.HTTP_400_BAD_REQUEST)

class SendOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, req):
        email = req.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

        otp_code = str(random.randint(100000, 999999))
        expires_at = timezone.now() + timedelta(minutes=10)
        OTP.objects.create(email=email, code=otp_code, expires_at=expires_at)

        print(f"[DEMO] OTP for {email}: {otp_code}")

        # try:
        #     send_mail(
        #         'Your ACIA OTP Code',
        #         f'Your OTP is: {otp_code}',
        #         settings.EMAIL_HOST_USER,
        #         [email],
        #         fail_silently=False,
        #     )
        # except Exception as e:
        #     print(f"Email error: {e}")

        return Response({'message': 'OTP sent successfully (Check console)'}, status=status.HTTP_200_OK)

class VerifyOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, req):
        email = req.data.get('email')
        code = req.data.get('otp')
        
        otp = OTP.objects.filter(email=email, code=code).order_by('-created_at').first()
        if otp and otp.is_valid():
            otp.delete() # Consume OTP
            return Response({'message': 'OTP verified successfully'}, status=status.HTTP_200_OK)
        return Response({'error': 'Invalid or expired OTP'}, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, req):
        email = req.data.get('email')
        password = req.data.get('password')
        
        # Bypass for demo admin as in old code
        if email in ['admin@demo.acia', 'kasisumanth8@gmail.com'] and password == 'admin_password_2026':
            user, created = User.objects.get_or_create(username=email, email=email)
            if created:
                user.set_password(password)
                user.save()
        else:
            try:
                user = User.objects.get(email=email)
                if not user.check_password(password):
                    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
            except User.DoesNotExist:
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
            except User.MultipleObjectsReturned:
                user = User.objects.filter(email=email).first()
                if not user.check_password(password):
                    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'token': str(refresh.access_token), # For compatibility with frontend
        })

class ResumeOptimizedDownloadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, req):
        from .models import Resume
        resume = Resume.objects.filter(user=req.user).order_by('-uploaded_at').first()
        if not resume or 'ai_analysis' not in (resume.analysis_data or {}):
            return Response({'error': 'No AI optimized resume found. Please upload a resume first.'}, status=400)
            
        markdown_text = resume.analysis_data['ai_analysis'].get('improved_resume', 'Optimized resume content not found.')
        return Response({'improved_resume': markdown_text}, status=200)

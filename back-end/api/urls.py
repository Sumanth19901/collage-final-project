from django.urls import path
from .views import (
    RegisterView, LoginView, SendOTPView, VerifyOTPView,
    ResumeUploadView, ResumeAnalyzeView, GapAnalysisView,
    RoadmapGenerateView, PlacementPredictView, MockInterviewView,
    ProfileView, ResumeOptimizedDownloadView
)
from .agent_views import (
    ContextualEmbeddingsView, MultimodalInterviewView, AgenticTrackerView, ShadowAuditView
)

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/send-otp/', SendOTPView.as_view(), name='send-otp'),
    path('auth/verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('resume/upload/', ResumeUploadView.as_view(), name='resume-upload'),
    path('resume/analyze/', ResumeAnalyzeView.as_view(), name='resume-analyze'),
    path('resume/download-optimized/', ResumeOptimizedDownloadView.as_view(), name='resume-download-optimized'),
    path('skills/gap-analysis/', GapAnalysisView.as_view(), name='gap-analysis'),
    path('roadmap/generate/', RoadmapGenerateView.as_view(), name='roadmap-generate'),
    path('placement/predict/', PlacementPredictView.as_view(), name='placement-predict'),
    path('auth/profile/', ProfileView.as_view(), name='profile'),
    
    # Advanced AI Agent Prototypes
    path('advanced/embed/', ContextualEmbeddingsView.as_view(), name='advanced-embed'),
    path('advanced/interview/', MultimodalInterviewView.as_view(), name='advanced-interview'),
    path('advanced/tracker/', AgenticTrackerView.as_view(), name='advanced-tracker'),
    path('advanced/audit/', ShadowAuditView.as_view(), name='advanced-audit'),
]

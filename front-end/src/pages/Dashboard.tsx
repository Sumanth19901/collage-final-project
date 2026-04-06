import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, Upload, BarChart3, BookOpen, MessageSquare, Target, LogOut, Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import { toast } from "sonner";
import ResumeUpload from "@/components/dashboard/ResumeUpload";
import PlacementScore from "@/components/dashboard/PlacementScore";
import SkillGapAnalysis from "@/components/dashboard/SkillGapAnalysis";
import LearningRoadmap from "@/components/dashboard/LearningRoadmap";
import InterviewPrep from "@/components/dashboard/InterviewPrep";
import ProfileOverview from "@/components/dashboard/ProfileOverview";
import UserProfile from "@/components/dashboard/UserProfile";
import MultimodalSimulator from "@/components/dashboard/MultimodalSimulator";
import ContextualEmbeddings from "@/components/dashboard/ContextualEmbeddings";
import AgenticTracker from "@/components/dashboard/AgenticTracker";
import ShadowOptimizer from "@/components/dashboard/ShadowOptimizer";
import { ModeToggle } from "@/components/mode-toggle";

type TabKey = "overview" | "resume" | "skills" | "roadmap" | "interview" | "simulator" | "embeddings" | "agentic" | "audit" | "profile";

const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "overview", label: "Overview", icon: BarChart3 },
  { key: "resume", label: "Resume", icon: Upload },
  { key: "skills", label: "Skill Gap", icon: Target },
  { key: "roadmap", label: "Roadmap", icon: BookOpen },
  { key: "interview", label: "Interview", icon: MessageSquare },
  { key: "profile", label: "Profile", icon: User },
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const { data: user, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => authApi.getProfile().then(res => res.data),
  });

  useEffect(() => {
    if (user && !user.profile?.onboarding_completed) {
      navigate('/onboarding');
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <ProfileOverview onNavigate={setActiveTab} />;
      case "resume":
        return <ResumeUpload />;
      case "skills":
        return <SkillGapAnalysis />;
      case "roadmap":
        return <LearningRoadmap />;
      case "interview":
        return <InterviewPrep />;
      case "simulator":
        return <MultimodalSimulator />;
      case "embeddings":
        return <ContextualEmbeddings />;
      case "agentic":
        return <AgenticTracker />;
      case "audit":
        return <ShadowOptimizer />;
      case "profile":
        return <UserProfile onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="fixed top-0 w-full z-50 bg-card/80 backdrop-blur-md border-b h-14">
        <div className="flex items-center justify-between h-full px-4 lg:px-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-7 h-7 rounded-md gradient-accent flex items-center justify-center">
              <Brain className="w-4 h-4 text-accent-foreground" />
            </div>
            <span className="font-bold text-foreground">ACIA</span>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <button
              className="lg:hidden text-muted-foreground ml-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Button variant="ghost" size="sm" className="hidden lg:flex" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="flex pt-14">
        {/* Sidebar - desktop */}
        <aside className="hidden lg:flex flex-col w-56 fixed top-14 bottom-0 border-r bg-card p-4 gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab.key
                ? "bg-accent/10 text-accent"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:hidden fixed top-14 left-0 bottom-0 w-56 bg-card border-r z-40 p-4 flex flex-col gap-1"
          >
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab.key
                  ? "bg-accent/10 text-accent"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </motion.div>
        )}

        {/* Main content */}
        <main className="flex-1 lg:ml-56 p-4 lg:p-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

import { motion } from "framer-motion";
import { TrendingUp, Target, BookOpen, Upload, ArrowRight, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import PlacementScore from "./PlacementScore";

interface ProfileOverviewProps {
  onNavigate: (tab: "resume" | "skills" | "roadmap" | "interview") => void;
}

const quickActions = [
  { key: "resume" as const, icon: Upload, label: "Upload Resume", desc: "Analyze your skills" },
  { key: "skills" as const, icon: Target, label: "Skill Gap", desc: "Find missing skills" },
  { key: "roadmap" as const, icon: BookOpen, label: "Roadmap", desc: "Learning path" },
  { key: "interview" as const, icon: TrendingUp, label: "Interview Prep", desc: "Practice questions" },
];

const ProfileOverview = ({ onNavigate }: ProfileOverviewProps) => {
  const { data: user, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => authApi.getProfile().then(res => res.data),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  const displayName = user?.profile?.name || user?.username?.split('@')[0] || "User";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome Back, {displayName} 👋</h1>
        <p className="text-muted-foreground mt-1">Here's your career intelligence overview.</p>
      </div>

      {/* Placement Score */}
      <PlacementScore />

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <motion.button
              key={action.key}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => onNavigate(action.key)}
              className="group p-5 rounded-xl bg-card shadow-card hover:shadow-card-hover border border-border/50 text-left transition-all duration-300"
            >
              <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center mb-3 group-hover:bg-accent/20 transition-colors">
                <action.icon className="w-4 h-4 text-accent" />
              </div>
              <div className="font-semibold text-foreground text-sm">{action.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{action.desc}</div>
              <ArrowRight className="w-4 h-4 text-muted-foreground mt-3 group-hover:text-accent group-hover:translate-x-1 transition-all" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Recent Skills */}
      <div className="p-6 rounded-xl bg-card shadow-card border border-border/50">
        <h2 className="text-lg font-semibold text-foreground mb-4">Your Top Skills</h2>
        <div className="flex flex-wrap gap-2">
          {["Python", "React.js", "Machine Learning", "SQL", "JavaScript", "Data Structures", "REST APIs", "Git"].map(
            (skill) => (
              <span
                key={skill}
                className="px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-medium"
              >
                {skill}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileOverview;

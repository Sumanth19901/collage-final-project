import { motion } from "framer-motion";
import { Target, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { skillsApi } from "@/lib/api";

const SkillGapAnalysis = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['skill-gap'],
    queryFn: () => skillsApi.getGapAnalysis().then(res => res.data),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="w-10 h-10 text-accent animate-spin mb-4" />
        <p className="text-muted-foreground">Analyzing your skill gaps...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-12 mt-10 rounded-xl bg-card border border-border/50 shadow-card flex flex-col items-center justify-center text-center">
        <Target className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
        <h2 className="text-xl font-bold text-foreground mb-2">Skill Gap Analysis Locked</h2>
        <p className="text-muted-foreground max-w-md">Please upload a resume first so the AI can analyze your current skills map against industry standards.</p>
      </div>
    );
  }

  const { matchingSkills, missingSkills, gapPercentage } = data;
  const matchPercent = 100 - gapPercentage;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Skill Gap Analysis</h1>
        <p className="text-muted-foreground mt-1">Compare your skills against target job roles.</p>
      </div>

      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl bg-card shadow-card border border-border/50"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-accent" />
              <h3 className="font-semibold text-foreground">Target Role Assessment</h3>
            </div>
            <span className="text-sm font-bold text-accent">{matchPercent}% match</span>
          </div>

          <div className="w-full h-2 bg-secondary rounded-full mb-5 overflow-hidden">
            <motion.div
              className="h-full rounded-full gradient-accent"
              initial={{ width: 0 }}
              animate={{ width: `${matchPercent}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs font-medium text-muted-foreground">Skills You Have</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {matchingSkills.map((s: string) => (
                  <span key={s} className="px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                <span className="text-xs font-medium text-muted-foreground">Missing Skills</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {missingSkills.map((s: string) => (
                  <span key={s} className="px-2.5 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SkillGapAnalysis;


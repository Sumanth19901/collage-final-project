import { motion } from "framer-motion";
import { BookOpen, Clock, ExternalLink, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { roadmapApi } from "@/lib/api";
import { Button } from "@/components/ui/button";

const LearningRoadmap = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['roadmap'],
    queryFn: () => roadmapApi.generate('Full Stack Engineer').then(res => res.data),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="w-10 h-10 text-accent animate-spin mb-4" />
        <p className="text-muted-foreground">Generating your personalized roadmap...</p>
      </div>
    );
  }

  if (error || !data?.roadmap) {
    return (
      <div className="p-12 mt-10 rounded-xl bg-card border border-border/50 shadow-card flex flex-col items-center justify-center text-center">
        <Sparkles className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
        <h2 className="text-xl font-bold text-foreground mb-2">Roadmap Generation Locked</h2>
        <p className="text-muted-foreground max-w-md">Upload your resume to allow Gemini to analyze your exact experience level and generate a carefully curated 5-step learning roadmap.</p>
      </div>
    );
  }

  const roadmapData = data?.roadmap?.roadmap_steps || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Learning Roadmap</h1>
          <p className="text-muted-foreground mt-1">Your personalized path to placement readiness.</p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          Regenerate
        </Button>
      </div>

      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border hidden md:block" />

        <div className="space-y-6">
          {roadmapData.length > 0 ? (
            roadmapData.map((step: any, idx: number) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.12 }}
                className="md:pl-14 relative"
              >
                <div
                  className={`hidden md:flex absolute left-3 top-6 w-5 h-5 rounded-full border-2 items-center justify-center ${
                    step.status === 'completed'
                      ? "bg-accent border-accent"
                      : "bg-card border-border"
                  }`}
                >
                  {step.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-accent-foreground" />}
                </div>

                <div className="p-6 rounded-xl bg-card shadow-card border border-border/50">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-accent">STEP {step.id}</span>
                      <h3 className="font-semibold text-foreground">{step.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{step.description}</p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center p-12 text-muted-foreground">
              No roadmap generated yet. Click regenerate to start.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningRoadmap;


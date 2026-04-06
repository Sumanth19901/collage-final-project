import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { placementApi } from "@/lib/api";
import { Loader2, Target } from "lucide-react";

const PlacementScore = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['placement-score'],
    queryFn: () => placementApi.predict().then(res => res.data),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6 bg-card border border-border/50 rounded-xl min-h-[160px]">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (isError || !data?.prediction) {
    return (
      <div className="p-6 rounded-xl bg-card shadow-card border border-border/50 min-h-[160px] flex flex-col items-center justify-center text-center">
        <Target className="w-8 h-8 text-muted-foreground mb-3 opacity-50" />
        <h3 className="text-foreground font-bold mb-1">Placement Readiness Locked</h3>
        <p className="text-sm text-muted-foreground max-w-sm">Upload a resume to allow Gemini to analyze your exact skill stack and predict target companies.</p>
      </div>
    );
  }

  const prediction = data?.prediction;
  const score = prediction?.readiness_score || 0;
  const companies = prediction?.predicted_companies || [];
  
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="p-6 rounded-xl bg-card shadow-card border border-border/50">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Circular Progress */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" strokeWidth="8" className="stroke-secondary" />
            <motion.circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              className="stroke-accent"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-foreground">{score}%</span>
            <span className="text-xs text-muted-foreground">Score</span>
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-lg font-semibold text-foreground mb-1">Placement Readiness</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Based on your skills and resume, you are <strong className="text-accent">{score > 70 ? 'Highly Ready' : 'Improving'}</strong>.
          </p>
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase">Target Companies</div>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              {companies.map((company: any) => (
                <span key={company.name} className="px-2 py-1 bg-secondary rounded text-[10px] font-medium text-foreground">
                  {company.name} ({company.probability})
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlacementScore;


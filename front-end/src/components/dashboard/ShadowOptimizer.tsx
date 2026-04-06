import { useState } from "react";
import { motion } from "framer-motion";
import { Linkedin, Loader2, Target, CheckCircle2, AlertTriangle, FileText, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery } from "@tanstack/react-query";
import { advancedApi, authApi } from "@/lib/api";
import { toast } from "sonner";

const ShadowOptimizer = () => {
  const [linkedinData, setLinkedinData] = useState("");
  const [result, setResult] = useState<any>(null);

  const { data: user } = useQuery({
    queryKey: ['profile'],
    queryFn: () => authApi.getProfile().then(res => res.data),
  });

  const analyzeMutation = useMutation({
    mutationFn: (linkedin: string) => {
      const profile = user?.profile || {};
      const resumeContext = `
        Role: ${profile.target_role || ''}
        Bio: ${profile.bio || ''}
        Experience: ${profile.experience_level || ''}
        Goals: ${profile.career_goal || ''}
      `;
      return advancedApi.shadowAudit(resumeContext.trim(), linkedin).then(res => res.data);
    },
    onSuccess: (data) => {
      setResult(data);
      toast.success("Shadow Audit Complete!");
    },
    onError: () => {
      toast.error("Audit failed. Check backend logs.");
    }
  });

  const handleAnalyze = () => {
    if (linkedinData.trim().length < 20) {
      toast.error("Please paste public LinkedIn text.");
      return;
    }
    analyzeMutation.mutate(linkedinData);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500 bg-green-500/10 border-green-500/20";
    if (score >= 50) return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
    return "text-red-500 bg-red-500/10 border-red-500/20";
  };

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center">
          <Linkedin className="w-6 h-6 mr-3 text-accent" />
          LinkedIn Shadow Optimizer
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          A ruthless recruiter-bot that cross-references your live LinkedIn profile against your AI-Optimized resume to permanently eliminate inconsistencies.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="p-6 rounded-xl bg-card border border-border/50 shadow-card flex flex-col h-full">
          <h2 className="text-lg font-semibold flex items-center mb-4">
            <FileText className="w-5 h-5 mr-3 text-accent" />
            Public Profile Data
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Export your LinkedIn profile to PDF or copy-paste the text here. Gemini 2.5 will check dates, titles, and technical density.
          </p>
          
          <Textarea 
            placeholder="Experience: Software Architect at Corp Solutions (Jan 2021 - Present)..."
            className="flex-1 min-h-[300px] mb-6 p-4 text-sm font-sans"
            value={linkedinData}
            onChange={(e) => setLinkedinData(e.target.value)}
          />

          <Button 
            onClick={handleAnalyze} 
            disabled={analyzeMutation.isPending}
            className="w-full h-12 text-md"
          >
            {analyzeMutation.isPending ? (
              <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Cross-Referencing Logs...</>
            ) : (
              <><Target className="w-5 h-5 mr-3" /> Audit Profile Inconsistencies</>
            )}
          </Button>
        </div>

        {/* Results Panel */}
        <div className="p-6 rounded-xl bg-card border border-border/50 shadow-card flex flex-col h-full">
          <h2 className="text-lg font-semibold flex items-center mb-6">
            <Activity className="w-5 h-5 mr-3 text-accent" />
            Consistency Audit Report
          </h2>
          
          {analyzeMutation.isPending ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-6 opacity-80">
              <Loader2 className="w-12 h-12 text-accent animate-spin" />
              <div className="space-y-2 text-center">
                <p className="text-sm text-foreground font-semibold">Running comparison heuristic...</p>
                <p className="text-xs text-muted-foreground">Mapping date sequences and title vectors</p>
              </div>
            </div>
          ) : result ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              
              <div className={`p-4 rounded-xl border flex items-center justify-between ${getScoreColor(result.overall_consistency_score)}`}>
                 <div className="font-bold tracking-wider uppercase text-sm flex items-center">
                   {result.overall_consistency_score > 75 ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <AlertTriangle className="w-5 h-5 mr-2" />}
                   Overall Sync Score
                 </div>
                 <div className="text-3xl font-black">{result.overall_consistency_score}%</div>
              </div>

              {/* Red Flags */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase text-red-500 tracking-wider flex items-center border-b border-border/50 pb-2">
                  Technical Discrepancies (Red Flags)
                </h3>
                <div className="space-y-3 mt-4">
                  {(result.red_flags || []).map((flag: any, idx: number) => (
                    <div key={idx} className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                         <span className="font-bold text-red-400 text-xs tracking-wider uppercase">{flag.issueType}</span>
                         <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-black uppercase rounded">{flag.severity}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs font-mono mb-3">
                        <div className="p-2 border border-border/40 bg-background rounded"><span className="text-muted-foreground block mb-1 font-sans">Resume States:</span>{flag.resume_value}</div>
                        <div className="p-2 border border-border/40 bg-background rounded"><span className="text-muted-foreground block mb-1 font-sans">LinkedIn Specifies:</span>{flag.linkedin_value}</div>
                      </div>
                      <div className="text-sm text-red-200">
                        <span className="font-semibold text-red-400">Fix Protocol: </span>{flag.recommendation}
                      </div>
                    </div>
                  ))}
                  {result.red_flags?.length === 0 && (
                     <div className="text-sm text-green-500">No discrepancies found! Your profiles are perfectly synchronized.</div>
                  )}
                </div>
              </div>

              {/* Missing Skills on Social */}
              <div className="space-y-2 mt-6 pt-4 border-t border-border/50">
                <h3 className="text-sm font-semibold uppercase text-accent tracking-wider mb-2">
                  Missing Keywords on LinkedIn
                </h3>
                <div className="flex flex-wrap gap-2 p-3 bg-secondary/30 rounded-lg border border-border/50">
                  {result.missing_keywords_on_social?.map((word: string, i: number) => (
                     <span key={i} className="text-xs font-bold px-2 py-1 bg-background border border-border/50 rounded">{word}</span>
                  ))}
                </div>
              </div>

            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center opacity-40">
              <Linkedin className="w-16 h-16 mb-4 text-muted-foreground" />
              <p className="text-muted-foreground text-center text-sm max-w-[250px]">
                Paste your LinkedIn text to find out if recruiters will flag your resume as inconsistent.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShadowOptimizer;

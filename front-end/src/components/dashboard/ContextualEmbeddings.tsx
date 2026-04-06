import { useState } from "react";
import { motion } from "framer-motion";
import { BrainCircuit, Loader2, Link, Target, CheckCircle2, AlertTriangle, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery } from "@tanstack/react-query";
import { advancedApi, authApi } from "@/lib/api";
import { toast } from "sonner";

const ContextualEmbeddings = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<any>(null);

  const { data: user } = useQuery({
    queryKey: ['profile'],
    queryFn: () => authApi.getProfile().then(res => res.data),
  });

  const analyzeMutation = useMutation({
    mutationFn: (jdText: string) => {
      const profile = user?.profile || {};
      const resumeContext = `
        Role: ${profile.target_role || 'Not specified'}
        Bio: ${profile.bio || 'Not specified'}
        Experience Level: ${profile.experience_level || 'Not specified'}
        Career Goal: ${profile.career_goal || 'Not specified'}
      `;
      return advancedApi.contextualEmbeddings(resumeContext.trim(), jdText).then(res => res.data);
    },
    onSuccess: (data) => {
      setResult(data);
      toast.success("Cosine similarity calculated successfully!");
    },
    onError: () => {
      toast.error("Failed to analyze mappings. Check backend logs.");
    }
  });

  const handleAnalyze = () => {
    if (jobDescription.trim().length < 20) {
      toast.error("Please paste a realistic job description.");
      return;
    }
    analyzeMutation.mutate(jobDescription);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500 stroke-green-500";
    if (score >= 50) return "text-yellow-500 stroke-yellow-500";
    return "text-red-500 stroke-red-500";
  };

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center">
          <BrainCircuit className="w-6 h-6 mr-3 text-accent" />
          Contextual Job Embeddings
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Instead of basic keyword matching, this tool projects your profile and the job description into dense mathematical vectors to prove semantic fit.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="p-6 rounded-xl bg-card border border-border/50 shadow-card flex flex-col h-full">
          <h2 className="text-lg font-semibold flex items-center mb-4">
            <Briefcase className="w-5 h-5 mr-3 text-accent" />
            Target Job Description
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Paste the full raw text of the Job Description below. We will compute the cosine-similarity between it and your current AI career profile.
          </p>
          
          <Textarea 
            placeholder="e.g. We are looking for a Senior Software Engineer with strong experience in React, Node.js, and CI/CD pipelines..."
            className="flex-1 min-h-[300px] mb-6 p-4 text-sm font-mono"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />

          <Button 
            onClick={handleAnalyze} 
            disabled={analyzeMutation.isPending}
            className="w-full h-12 text-md"
          >
            {analyzeMutation.isPending ? (
              <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Computing Vectors...</>
            ) : (
              <><Target className="w-5 h-5 mr-3" /> Calculate Mathematical Fit</>
            )}
          </Button>
        </div>

        {/* Results Panel */}
        <div className="p-6 rounded-xl bg-card border border-border/50 shadow-card flex flex-col h-full">
          <h2 className="text-lg font-semibold flex items-center mb-6">
            <Link className="w-5 h-5 mr-3 text-accent" />
            Similarity Results
          </h2>
          
          {analyzeMutation.isPending ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-6 opacity-80">
              <Loader2 className="w-12 h-12 text-accent animate-spin" />
              <div className="space-y-2 text-center">
                <p className="text-sm text-foreground font-semibold">Generating text-embedding-004 vectors...</p>
                <p className="text-xs text-muted-foreground">Calculating multidimensional cosine similarity</p>
              </div>
            </div>
          ) : result ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 flex-1 flex flex-col">
              
              {/* Score Display */}
              <div className="flex items-center justify-center p-8 bg-background border border-border/50 rounded-xl relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-2 h-full ${getScoreColor(result.similarity_score_percentage).replace('text-', 'bg-').replace('stroke-', '')}`} />
                <div className="text-center">
                   <div className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-2">Cosine Similarity Score</div>
                   <div className={`text-6xl font-black tracking-tighter ${getScoreColor(result.similarity_score_percentage).split(' ')[0]}`}>
                     {result.similarity_score_percentage}%
                   </div>
                   <div className="text-sm text-muted-foreground mt-2">
                     {result.similarity_score_percentage > 75 ? "Excellent Semantic Match" : "Moderate Alignment Gap"}
                   </div>
                </div>
              </div>

              {/* Mathematical Match Reasoning */}
              <div className="flex-1">
                <h3 className="text-sm font-semibold uppercase text-accent tracking-wider mb-2 flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  "Why I'm A Match" Reasoning
                </h3>
                <div className="p-4 bg-secondary/30 rounded-lg text-sm leading-relaxed text-foreground border border-border/50">
                  {result.match_reasoning || "No reasoning generated."}
                </div>
              </div>

              {/* Crucial Missing Vectors */}
              <div className="mt-auto pt-4 border-t border-border/50">
                <h3 className="text-sm font-semibold uppercase text-red-400 tracking-wider mb-3 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Missing Critical Vectors
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(result.crucial_missing_vectors || []).map((vector: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold rounded">
                      {vector}
                    </span>
                  ))}
                  {(!result.crucial_missing_vectors || result.crucial_missing_vectors.length === 0) && (
                    <span className="text-sm text-green-500 font-medium">None! Perfect alignment.</span>
                  )}
                </div>
              </div>

            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center opacity-40">
              <Target className="w-16 h-16 mb-4 text-muted-foreground" />
              <p className="text-muted-foreground text-center text-sm max-w-[250px]">
                Paste a Job Description and calculate to see your semantic overlap matrix.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContextualEmbeddings;

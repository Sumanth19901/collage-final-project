import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, CheckCircle2, Loader2, Lightbulb, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { resumeApi } from "@/lib/api";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const ResumeUpload = () => {
  const [uploaded, setUploaded] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => resumeApi.upload(formData),
    onSuccess: (data) => {
      toast.success("Resume uploaded successfully!");
      analyzeMutation.mutate(data.data.resume.id);
    },
    onError: (error: unknown) => {
      toast.error(error.response?.data?.error || "Failed to upload resume");
    }
  });

  const analyzeMutation = useMutation({
    mutationFn: (resumeId: string) => resumeApi.analyze(resumeId),
    onSuccess: (data) => {
      setAnalysisData(data.data.analysis);
      setUploaded(true);
    },
    onError: (error: unknown) => {
      toast.error(error.response?.data?.error || "Failed to analyze resume");
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const formData = new FormData();
      formData.append("resume", e.target.files[0]);
      uploadMutation.mutate(formData);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const formData = new FormData();
      formData.append("resume", e.dataTransfer.files[0]);
      uploadMutation.mutate(formData);
    }
  };

  const skills = analysisData?.extracted_skills || [];
  const details = [
    { label: "Analysis Score", value: analysisData?.score || "N/A" },
    { label: "Strengths", value: analysisData?.strengths?.join(", ") || "N/A" },
    { label: "Weaknesses", value: analysisData?.weaknesses?.join(", ") || "N/A" },
  ];

  const isLoading = uploadMutation.isPending || analyzeMutation.isPending;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Resume Analysis</h1>
        <p className="text-muted-foreground mt-1">Upload your resume for AI-powered skill extraction.</p>
      </div>

      {!uploaded ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer relative ${
            dragging ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById("resume-input")?.click()}
        >
          {isLoading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-10 h-10 text-accent animate-spin mb-4" />
              <p className="text-foreground font-medium">Analyzing your resume...</p>
            </div>
          ) : (
            <>
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground font-medium mb-1">Drag & drop your resume here</p>
              <p className="text-sm text-muted-foreground mb-4">Supports PDF, DOCX (Max 10MB)</p>
              <Button variant="accent" size="sm" type="button">
                Browse Files
              </Button>
            </>
          )}
          <input
            id="resume-input"
            type="file"
            className="hidden"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            disabled={isLoading}
          />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/10 border border-accent/20">
            <CheckCircle2 className="w-5 h-5 text-accent" />
            <div>
              <p className="font-medium text-foreground text-sm">Resume analyzed successfully!</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-card shadow-card border border-border/50">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-accent" />
                <h3 className="font-semibold text-foreground">Analysis Summary</h3>
              </div>
              <div className="space-y-3">
                {details.map((d) => (
                  <div key={d.label} className="flex flex-col space-y-1">
                    <span className="text-xs text-muted-foreground font-semibold uppercase">{d.label}</span>
                    <span className="text-sm text-foreground">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-xl bg-card shadow-card border border-border/50">
              <h3 className="font-semibold text-foreground mb-4">Extracted Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: string, i: number) => (
                  <motion.span
                    key={skill}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-medium"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </div>
          </div>

          {/* Professional Suggestions Section */}
          {analysisData?.professional_suggestions && (
            <div className="p-6 rounded-xl bg-card shadow-card border border-border/50">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <h3 className="font-semibold text-foreground">Professional Suggestions</h3>
              </div>
              <ul className="list-disc pl-5 space-y-2 text-sm text-foreground/80">
                {analysisData.professional_suggestions.map((suggestion: string, i: number) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    {suggestion}
                  </motion.li>
                ))}
              </ul>
            </div>
          )}

          {/* Improved ATS Resume Section */}
          {analysisData?.improved_resume && (
            <div className="p-6 rounded-xl bg-card shadow-card border border-border/50">
              <div className="flex items-center gap-2 mb-4">
                <UserCheck className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold text-foreground">ATS-Optimized Resume Draft</h3>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none p-4 rounded-lg border border-border bg-secondary/30">
                <ReactMarkdown>{analysisData.improved_resume}</ReactMarkdown>
              </div>
            </div>
          )}

          <Button variant="ghost" size="sm" onClick={() => setUploaded(false)}>
            Upload a different resume
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default ResumeUpload;


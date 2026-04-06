import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ArrowRight, Briefcase, Code, Sparkles, Upload, Loader2, Target, Coffee, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ModeToggle } from "@/components/mode-toggle";
import { authApi, resumeApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const experienceLevels = [
  { id: "student", label: "Student / Recent Grad", icon: Coffee, desc: "Looking for first role or internship" },
  { id: "junior", label: "Junior (1-3 yrs)", icon: Code, desc: "Building core skills and experience" },
  { id: "mid", label: "Mid-Level (3-5 yrs)", icon: Briefcase, desc: "Taking on complex projects" },
  { id: "senior", label: "Senior (5+ yrs)", icon: Target, desc: "Leading teams and architecture" },
];

const interestAreas = [
  "Frontend Development", "Backend Development", "Full Stack", 
  "Machine Learning / AI", "Data Science", "DevOps & Cloud", 
  "Mobile Development", "UI/UX Design", "Cybersecurity", "Product Management"
];

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  
  const [targetRole, setTargetRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [primaryInterest, setPrimaryInterest] = useState("");
  const [careerGoal, setCareerGoal] = useState("");
  
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ['profile'],
    queryFn: () => authApi.getProfile().then(res => res.data),
  });

  // Redirect if they already onboarded
  useEffect(() => {
    if (user?.profile?.onboarding_completed) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const mapExperienceLevel = (levelStr: string) => {
    if (!levelStr) return 'student';
    const lower = levelStr.toLowerCase();
    if (lower.includes('senior')) return 'senior';
    if (lower.includes('mid')) return 'mid';
    if (lower.includes('junior') || lower.includes('entry')) return 'junior';
    return 'student';
  };

  const processResume = async (file: File) => {
    setResumeFile(file);
    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const res = await resumeApi.upload(formData);
      
      if (res.data?.resume?.id) {
        const analyzeRes = await resumeApi.analyze(res.data.resume.id);
        const analysis = analyzeRes.data?.analysis;
        
        if (analysis) {
          if (analysis.inferred_role) setTargetRole(analysis.inferred_role);
          if (analysis.experience_level) setExperienceLevel(mapExperienceLevel(analysis.experience_level));
          toast.success("Resume analyzed! Profile auto-filled.");
        }
      }
      setStep(2);
    } catch (e) {
      console.error(e);
      toast.error("Failed to analyze resume, but you can continue manually.");
      setStep(2);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleNext = () => {
    if (step === 2 && !targetRole) return toast.error("Please tell us your target role.");
    if (step === 2 && !experienceLevel) return toast.error("Please select an experience level.");
    if (step === 3 && !primaryInterest) return toast.error("Please select your primary interest.");
    if (step === 3 && !careerGoal) return toast.error("Please define your main career goal.");
    setStep(s => s + 1);
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await authApi.updateProfile({
        target_role: targetRole,
        experience_level: experienceLevel,
        primary_interest: primaryInterest,
        career_goal: careerGoal,
        onboarding_completed: true
      });

      toast.success("Profile customized! Welcome aboard.");
      navigate("/dashboard");
    } catch (e: unknown) {
      toast.error("An error occurred during setup. Please try again.");
      console.error(e);
      setLoading(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processResume(e.dataTransfer.files[0]);
    }
  };

  const displayName = user?.profile?.name?.split(' ')[0] || user?.username?.split('@')[0] || "there";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-4 right-4"><ModeToggle /></div>
      
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-accent/5 rounded-full blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl"
      >
        <div className="bg-card shadow-card rounded-2xl border border-border/50 p-8 sm:p-10 relative overflow-hidden">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 h-1.5 bg-secondary w-full">
            <motion.div 
              className="h-full bg-accent" 
              initial={{ width: "25%" }}
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>

          <div className="mb-8 mt-2 text-center">
            <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center mx-auto mb-5 shadow-lg shadow-accent/20">
              <Brain className="w-7 h-7 text-accent-foreground" />
            </div>
            
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="text1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h1 className="text-2xl font-bold text-foreground">Welcome, {displayName}!</h1>
                  <p className="text-muted-foreground mt-2">Upload your resume first, and our AI will automatically fill your profile.</p>
                </motion.div>
              )}
              {step === 2 && (
                <motion.div key="text2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h1 className="text-2xl font-bold text-foreground">Verify your details</h1>
                  <p className="text-muted-foreground mt-2">Here is what we extracted from your resume. Feel free to edit.</p>
                </motion.div>
              )}
              {step === 3 && (
                <motion.div key="text3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h1 className="text-2xl font-bold text-foreground">What drives you?</h1>
                  <p className="text-muted-foreground mt-2">Tell us about your technical passions and ultimate career objective.</p>
                </motion.div>
              )}
              {step === 4 && (
                <motion.div key="text4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h1 className="text-2xl font-bold text-foreground">You are all set!</h1>
                  <p className="text-muted-foreground mt-2">We have everything we need to build your personalized career roadmap.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="min-h-[220px]">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors relative ${
                      dragging ? "border-accent bg-accent/5" : "border-border hover:border-accent/50 bg-card"
                    } ${analyzing ? "opacity-70 pointer-events-none" : ""}`}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleFileDrop}
                  >
                    {analyzing ? (
                      <div className="flex flex-col items-center py-4">
                        <Loader2 className="w-12 h-12 text-accent animate-spin mb-3" />
                        <p className="text-foreground font-semibold">AI is analyzing your resume...</p>
                        <p className="text-xs text-muted-foreground mt-1">Extracting skills and experience</p>
                      </div>
                    ) : resumeFile ? (
                      <div className="flex flex-col items-center py-4">
                        <CheckCircle2 className="w-12 h-12 text-green-500 mb-3" />
                        <p className="text-foreground font-semibold">{resumeFile.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">Ready for analysis</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center cursor-pointer" onClick={() => document.getElementById("resume-upload")?.click()}>
                        <Upload className="w-10 h-10 text-muted-foreground mb-4" />
                        <p className="text-foreground font-medium mb-1">Click to select or drag & drop</p>
                        <p className="text-xs text-muted-foreground mb-4">PDF or DOCX format (Max 10MB)</p>
                        <Button variant="outline" size="sm" type="button" className="pointer-events-none">
                          Browse Local Files
                        </Button>
                      </div>
                    )}
                    <input
                      id="resume-upload"
                      type="file"
                      className="hidden"
                      accept=".pdf,.docx"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) processResume(e.target.files[0]);
                      }}
                    />
                  </div>
                  
                  <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 flex gap-3 text-sm">
                    <Sparkles className="w-5 h-5 text-accent shrink-0" />
                    <p className="text-foreground/80 leading-relaxed">
                      We'll extract your skills and experience to auto-fill the rest of your profile.
                    </p>
                  </div>
                  <div className="flex justify-center">
                     <Button variant="link" onClick={() => setStep(2)}>Skip for now, I'll fill manually</Button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="targetRole" className="text-base">Target Job Title</Label>
                    <Input
                      id="targetRole"
                      placeholder="e.g. Full Stack Developer, Data Scientist..."
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="h-12 text-lg px-4"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                    />
                    <p className="text-xs text-muted-foreground ml-1">We will optimize your missing skills toward this exact role.</p>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-base">Experience Level</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {experienceLevels.map((lvl) => (
                        <div 
                          key={lvl.id}
                          onClick={() => setExperienceLevel(lvl.id)}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${experienceLevel === lvl.id ? 'border-accent bg-accent/5 shadow-sm' : 'border-border hover:border-accent/40 bg-card'}`}
                        >
                          <lvl.icon className={`w-6 h-6 mb-3 ${experienceLevel === lvl.id ? 'text-accent' : 'text-muted-foreground'}`} />
                          <h3 className={`font-semibold text-sm ${experienceLevel === lvl.id ? 'text-foreground' : 'text-foreground/80'}`}>{lvl.label}</h3>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{lvl.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-foreground">Primary Tech Interest</Label>
                    <div className="flex flex-wrap gap-2">
                      {interestAreas.map(interest => (
                        <button
                          key={interest}
                          onClick={() => setPrimaryInterest(interest)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${primaryInterest === interest ? 'bg-accent border-accent text-accent-foreground shadow-sm' : 'bg-secondary/50 border-border hover:border-accent text-muted-foreground'}`}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="goal" className="text-sm font-semibold">What is your main career goal for the next 12 months?</Label>
                    <textarea
                      id="goal"
                      className="w-full h-24 p-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
                      placeholder="e.g. I want to land a senior React role at a top tech company, or I want to transition from QA to Backend Engineering..."
                      value={careerGoal}
                      onChange={(e) => setCareerGoal(e.target.value)}
                    />
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="bg-accent/5 border border-accent/20 rounded-xl p-6 text-center">
                    <Target className="w-12 h-12 text-accent mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Ready to Launch</h3>
                    <p className="text-muted-foreground">
                      Your profile is complete. We'll cross-reference your uploaded skills with the requirements for <strong className="text-foreground">{targetRole || 'your chosen role'}</strong> and build your first dashboard.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-8 pt-6 border-t flex justify-between items-center">
            {step > 1 ? (
              <Button variant="ghost" onClick={() => setStep(s => s - 1)} disabled={loading || analyzing}>Back</Button>
            ) : <div />}
            
            {step === 1 ? (
              <div /> // Next button handled by file upload or manual skip
            ) : step < 4 ? (
              <Button onClick={handleNext} className="gap-2 px-6">
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleFinish} className="gap-2 px-8" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Complete Setup"}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;

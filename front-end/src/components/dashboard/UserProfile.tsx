import { useState } from "react";
import { motion } from "framer-motion";
import { User, Briefcase, Award, Target, FileText, Loader2, Mail, Pencil, Check, Video, BrainCircuit, Bot, Linkedin, Sparkles, DownloadCloud } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UploadCloud } from "lucide-react";
import { authApi, resumeApi } from "@/lib/api";

const UserProfile = ({ onNavigate }: { onNavigate?: (tab: any) => void }) => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

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

  const profile = user?.profile || {};
  const displayName = profile.name || user?.username?.split('@')[0] || "User";

  const handleEditInit = () => {
    setEditForm({
      name: profile.name || "",
      target_role: profile.target_role || "",
      experience_level: profile.experience_level || "",
      primary_interest: profile.primary_interest || "",
      bio: profile.bio || "",
      career_goal: profile.career_goal || "",
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (authApi.updateProfile) {
         await authApi.updateProfile(editForm);
      } else {
         toast.error("Profile update api not properly integrated.");
         // fallback placeholder save
         setTimeout(() => {}, 500);
      }
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (e: any) {
      toast.error("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadOptimizedResume = async () => {
    try {
      const { data } = await resumeApi.downloadOptimized();
      const content = data.improved_resume;
      
      const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Optimized_ATS_Resume.md";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("Optimized Resume Downloaded!");
    } catch (e: any) {
      toast.error(e.response?.data?.error || "Failed to download optimized resume.");
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Your Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your career details and AI analysis results.</p>
        </div>
        {!isEditing && (
          <div className="flex gap-3">
            <Button onClick={handleDownloadOptimizedResume} variant="secondary" size="sm" className="shadow-sm">
              <DownloadCloud className="w-4 h-4 mr-2" /> ATS Resume
            </Button>
            <Button onClick={handleEditInit} variant="outline" size="sm" className="hover:bg-accent/10 border-accent/20">
              <Pencil className="w-4 h-4 mr-2" /> Edit Profile
            </Button>
          </div>
        )}
      </div>

      {(!profile.bio || !profile.target_role) && !isEditing && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full p-4 rounded-xl border border-accent/30 bg-accent/5 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center">
            <div className="p-3 bg-accent/20 rounded-full mr-4"><UploadCloud className="w-6 h-6 text-accent" /></div>
            <div>
              <h3 className="text-foreground font-bold">Autofill Profile with AI</h3>
              <p className="text-sm text-muted-foreground">Upload your resume and let Gemini analyze and instantly populate your entire profile and dashboard.</p>
            </div>
          </div>
          <Button onClick={() => onNavigate?.("resume")} className="shrink-0 whitespace-nowrap shadow-lg shadow-accent/20">
            Upload Resume Now
          </Button>
        </motion.div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Info Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="md:col-span-1 p-6 rounded-xl bg-card shadow-card border border-border/50 text-center flex flex-col items-center"
        >
          <div className="w-24 h-24 rounded-full gradient-accent flex items-center justify-center mb-4 shadow-lg shadow-accent/20">
            <User className="w-12 h-12 text-accent-foreground" />
          </div>
          
          {isEditing ? (
            <div className="w-full space-y-3 mt-2 text-left">
              <div>
                <label className="text-xs text-muted-foreground">Name</label>
                <Input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="h-8 mt-1" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Target Role</label>
                <Input value={editForm.target_role} onChange={e => setEditForm({...editForm, target_role: e.target.value})} className="h-8 mt-1" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Experience Level</label>
                <Input value={editForm.experience_level} onChange={e => setEditForm({...editForm, experience_level: e.target.value})} className="h-8 mt-1" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Primary Interest</label>
                <Input value={editForm.primary_interest} onChange={e => setEditForm({...editForm, primary_interest: e.target.value})} className="h-8 mt-1" />
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-foreground">{displayName}</h2>
              <p className="text-sm font-medium text-accent mt-1">{profile.target_role || "Role Not Set"}</p>
              
              <div className="w-full mt-6 space-y-3 text-left border-t pt-4 border-border/50">
                <div className="flex items-center text-sm text-foreground">
                  <Mail className="w-4 h-4 mr-3 text-muted-foreground" />
                  {user?.email}
                </div>
                <div className="flex items-center text-sm text-foreground">
                  <Award className="w-4 h-4 mr-3 text-muted-foreground" />
                  {profile.experience_level || "Experience Not Set"}
                </div>
                <div className="flex items-center text-sm text-foreground">
                  <Target className="w-4 h-4 mr-3 text-muted-foreground" />
                  {profile.primary_interest || "Interest Not Set"}
                </div>
              </div>
            </>
          )}
        </motion.div>

        {/* Details Card */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:col-span-2 flex flex-col gap-6"
        >
          <div className="p-6 rounded-xl bg-card shadow-card border border-border/50 flex flex-col justify-start">
            <h3 className="text-lg font-semibold text-foreground flex items-center mb-4">
              <FileText className="w-5 h-5 mr-2 text-accent" />
              Professional Bio
            </h3>
            {isEditing ? (
              <Textarea 
                value={editForm.bio} 
                onChange={e => setEditForm({...editForm, bio: e.target.value})}
                className="min-h-[100px]"
              />
            ) : (
              <p className="text-muted-foreground text-sm leading-relaxed">
                {profile.bio || "No bio has been extracted yet. Upload your resume to automatically generate your professional bio!"}
              </p>
            )}
            
            <h3 className="text-lg font-semibold text-foreground flex items-center mb-4 mt-8">
              <Briefcase className="w-5 h-5 mr-2 text-accent" />
              Career Goal
            </h3>
            {isEditing ? (
              <Textarea 
                value={editForm.career_goal} 
                onChange={e => setEditForm({...editForm, career_goal: e.target.value})}
                className="min-h-[80px]"
              />
            ) : (
              <p className="text-muted-foreground text-sm leading-relaxed">
                {profile.career_goal || "You haven't specified a specific career goal yet."}
              </p>
            )}

            {isEditing && (
              <div className="flex justify-end gap-3 mt-8 border-t pt-4 border-border/50">
                <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={isSaving}>Cancel</Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Futuristic Agent Features Section */}
      <div className="mt-12 pt-8 border-t border-border/50">
        <div className="flex items-center mb-6">
          <Sparkles className="w-6 h-6 text-accent mr-3" />
          <h2 className="text-xl font-bold text-foreground">Next-Gen Intelligence Agent Features</h2>
          <span className="hidden sm:inline-block ml-4 px-3 py-1 bg-accent/10 text-accent text-[10px] tracking-wider font-bold rounded-full border border-accent/20">PREVIEW IMPL</span>
        </div>
        
        <div className="grid sm:grid-cols-2 gap-4">
          <div 
             onClick={() => onNavigate?.("simulator")}
             className="p-5 rounded-xl bg-background border border-border/50 hover:border-accent/40 hover:shadow-card-hover transition-all cursor-pointer group"
          >
            <div className="flex items-center mb-3">
              <div className="p-2 bg-secondary rounded-lg border group-hover:bg-accent/10 group-hover:border-accent/30 transition-colors mr-3"><Video className="w-5 h-5 text-accent" /></div>
              <h3 className="font-semibold text-foreground">Multimodal Simulator</h3>
            </div>
            <p className="text-sm text-muted-foreground">Real-time voice & video mock interviews analyzed globally by Gemini 2.5 Flash for non-verbal cues.</p>
          </div>

          <div 
             onClick={() => onNavigate?.("embeddings")}
             className="p-5 rounded-xl bg-background border border-border/50 hover:border-accent/40 hover:shadow-card-hover transition-all cursor-pointer group"
          >
            <div className="flex items-center mb-3">
              <div className="p-2 bg-secondary rounded-lg border group-hover:bg-accent/10 group-hover:border-accent/30 transition-colors mr-3"><BrainCircuit className="w-5 h-5 text-accent" /></div>
              <h3 className="font-semibold text-foreground">Contextual Job Embeddings</h3>
            </div>
            <p className="text-sm text-muted-foreground">Cosine similarity matching via text-embedding-004 to mathematically prove why you fit a designated Job Description.</p>
          </div>

          <div 
             onClick={() => onNavigate?.("agentic")}
             className="p-5 rounded-xl bg-background border border-border/50 hover:border-accent/40 hover:shadow-card-hover transition-all cursor-pointer group"
          >
            <div className="flex items-center mb-3">
               <div className="p-2 bg-secondary rounded-lg border group-hover:bg-accent/10 group-hover:border-accent/30 transition-colors mr-3"><Bot className="w-5 h-5 text-accent" /></div>
              <h3 className="font-semibold text-foreground">Agentic Job Tracker</h3>
            </div>
            <p className="text-sm text-muted-foreground">An automated tracking agent using Function Calling to scrape jobs and draft tailored cover letters dynamically.</p>
          </div>

          <div 
             onClick={() => onNavigate?.("audit")}
             className="p-5 rounded-xl bg-background border border-border/50 hover:border-accent/40 hover:shadow-card-hover transition-all cursor-pointer group"
          >
            <div className="flex items-center mb-3">
              <div className="p-2 bg-secondary rounded-lg border group-hover:bg-accent/10 group-hover:border-accent/30 transition-colors mr-3"><Linkedin className="w-5 h-5 text-accent" /></div>
              <h3 className="font-semibold text-foreground">LinkedIn Shadow Optimizer</h3>
            </div>
            <p className="text-sm text-muted-foreground">Side-by-side analysis of your live LinkedIn profile vs. your AI-optimized resume to eliminate inconsistencies.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

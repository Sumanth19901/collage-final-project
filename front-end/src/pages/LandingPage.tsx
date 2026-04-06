import { motion } from "framer-motion";
import { Brain, FileSearch, Target, BookOpen, MessageSquare, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ModeToggle } from "@/components/mode-toggle";

const features = [
  {
    icon: FileSearch,
    title: "Resume Analysis",
    description: "AI-powered extraction of skills, experience, and qualifications from your resume.",
  },
  {
    icon: Target,
    title: "Skill Gap Detection",
    description: "Compare your profile against industry requirements and identify missing competencies.",
  },
  {
    icon: TrendingUp,
    title: "Placement Prediction",
    description: "ML-driven probability assessment of your placement readiness.",
  },
  {
    icon: BookOpen,
    title: "Learning Roadmap",
    description: "Personalized adaptive learning paths to bridge your skill gaps.",
  },
  {
    icon: MessageSquare,
    title: "Interview Prep",
    description: "Role-specific interview questions and preparation guidance.",
  },
  {
    icon: Brain,
    title: "Career Intelligence",
    description: "Data-driven career recommendations aligned with industry trends.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
              <Brain className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">ACIA</span>
          </div>
          <div className="flex items-center gap-3">
            <ModeToggle />
            <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
              Dashboard
            </Button>
            <Button variant="accent" size="sm" onClick={() => navigate("/auth")}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 to-background" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
              <Brain className="w-4 h-4" />
              AI-Powered Career Intelligence
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Your Autonomous{" "}
              <span className="text-gradient">Career Advisor</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
              Evaluate your profile, detect skill gaps, predict placement probability, and get personalized career roadmaps — all powered by AI.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="hero" size="xl" onClick={() => navigate("/auth")}>
                Launch Dashboard
              </Button>
              <Button variant="outline-hero" size="xl" onClick={() => navigate("/auth")}>
                Upload Resume
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
          >
            {[
              { value: "95%", label: "Accuracy Rate" },
              { value: "500+", label: "Skills Tracked" },
              { value: "50+", label: "Job Roles" },
              { value: "24/7", label: "AI Availability" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl font-bold text-foreground mb-3">Intelligent Career Features</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Everything you need to go from student to placement-ready professional.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={item}
                className="group p-6 rounded-xl bg-card shadow-card hover:shadow-card-hover transition-all duration-300 border border-border/50"
              >
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <feature.icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="gradient-hero rounded-2xl p-10 md:p-16 text-center max-w-4xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-primary-foreground mb-4">
              Ready to Accelerate Your Career?
            </h2>
            <p className="text-primary-foreground/70 mb-8 max-w-md mx-auto">
              Upload your resume, get instant analysis, and start building your path to placement success.
            </p>
            <Button variant="accent" size="xl" onClick={() => navigate("/auth")}>
              Start Now — It's Free
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>ACIA — Autonomous Career Intelligence Agent · Krishna University</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

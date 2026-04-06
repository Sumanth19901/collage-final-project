import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, ChevronDown, ChevronUp, Lightbulb, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { interviewApi } from "@/lib/api";

const InterviewPrep = () => {
  const [expandedQ, setExpandedQ] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['interview-questions'],
    queryFn: () => interviewApi.getQuestions('Software Engineer').then(res => res.data),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="w-10 h-10 text-accent animate-spin mb-4" />
        <p className="text-muted-foreground">Curating interview questions for you...</p>
      </div>
    );
  }

  const questions = data?.questions || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Interview Preparation</h1>
        <p className="text-muted-foreground mt-1">Role-specific questions based on your target positions.</p>
      </div>

      <div className="space-y-4">
        {questions.length > 0 ? (
          questions.map((question: unknown, idx: number) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="rounded-xl bg-card shadow-card border border-border/50 overflow-hidden"
            >
              <div className="p-5">
                <button
                  onClick={() => setExpandedQ(expandedQ === question.id ? null : question.id)}
                  className="w-full text-left flex items-start justify-between gap-3"
                >
                  <div className="flex gap-3">
                    <span className="text-sm font-bold text-accent">Q{idx + 1}</span>
                    <span className="text-sm font-medium text-foreground">{question.text}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 flex-shrink-0 mt-0.5 transition-transform ${expandedQ === question.id ? "rotate-180" : ""}`} />
                </button>
                
                <AnimatePresence>
                  {expandedQ === question.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-4 border-t border-border/30">
                        <textarea 
                          className="w-full min-h-[100px] p-3 rounded-lg bg-secondary/30 border border-border/30 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                          placeholder="Type your answer here for evaluation..."
                        />
                        <div className="flex justify-end mt-2">
                          <button className="text-xs bg-accent text-accent-foreground px-3 py-1.5 rounded-md hover:bg-accent/90 transition-colors">
                            Submit Answer
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center p-12 text-muted-foreground">
            No questions available for this role.
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewPrep;


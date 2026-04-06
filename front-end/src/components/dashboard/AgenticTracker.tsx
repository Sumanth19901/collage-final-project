import { useState } from "react";
import { motion } from "framer-motion";
import { Bot, Loader2, Play, Search, Code, CheckCircle2, BookmarkIcon, TerminalSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation } from "@tanstack/react-query";
import { advancedApi } from "@/lib/api";
import { toast } from "sonner";

const AgenticTracker = () => {
  const [command, setCommand] = useState("Find me 3 remote Data Science roles in Canada and draft applications.");
  const [result, setResult] = useState<any>(null);

  const analyzeMutation = useMutation({
    mutationFn: (cmd: string) => advancedApi.agenticTracker(cmd).then(res => res.data),
    onSuccess: (data) => {
      setResult(data);
      toast.success("Agent successfully executed workflow simulation");
    },
    onError: () => {
      toast.error("Agent failed. Check backend logs.");
    }
  });

  const handleExecute = () => {
    if (command.trim().length < 5) return;
    analyzeMutation.mutate(command);
  };

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center">
          <Bot className="w-6 h-6 mr-3 text-accent" />
          Agentic Job Tracker
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          A proactive autonomous agent that uses Function Calling to search web boards, log jobs to your database, and draft tailored cover letters dynamically.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input & Terminal Panel */}
        <div className="p-6 rounded-xl bg-card border border-border/50 shadow-card flex flex-col h-full">
          <h2 className="text-lg font-semibold flex items-center mb-4">
            <TerminalSquare className="w-5 h-5 mr-3 text-accent" />
            Command Interface
          </h2>
          
          <div className="flex space-x-2 mb-6">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input 
                 className="pl-9 h-10" 
                 value={command} 
                 onChange={(e) => setCommand(e.target.value)} 
                 placeholder="E.g. Track standard Software Engineer openings in NY..." 
              />
            </div>
            <Button onClick={handleExecute} disabled={analyzeMutation.isPending} className="h-10 px-6">
              {analyzeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
              Execute Action
            </Button>
          </div>

          <div className="flex-1 bg-black/90 rounded-lg border border-border/50 p-4 font-mono text-xs text-green-400 overflow-hidden flex flex-col">
            <div className="uppercase text-muted-foreground mb-4 font-bold border-b border-white/10 pb-2">Terminal Output</div>
            
            {analyzeMutation.isPending ? (
              <div className="space-y-2 opacity-80">
                <p>Initializing ACIA ReAct Core...</p>
                <p className="animate-pulse">&gt; Waiting for Gemini 2.5 Flash Tool Decision Matrix...</p>
              </div>
            ) : result ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 overflow-y-auto">
                <p className="text-blue-400">&gt; Command received: "{command}"</p>
                <p className="text-yellow-400">&gt; Tool Call Authorized: search_and_draft_agent()</p>
                <p>&gt; Executing {result.name}...</p>
                <p className="text-purple-400">&gt; Payload Params:</p>
                <pre className="text-gray-300 ml-4">{JSON.stringify(result.parameters?.search_parameters, null, 2)}</pre>
                <p className="text-green-300">&gt; Logged {result.parameters?.jobs_saved_to_tracker} new items to DB.</p>
                <p>&gt; Agent Process Terminated. Success.</p>
              </motion.div>
            ) : (
              <p className="text-gray-500 italic">&gt; System idle. Awaiting command...</p>
            )}
          </div>
        </div>

        {/* Results Graph Panel */}
        <div className="p-6 rounded-xl bg-card border border-border/50 shadow-card flex flex-col h-full">
          <h2 className="text-lg font-semibold flex items-center mb-6">
            <Code className="w-5 h-5 mr-3 text-accent" />
            Function Calling Results
          </h2>
          
          {analyzeMutation.isPending ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4 opacity-50">
              <Loader2 className="w-10 h-10 text-accent animate-spin" />
            </div>
          ) : result ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 flex-1">
              
              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border/50">
                <div className="font-semibold text-foreground flex items-center">
                  <BookmarkIcon className="w-4 h-4 mr-2 text-accent" /> 
                  Jobs Scraped & Tracked
                </div>
                <div className="text-2xl font-bold text-accent">
                  +{result.parameters?.jobs_saved_to_tracker || 1}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                  Auto-Drafted Applications
                </h3>
                
                <ScrollArea className="h-[250px] w-full rounded-md border border-border/50 bg-background/50 p-4">
                  {(result.parameters?.drafted_applications || []).map((app: any, idx: number) => (
                    <div key={idx} className="mb-6 last:mb-0">
                      <div className="font-bold text-accent mb-2">Company: {app.company}</div>
                      <div className="text-sm text-foreground bg-secondary/30 p-3 rounded italic whitespace-pre-wrap leading-relaxed">
                        {app.tailored_cover_letter}
                      </div>
                    </div>
                  ))}
                  {(!result.parameters?.drafted_applications || result.parameters.drafted_applications.length === 0) && (
                    <p className="text-muted-foreground text-sm">No applications drafted for this command.</p>
                  )}
                </ScrollArea>
              </div>

            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center opacity-40">
              <Bot className="w-16 h-16 mb-4 text-muted-foreground" />
              <p className="text-muted-foreground text-center text-sm max-w-[250px]">
                Run a command to see the autonomous agent orchestrate background APIs dynamically.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgenticTracker;

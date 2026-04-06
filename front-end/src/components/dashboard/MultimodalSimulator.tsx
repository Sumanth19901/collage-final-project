import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Loader2, Video, BrainCircuit, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { advancedApi } from "@/lib/api";
import { toast } from "sonner";

// Global SpeechRecognition definition for TypeScript
const globalAny: any = window;
const SpeechRecognition = globalAny.SpeechRecognition || globalAny.webkitSpeechRecognition;

const MultimodalSimulator = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<any>(null);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
           setTranscript((prev) => prev + " " + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (event.error !== 'no-speech') {
            setIsRecording(false);
        }
      };
    }
    return () => {
      if (recognitionRef.current) {
         recognitionRef.current.stop();
      }
    };
  }, []);

  const analyzeMutation = useMutation({
    mutationFn: (text: string) => advancedApi.multimodalInterview(text).then(res => res.data),
    onSuccess: (data) => {
      setResult(data);
      toast.success("Analysis complete");
    },
    onError: () => {
      toast.error("Failed to analyze. Check backend logs.");
    }
  });

  const toggleRecording = () => {
    if (!SpeechRecognition) {
      toast.error("Your browser does not support Speech Recognition. Try Google Chrome.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      if (transcript.trim().length > 10) {
        analyzeMutation.mutate(transcript);
      } else {
        toast.error("Transcript too short for analysis.");
      }
    } else {
      setTranscript("");
      setResult(null);
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center">
          <Video className="w-6 h-6 mr-3 text-accent" />
          Multimodal Interview Simulator
        </h1>
        <p className="text-muted-foreground mt-1">
          Practice your responses out loud. Gemini 2.5 Flash acts as a real-time behavioral coach analyzing tone, pacing, and filler words.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recording Panel */}
        <div className="p-6 rounded-xl bg-card border border-border/50 shadow-card flex flex-col justify-between min-h-[400px]">
           <div className="flex-1">
             <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center">
                  Live Transcript
                </h2>
                {isRecording && (
                   <span className="flex items-center text-red-500 text-xs font-bold animate-pulse uppercase">
                     <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span> Recording
                   </span>
                )}
             </div>
             
             <div className="w-full h-full min-h-[250px] p-4 bg-secondary/50 rounded-lg border border-border/50 text-foreground whitespace-pre-wrap flex items-start overflow-y-auto italic">
                {transcript || (isRecording ? "Listening..." : "Click 'Start Recording' and start speaking to see transcription here...")}
             </div>
           </div>

           <Button 
             onClick={toggleRecording} 
             size="lg" 
             variant={isRecording ? "destructive" : "default"} 
             className="w-full mt-6 h-14 text-lg font-semibold"
           >
             {isRecording ? (
               <><MicOff className="w-5 h-5 mr-2" /> Stop & Analyze</>
             ) : (
               <><Mic className="w-5 h-5 mr-2" /> Start Recording</>
             )}
           </Button>
        </div>

        {/* Global Analysis Result Panel */}
        <div className="p-6 rounded-xl bg-card border border-border/50 shadow-card flex flex-col">
            <h2 className="text-lg font-semibold flex items-center mb-6">
              <BrainCircuit className="w-5 h-5 mr-3 text-accent" />
              Gemini 2.5 Flash Analysis
            </h2>
            
            {analyzeMutation.isPending ? (
               <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                 <Loader2 className="w-10 h-10 text-accent animate-spin" />
                 <p className="text-muted-foreground animate-pulse text-sm font-medium">Analyzing semantics, behavioral cues, and confidence...</p>
               </div>
            ) : result ? (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                 
                 <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border/50">
                   <div className="font-semibold text-foreground flex items-center">
                     <Activity className="w-4 h-4 mr-2 text-accent" /> 
                     Confidence Score
                   </div>
                   <div className={`text-2xl font-bold ${result.confidence_score > 75 ? 'text-green-500' : 'text-yellow-500'}`}>
                     {result.confidence_score}/100
                   </div>
                 </div>

                 <div className="space-y-2">
                   <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider">Tone & Pacing</h3>
                   <p className="p-4 bg-background border rounded-lg text-sm">{result.tone_analysis || "No tone detected."}</p>
                 </div>

                 <div className="space-y-2">
                   <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider flex justify-between">
                     Filler Words Counted 
                     <span className="text-red-400">Total: {Object.values((result.filler_word_count as Record<string, number>)||{}).reduce((a,b)=>a+b,0)}</span>
                   </h3>
                   <div className="flex flex-wrap gap-2 p-3 bg-background border rounded-lg">
                      {Object.keys(result.filler_word_count || {}).length > 0 ? Object.entries(result.filler_word_count).map(([word, count]) => (
                         <span key={word} className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded text-xs font-bold font-mono">
                            "{word}": {count as number}
                         </span>
                      )) : <span className="text-sm text-muted-foreground">Perfect! No filler words.</span>}
                   </div>
                 </div>

                 <div className="space-y-2 border-t border-border/50 pt-4">
                   <h3 className="text-sm font-bold uppercase text-accent tracking-wider">Live Coaching Nudge</h3>
                   <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg text-sm font-medium text-foreground">
                      💡 {result.live_coaching_nudge}
                   </div>
                 </div>

               </motion.div>
            ) : (
               <div className="flex-1 flex flex-col items-center justify-center opacity-50">
                 <BrainCircuit className="w-16 h-16 mb-4 text-muted-foreground" />
                 <p className="text-muted-foreground text-center text-sm max-w-[250px]">Record an answer using your microphone to receive real-time behavioral insights and coaching.</p>
               </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default MultimodalSimulator;

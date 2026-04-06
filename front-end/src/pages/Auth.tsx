import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ArrowLeft, Mail, Lock, User, Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
// import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ModeToggle } from "@/components/mode-toggle";
import { authApi } from "@/lib/api";

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("kasisumanth8@gmail.com");
    const [password, setPassword] = useState("admin_password_2026");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showOtp, setShowOtp] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                navigate("/dashboard");
            }
        };
        checkUser();
    }, [navigate]);

    const handleSendOtp = async () => {
        if (!email) {
            toast.error("Please enter your email first");
            return;
        }
        setLoading(true);
        try {
            await authApi.sendOtp(email);
            setOtpSent(true);
            toast.success("OTP sent to your email!");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isLogin && password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            if (isLogin) {
                const response = await authApi.login({ email, password });
                const { token, user } = response.data;
                
                if (token) {
                    localStorage.setItem('token', token);
                    localStorage.setItem('user', JSON.stringify(user));
                    toast.success("Welcome back!");
                    navigate("/dashboard");
                    return;
                }
            } else {
                await authApi.register({ username: email, email, password, fullName });
                toast.success("Account created! Please log in.");
                setIsLogin(true);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || error.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="flex justify-between items-center mb-8">
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </button>
                    <ModeToggle />
                </div>

                <div className="bg-card shadow-card rounded-2xl border border-border/50 p-8">
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center mx-auto mb-4 scale-110 shadow-lg shadow-accent/20">
                            <Brain className="w-7 h-7 text-accent-foreground" />
                        </div>
                        <h1 className="text-2xl font-bold text-foreground">
                            {showOtp ? "Verify OTP" : isLogin ? "Welcome Back" : "Create Account"}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-2">
                            {showOtp 
                                ? "Enter the 6-digit code sent to your email" 
                                : isLogin
                                    ? "Enter your credentials to access your dashboard"
                                    : "Join ACIA and accelerate your career journey"}
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {!showOtp ? (
                            <motion.form 
                                key="auth-form"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onSubmit={handleAuth} 
                                className="space-y-4"
                            >
                                {!isLogin && (
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Full Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="fullName"
                                                type="text"
                                                placeholder="John Doe"
                                                className="pl-10"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="name@university.edu"
                                            className="pl-10"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">Password</Label>
                                        <button
                                            type="button"
                                            onClick={() => setShowOtp(true)}
                                            className="text-xs text-accent hover:underline focus:outline-none"
                                        >
                                            Login with OTP instead?
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="pl-10 pr-10"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {!isLogin && (
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="confirmPassword"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                className="pl-10 pr-10"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                <Button type="submit" className="w-full mt-2" size="lg" disabled={loading}>
                                    {loading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : isLogin ? (
                                        "Log In"
                                    ) : (
                                        "Register"
                                    )}
                                </Button>
                            </motion.form>
                        ) : (
                            <motion.div 
                                key="otp-form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="otp-email">Email Address</Label>
                                    <Input
                                        id="otp-email"
                                        type="email"
                                        placeholder="name@university.edu"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={otpSent}
                                    />
                                </div>
                                
                                {otpSent && (
                                    <div className="space-y-2">
                                        <Label htmlFor="otp">Enter OTP</Label>
                                        <Input
                                            id="otp"
                                            type="text"
                                            placeholder="123456"
                                            maxLength={6}
                                            className="text-center tracking-[1em] font-bold text-lg"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                        />
                                    </div>
                                )}

                                <Button 
                                    onClick={otpSent ? async () => {
                                        setLoading(true);
                                        try {
                                            await authApi.verifyOtp(email, otp);
                                            toast.success("OTP Verified!");
                                            // In a real app, verify-otp would return a session token
                                            setShowOtp(false);
                                        } catch (e: any) {
                                            toast.error(e.response?.data?.error || "Invalid OTP");
                                        } finally {
                                            setLoading(false);
                                        }
                                    } : handleSendOtp} 
                                    className="w-full" 
                                    size="lg" 
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : otpSent ? "Verify OTP" : "Send OTP"}
                                </Button>
                                
                                <Button variant="ghost" className="w-full" onClick={() => { setShowOtp(false); setOtpSent(false); }}>
                                    Back to Login
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="mt-8 pt-6 border-t text-center space-y-4">


                        <p className="text-sm text-muted-foreground">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-accent font-semibold hover:underline"
                            >
                                {isLogin ? "Sign Up" : "Log In"}
                            </button>
                        </p>
                    </div>
                </div>

                <p className="text-center text-xs text-muted-foreground mt-8">
                    By continuing, you agree to ACIA's Terms of Service and Privacy Policy.
                </p>
            </motion.div>
        </div>
    );
};

export default Auth;


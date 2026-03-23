"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Mail, Lock, LogIn, ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!email || !password) {
      setError("Please provide all security credentials.");
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError("The email format provided is invalid.");
      setLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: true,
        callbackUrl: "/dashboard",
      });

      if (result?.error) {
        setError("Unauthorized access. Invalid credentials.");
      }
    } catch (err) {
      setError("A system error occurred. Please re-authenticate.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        <motion.div 
          whileHover={{ y: -5 }}
          className="glass-card rounded-[2.5rem] p-10 shadow-2xl relative"
        >
          <motion.div variants={itemVariants} className="text-center space-y-3 mb-10">
            <div className="flex justify-center mb-6">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="p-4 bg-primary/10 rounded-2xl text-primary neon-glow"
              >
                <ShieldCheck size={40} />
              </motion.div>
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-foreground">
              Portal <span className="text-primary italic">Access</span>
            </h1>
            <p className="text-[12px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">
              System Authorization Required
            </p>
          </motion.div>

          <form onSubmit={handleLogin} noValidate className="space-y-6">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-xs font-bold flex items-center gap-3"
                >
                  <AlertCircle size={16} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-5">
              <motion.div variants={itemVariants} className="space-y-2 group">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">
                  Terminal ID (Email)
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="name@internhub.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 bg-muted/20 border-border/50 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all pl-12 font-bold tracking-tight rounded-2xl"
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors" size={20} />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2 group">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">
                  Secure Access Key
                </label>
                <div className="relative">
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 bg-muted/20 border-border/50 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all pl-12 font-bold tracking-tight rounded-2xl"
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors" size={20} />
                </div>
              </motion.div>
            </div>

            <motion.div variants={itemVariants}>
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[12px] shadow-lg neon-glow scale-100 hover:scale-[1.02] active:scale-95 transition-all bg-primary hover:bg-primary/90"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    Establish Connection <LogIn size={18} />
                  </span>
                )}
              </Button>
            </motion.div>
          </form>

          <motion.div variants={itemVariants} className="pt-8 border-t border-border/50 text-center">
            <p className="text-[11px] font-bold text-muted-foreground/30 uppercase tracking-[0.15em] leading-relaxed">
              Monitored for Security Compliance <br />
              <span className="text-primary/40 hover:text-primary cursor-pointer transition-colors">Privacy Protocol & NDA Applies</span>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useFormik } from "formik";
import * as Yup from "yup";
import Loader from "@/components/Loader/page";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, LogIn, ShieldCheck, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5 },
    },
};

export default function LoginPage() {
    const [serverError, setServerError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const { handleSubmit, handleBlur, handleChange, values, errors, touched } = useFormik({
        initialValues: {
            email: "",
            password: "",
        },
        validationSchema: Yup.object({
            email: Yup.string()
                .email("Invalid email format")
                .required("Email is required"),
            password: Yup.string()
                .min(6, "Password must be at least 6 characters")
                .required("Password is required"),
        }),
        onSubmit: async (values) => {
            setLoading(true);
            setServerError("");

            try {
                const response = await signIn("credentials", {
                    email: values.email,
                    password: values.password,
                    redirect: false,
                });

                if (response?.error) {
                    setServerError("Invalid terminal ID or access key.");
                    toast.error("Invalid credentials. Please verify and retry.");
                } else {
                    router.refresh();
                    router.push("/dashboard");
                    toast.success("Identity Verified. Establishing Connection...");
                }
            } catch (err) {
                setServerError("A connection error occurred.");
            } finally {
                setLoading(false);
            }
        },
    });

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="flex items-center justify-center min-h-screen px-4 py-12 relative overflow-hidden">
            {/* Decorative background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-md relative z-10"
            >
                <div className="glass-card rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
                    <motion.div variants={itemVariants} className="text-center space-y-3 mb-10">
                        <div className="flex justify-center mb-6">
                            <motion.div 
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className="p-4 bg-primary/10 rounded-2xl text-primary neon-glow"
                            >
                                <ShieldCheck size={40} />
                            </motion.div>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase">
                           Portal <span className="text-primary italic">Access</span>
                        </h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 leading-relaxed">
                            System Authorization Required <br /> InternHub Protocol v2.0
                        </p>
                    </motion.div>

                    <form onSubmit={handleSubmit} noValidate className="space-y-6">
                        <AnimatePresence mode="wait">
                            {(serverError || (touched.email && errors.email) || (touched.password && errors.password)) && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-3"
                                >
                                    <AlertCircle size={16} />
                                    <span>{serverError || (touched.email && errors.email) || (touched.password && errors.password)}</span>
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
                                        name="email"
                                        placeholder="name@internhub.com"
                                        value={values.email}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={`h-14 bg-muted/20 border-border/50 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all pl-12 font-bold tracking-tight rounded-2xl ${touched.email && errors.email ? "border-red-500/50" : ""}`}
                                    />
                                    <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${touched.email && errors.email ? "text-red-500/40" : "text-muted-foreground/40 group-focus-within:text-primary"}`} size={20} />
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className="space-y-2 group">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">
                                    Secure Access Key
                                </label>
                                <div className="relative">
                                    <Input
                                        type="password"
                                        name="password"
                                        placeholder="••••••••"
                                        value={values.password}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={`h-14 bg-muted/20 border-border/50 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all pl-12 font-bold tracking-tight rounded-2xl ${touched.password && errors.password ? "border-red-500/50" : ""}`}
                                    />
                                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${touched.password && errors.password ? "text-red-500/40" : "text-muted-foreground/40 group-focus-within:text-primary"}`} size={20} />
                                </div>
                            </motion.div>
                        </div>

                        <motion.div variants={itemVariants}>
                            <Button 
                                type="submit" 
                                disabled={loading}
                                className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[12px] shadow-lg neon-glow scale-100 hover:scale-[1.02] active:scale-95 transition-all bg-primary hover:bg-primary/90"
                            >
                                <span className="flex items-center gap-2">
                                    Establish Connection <LogIn size={18} />
                                </span>
                            </Button>
                        </motion.div>
                    </form>

                    <motion.div variants={itemVariants} className="pt-8 border-t border-border/50 text-center mt-8">
                        <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] leading-relaxed">
                            Monitored Connection <br />
                            <span className="text-primary/40 hover:text-primary cursor-pointer transition-colors">Security Protocol Applied</span>
                        </p>
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="text-center mt-4">
                        <button
                            onClick={() => router.push("/")}
                            className="text-[10px] font-black uppercase tracking-widest text-primary/40 hover:text-primary transition-colors"
                        >
                            ← Return to Grid
                        </button>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
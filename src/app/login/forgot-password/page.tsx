"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useFormik } from "formik";
import * as Yup from "yup";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, KeyRound, ShieldAlert, ArrowLeft, Send, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordChecklist } from "@/components/ui/password-checklist";

const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.1 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<1 | 2>(1);
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState("");
    const [isPasswordSecure, setIsPasswordSecure] = useState(false);
    const [resendCount, setResendCount] = useState(0);
    const [resendTimer, setResendTimer] = useState(0);
    const router = useRouter();

    const formikEmail = useFormik({
        initialValues: { email: "" },
        validationSchema: Yup.object({
            email: Yup.string().email("Invalid email format").required("Email is required"),
        }),
        onSubmit: async (values) => {
            setLoading(true);
            setServerError("");
            try {
                const res = await fetch("/api/auth/forgot-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: values.email }),
                });
                const data = await res.json();
                
                if (data.success) {
                    toast.success("Verification code sent to your email!");
                    setStep(2);
                } else {
                    setServerError(data.error || "Email not recognized.");
                }
            } catch (err) {
                setServerError("Failed to send OTP. Check network.");
            } finally {
                setLoading(false);
            }
        },
    });

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    const handleResendOTP = async () => {
        if (resendCount >= 5 || resendTimer > 0 || loading) return;

        setLoading(true);
        setServerError("");
        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: formikEmail.values.email }),
            });
            const data = await res.json();
            
            if (data.success) {
                toast.success("New OTP sent to your email!");
                setResendCount(prev => prev + 1);
                setResendTimer(60);
            } else {
                setServerError(data.error || "Failed to resend OTP.");
            }
        } catch (err) {
            setServerError("Failed to send OTP. Check network.");
        } finally {
            setLoading(false);
        }
    };

    const formikReset = useFormik({
        initialValues: { otp: "", newPassword: "", confirmPassword: "" },
        validationSchema: Yup.object({
            otp: Yup.string()
                .length(6, "Code strictly must be 6 digits")
                .matches(/^[0-9]+$/, "Must be only digits")
                .required("Verification code is required"),
            newPassword: Yup.string()
                .min(10, "Secure key must be at least 10 characters")
                .required("New password is required"),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref('newPassword')], 'Passwords must match')
                .required("Please confirm your password"),
        }),
        onSubmit: async (values) => {
            setLoading(true);
            setServerError("");
            try {
                const res = await fetch("/api/auth/reset-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        email: formikEmail.values.email, 
                        otp: values.otp, 
                        newPassword: values.newPassword 
                    }),
                });
                const data = await res.json();
                
                if (data.success) {
                    toast.success("Password reset securely. You may now login.");
                    router.push("/login");
                } else {
                    setServerError(data.error || "Access key override rejected.");
                }
            } catch (err) {
                setServerError("System sync failed. Protocol timeout.");
            } finally {
                setLoading(false);
            }
        },
    });

    return (
        <div className="flex items-center justify-center min-h-screen px-4 py-12 relative overflow-hidden bg-background">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-md relative z-10">
                <div className="glass-card rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden text-center">
                    
                    <motion.div variants={itemVariants} className="flex justify-center mb-6">
                        <div className="p-4 bg-primary/10 rounded-2xl text-primary neon-glow">
                            <ShieldAlert size={40} />
                        </div>
                    </motion.div>
                    
                    <motion.h1 variants={itemVariants} className="text-3xl font-black tracking-tighter text-foreground uppercase mb-2">
                        Password <span className="text-primary italic">Recovery</span>
                    </motion.h1>
                    
                    <motion.p variants={itemVariants} className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 leading-relaxed mb-8">
                        {step === 1 ? "Enter your email to receive OTP" : "Enter OTP and set new password"}
                    </motion.p>

                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.form 
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onSubmit={formikEmail.handleSubmit} 
                                className="space-y-6 text-left"
                            >
                                <AnimatePresence mode="wait">
                                    {(serverError || (formikEmail.touched.email && formikEmail.errors.email)) && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 mb-6"
                                        >
                                            <AlertCircle size={16} />
                                            <span>{serverError || (formikEmail.touched.email && formikEmail.errors.email)}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="space-y-2 group">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">
                                        Terminal ID (Email)
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type="email"
                                            name="email"
                                            placeholder="name@internhub.com"
                                            value={formikEmail.values.email}
                                            onChange={formikEmail.handleChange}
                                            onBlur={formikEmail.handleBlur}
                                            className={`h-14 bg-muted/20 border-border/50 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all pl-12 font-bold tracking-tight rounded-2xl ${formikEmail.touched.email && formikEmail.errors.email ? "border-red-500/50" : ""}`}
                                        />
                                        <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${formikEmail.touched.email && formikEmail.errors.email ? "text-red-500/40" : "text-muted-foreground/40 group-focus-within:text-primary"}`} size={20} />
                                    </div>
                                </div>

                                <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[12px] shadow-lg neon-glow scale-100 hover:scale-[1.02] active:scale-95 transition-all bg-primary hover:bg-primary/90">
                                    <span className="flex items-center gap-2">Send OTP <Send size={16} /></span>
                                </Button>
                            </motion.form>
                        ) : (
                            <motion.form 
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={formikReset.handleSubmit} 
                                className="space-y-6 text-left"
                            >
                                <AnimatePresence mode="wait">
                                    {(serverError || (formikReset.touched.otp && formikReset.errors.otp) || (formikReset.touched.newPassword && formikReset.errors.newPassword) || (formikReset.touched.confirmPassword && formikReset.errors.confirmPassword)) && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-3"
                                        >
                                            <AlertCircle size={16} />
                                            <span>{serverError || formikReset.errors.otp || formikReset.errors.newPassword || formikReset.errors.confirmPassword}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="space-y-2 group">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">
                                        6-Digit Verification Code
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type="text"
                                            name="otp"
                                            placeholder="000000"
                                            maxLength={6}
                                            value={formikReset.values.otp}
                                            onChange={formikReset.handleChange}
                                            onBlur={formikReset.handleBlur}
                                            className={`h-14 bg-muted/20 border-border/50 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all pl-12 font-black text-2xl tracking-[0.5em] text-center rounded-2xl text-primary ${formikReset.touched.otp && formikReset.errors.otp ? "border-red-500/50" : ""}`}
                                        />
                                        <KeyRound className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${formikReset.touched.otp && formikReset.errors.otp ? "text-red-500/40" : "text-muted-foreground/40 group-focus-within:text-primary"}`} size={20} />
                                    </div>
                                </div>

                                <div className="space-y-4 group">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <PasswordInput
                                            name="newPassword"
                                            placeholder="••••••••"
                                            isSecure={isPasswordSecure}
                                            value={formikReset.values.newPassword}
                                            onChange={formikReset.handleChange}
                                            onBlur={formikReset.handleBlur}
                                            className={`h-14 bg-muted/20 border-border/50 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all font-bold tracking-tight rounded-2xl pl-12 ${formikReset.touched.newPassword && formikReset.errors.newPassword ? "border-red-500/50" : ""}`}
                                        />
                                    </div>
                                    <PasswordChecklist 
                                        password={formikReset.values.newPassword} 
                                        onValidationChange={setIsPasswordSecure} 
                                    />
                                </div>

                                <div className="space-y-2 group">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <PasswordInput
                                            name="confirmPassword"
                                            placeholder="Confirm ••••••••"
                                            isSecure={formikReset.values.newPassword !== "" && formikReset.values.newPassword === formikReset.values.confirmPassword}
                                            value={formikReset.values.confirmPassword}
                                            onChange={formikReset.handleChange}
                                            onBlur={formikReset.handleBlur}
                                            className={`h-14 bg-muted/20 border-border/50 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all font-bold tracking-tight rounded-2xl pl-12 ${formikReset.touched.confirmPassword && formikReset.errors.confirmPassword ? "border-red-500/50" : ""}`}
                                        />
                                    </div>
                                    {formikReset.values.confirmPassword && (
                                        <div className={`mt-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ml-1 ${formikReset.values.newPassword === formikReset.values.confirmPassword ? "text-emerald-500" : "text-red-500/60"}`}>
                                            {formikReset.values.newPassword === formikReset.values.confirmPassword ? (
                                                <> <CheckCircle2 size={12} /> Passwords Match</>
                                            ) : (
                                                <> <XCircle size={12} /> Passwords Do Not Match</>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="pt-2">
                                    <Button 
                                        type="submit" 
                                        disabled={loading || !isPasswordSecure || !formikReset.isValid} 
                                        className={`w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[12px] shadow-lg neon-glow transition-all bg-primary hover:bg-primary/90 ${(!isPasswordSecure || !formikReset.isValid) ? "opacity-50 grayscale cursor-not-allowed" : "scale-100 hover:scale-[1.02] active:scale-95"}`}
                                    >
                                        Reset Password
                                    </Button>
                                </div>

                                {(!formikReset.isValid || !isPasswordSecure) && formikReset.submitCount > 0 && (
                                    <p className="text-center text-[9px] font-black uppercase tracking-[0.2em] text-red-500 animate-pulse mt-4">
                                        Validation Error: Security protocols not met
                                    </p>
                                )}

                                <div className="mt-8 pt-6 border-t border-border/10">
                                    {resendCount >= 5 ? (
                                        <p className="text-center text-[9px] font-black uppercase tracking-[0.2em] text-red-500/60 pb-2 italic">
                                            OTP resend limit reached (5/5)
                                        </p>
                                    ) : (
                                        <button
                                            type="button"
                                            disabled={resendTimer > 0 || loading}
                                            onClick={handleResendOTP}
                                            className={`w-full text-center text-[10px] font-black uppercase tracking-[0.2em] transition-all py-2 rounded-xl border border-transparent ${resendTimer > 0 ? "text-muted-foreground/30 cursor-not-allowed" : "text-primary hover:bg-primary/5 active:scale-95"}`}
                                        >
                                            {resendTimer > 0 ? (
                                                `Resend available in ${resendTimer}s`
                                            ) : (
                                                <span className="flex items-center justify-center gap-2">
                                                    Didn't receive the code? <span className="underline underline-offset-4 decoration-primary/30 hover:decoration-primary">Resend OTP</span>
                                                </span>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    <motion.div variants={itemVariants} className="text-center mt-6">
                        <button
                            onClick={() => router.push("/login")}
                            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 hover:text-primary transition-colors flex items-center justify-center gap-2 w-full p-2"
                        >
                            <ArrowLeft size={14} /> Abort Recovery
                        </button>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}

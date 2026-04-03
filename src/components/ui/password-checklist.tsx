"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { checkPasswordStrength } from "@/lib/password-utils";
import { cn } from "@/lib/utils";

interface PasswordChecklistProps {
  password?: string;
  onValidationChange?: (isValid: boolean) => void;
}

const WEAK_PASSWORDS = [
  "123456", "12345678", "123456789", "1234567890",
  "password", "password123", "password1234",
  "admin", "admin123", "admin1234", "admin12345",
  "qwerty", "qwertyuiop", "letmein", "welcome",
  "111111", "000000", "123123"
];

export function PasswordChecklist({ password = "", onValidationChange }: PasswordChecklistProps) {
  const [breachCount, setBreachCount] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const isLengthOk = password.length >= 10;
  const isNotCommon = password.length > 0 && !WEAK_PASSWORDS.includes(password.toLowerCase());

  useEffect(() => {
    const isSafe = isLengthOk && isNotCommon && breachCount === 0;
    onValidationChange?.(isSafe);
  }, [isLengthOk, isNotCommon, breachCount, onValidationChange]);

  useEffect(() => {
    if (!password) {
      setBreachCount(null);
      setIsChecking(false);
      return;
    }

    // Quick escape if they haven't typed enough to realistically match breaches
    if (password.length < 5) {
      setBreachCount(null);
      return;
    }

    setIsChecking(true);
    let isMounted = true;

    // 600ms Debounce to prevent API spam while typing
    const timeoutId = setTimeout(async () => {
      try {
        const { breachedCount } = await checkPasswordStrength(password);
        if (isMounted) {
          setBreachCount(breachedCount ?? 0);
        }
      } catch (err) {
        console.warn("Could not check HIBP", err);
      } finally {
        if (isMounted) setIsChecking(false);
      }
    }, 600);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    }
  }, [password]);

  if (!password) return null;

  return (
    <div className="mt-2 space-y-3">
      {/* Basic Criteria Box */}
      <div className="p-4 bg-muted/30 rounded-xl border border-border/50 text-[10px] font-black tracking-widest uppercase space-y-2.5">
        <div className={cn("flex items-center gap-2", isLengthOk ? "text-emerald-500" : "text-muted-foreground/60")}>
          {isLengthOk ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
          <span>At least 10 characters</span>
        </div>
        <div className={cn("flex items-center gap-2", isNotCommon ? "text-emerald-500" : "text-muted-foreground/60")}>
          {isNotCommon ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
          <span>Not a weak phrase</span>
        </div>
      </div>

      {/* Advanced Security / Breach Box */}
      {isChecking ? (
        <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-primary text-[10px] font-black tracking-widest uppercase flex items-center gap-2 animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin" />
          Checking security databases...
        </div>
      ) : breachCount !== null && breachCount > 0 ? (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="flex flex-col gap-1">
            <span className="text-xs font-black uppercase tracking-widest">Security Compromised</span>
            <span className="text-[11px] font-medium opacity-90 leading-relaxed">
              This password was found in <strong className="font-extrabold">{breachCount.toLocaleString()}</strong> known data breaches. It is highly unsafe to use.
            </span>
          </div>
        </div>
      ) : password.length >= 5 && breachCount === 0 ? (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-500 text-[10px] font-black tracking-widest uppercase flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Verified safe from known data breaches
        </div>
      ) : null}
    </div>
  )
}

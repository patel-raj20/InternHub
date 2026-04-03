"use client";

import { useState, forwardRef } from "react";
import { Eye, EyeOff, ShieldCheck, ShieldAlert } from "lucide-react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isSecure?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, isSecure = false, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="relative w-full">
        {/* Left Shield Icon */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300">
          {isSecure ? (
             <ShieldCheck className="w-5 h-5 text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)] bg-background rounded-full" />
          ) : (
             <ShieldAlert className="w-5 h-5 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.3)] bg-background rounded-full" />
          )}
        </div>

        {/* The Input */}
        <Input
          type={showPassword ? "text" : "password"}
          className={cn("pl-11 pr-11 transition-all", isSecure ? "border-emerald-500/50 focus-visible:ring-emerald-500/20" : "", className)}
          ref={ref}
          {...props}
        />

        {/* Right Hide/Show Button */}
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors p-1"
          tabIndex={-1}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

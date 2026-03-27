"use client";

import { Modal } from "./modal";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  isLoading?: boolean;
  variant?: "danger" | "primary";
}

export function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description, 
  confirmText = "Confirm",
  isLoading = false,
  variant = "danger"
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">{description}</p>
        
        <div className="flex gap-4 justify-end pt-4">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isLoading}
            className="rounded-xl font-bold uppercase tracking-widest text-[10px]"
          >
            Cancel
          </Button>
          <Button 
            disabled={isLoading}
            variant="primary"
            onClick={() => {
              onConfirm();
              // Note: onClose should be called by the parent after success or here if synchronous
            }} 
            className={cn(
              "min-w-[120px] rounded-xl font-black uppercase tracking-widest text-[10px]",
              variant === "danger" ? "bg-red-500 hover:bg-red-600 shadow-red-500/20" : "shadow-lg shadow-primary/20",
              variant === "primary" ? "neon-glow" : ""
            )}
          >
            {isLoading ? "Processing..." : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

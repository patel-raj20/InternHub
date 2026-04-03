"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { graphqlService } from "@/lib/services/graphql-service";
import { TaskBoard } from "@/components/interns/TaskBoard";
import { WelcomeHeader } from "@/components/interns/welcome-header";
import { Loader2, ClipboardList } from "lucide-react";
import { Intern } from "@/lib/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function InternTasksPage() {
  const { id: userId } = useSelector((state: RootState) => state.user);
  const [intern, setIntern] = useState<Intern | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchIntern = async () => {
      if (!userId) return;
      setIsLoading(true);
      try {
        const data = await graphqlService.getInternByUserId(userId);
        setIntern(data);
      } catch (error) {
        console.error("Failed to fetch intern:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchIntern();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!intern) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold font-black tracking-tight uppercase">Profile not found</h2>
        <p className="text-muted-foreground font-medium">We couldn't find your intern details to load tasks.</p>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4 space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <ClipboardList className="w-6 h-6" />
             </div>
             <h1 className="text-3xl font-black tracking-tighter uppercase">My Board</h1>
          </div>
          <p className="text-muted-foreground font-medium ml-1">Manage and complete your assigned goals.</p>
        </div>
      </div>

      <div className="glass-card rounded-[2.5rem] p-8 border border-border/50 shadow-sm relative overflow-hidden">
         <TaskBoard 
            internId={intern.id} 
            onTaskCompleted={() => {
                // Refresh logic if needed, but TaskBoard handles its own state
            }} 
         />
      </div>
    </div>
  );
}

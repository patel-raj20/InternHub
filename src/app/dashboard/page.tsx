"use client";

import { useSession } from "next-auth/react";
import Loader from "@/components/Loader/page";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "authenticated" && session?.user?.role) {
            // Redirect based on role
            switch (session.user.role) {
                case "SUPER_ADMIN":
                    router.push("/super-admin/dashboard");
                    break;
                case "DEPT_ADMIN":
                    router.push("/admin/dashboard");
                    break;
                case "INTERN":
                    router.push("/profile");
                    break;
                default:
                    break;
            }
        }
    }, [session, status, router]);

    // Show loader while redirecting or loading session
    if (status === "loading" || status === "authenticated") return <Loader />;

    if (!session) return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <p className="text-muted-foreground">Unauthorized. Redirecting to login...</p>
        </div>
    );

    return <Loader />;
}

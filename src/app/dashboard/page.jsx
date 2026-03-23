"use client"; // ✅ MUST for hooks

import { useSession } from "next-auth/react";
import Loader from "@/components/Loader/page";
import { signOut } from "next-auth/react";

export default function Dashboard() {
    const { data: session, status } = useSession();

    if (status === "loading") return <Loader />;

    if (!session) return <p>Unauthorized</p>;

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 text-center">

                {/* heading */}
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                    Dashboard
                </h1>

                {/* user info */}
                <div className="space-y-3 text-gray-600">
                    <p className="text-sm">
                        <span className="font-medium text-gray-800">Email:</span>{" "}
                        {session.user.email}
                    </p>

                    <p className="text-sm">
                        <span className="font-medium text-gray-800">Role:</span>{" "}
                        <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-md text-xs font-semibold">
                            {session.user.role}
                        </span>
                    </p>
                </div>

                {/* actions */}
                <div className="mt-6 flex flex-col gap-3">
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
                    >
                        Logout
                    </button>
                </div>

            </div>
        </div>
    );
}
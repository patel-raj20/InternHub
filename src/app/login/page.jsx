"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Loader from "@/components/Loader/page";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!email || !password) {
            setError("Please enter email and password");
            alert("Please enter email and password");
            setLoading(false);
            return;
        }

        const result = await signIn("credentials", {
            email,
            password,
            redirect: true,
            callbackUrl: "/dashboard",
        });

        if (result.error) {
            setError("Invalid email or password");
            alert("Login failed: " + result.error);
        }
        setLoading(false);
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="flex items-center justify-center min-h-screen px-4  text-gray-800">
            <div className="w-full max-w-sm bg-white shadow-lg rounded-2xl p-6">

                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                        {error}
                    </div>
                )}
                {/* heading */}
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                    Login
                </h2>

                <div className="space-y-4">

                    {/* email */}
                    <input
                        type="email"
                        placeholder="Email"
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />

                    {/* password */}
                    <input
                        type="password"
                        placeholder="Password"
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />

                    {/* login button */}
                    <button
                        onClick={handleLogin}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                        Login
                    </button>

                </div>
            </div>
        </div>
    );
}
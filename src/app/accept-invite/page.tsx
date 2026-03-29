"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function InviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "valid" | "invalid">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      setErrorMsg("No token provided");
      return;
    }

    // Verify token
    fetch("/api/invite/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setStatus("invalid");
          setErrorMsg(data.error);
        } else {
          setStatus("valid");
        }
      })
      .catch((err) => {
        setStatus("invalid");
        setErrorMsg("Failed to verify token");
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/invite/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      
      if (data.error) {
        alert(data.error);
      } else {
        alert("Password set successfully!");
        router.push("/login");
      }
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 text-lg font-medium">Verifying your invite link...</p>
        </div>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg border-t-4 border-red-500 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Invalid Invite Link</h2>
          <p className="text-gray-600 mb-8">{errorMsg || "This invite link is invalid or has expired."}</p>
          <button 
            onClick={() => router.push("/login")}
            className="w-full bg-gray-900 text-white font-medium py-3 px-4 rounded-lg hover:bg-gray-800 transition shadow-md hover:shadow-lg active:scale-[0.98]"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-2">Welcome! 👋</h2>
          <p className="text-blue-100 mt-2 text-sm opacity-90">Set your password to finish creating your account.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              className="w-full p-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
            <input
              type="password"
              className="w-full p-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              placeholder="••••••••"
            />
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full mt-4 text-white font-semibold rounded-xl text-lg px-5 py-3.5 text-center transition shadow-md hover:shadow-lg ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'}`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : "Accept Invite"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <InviteContent />
    </Suspense>
  );
}

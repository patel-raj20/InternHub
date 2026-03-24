"use client";

import { signIn } from "next-auth/react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFormik } from "formik";
import * as Yup from "yup";
import Loader from "@/components/Loader/page";

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

            const response = await signIn("credentials", {
                email: values.email,
                password: values.password,
                redirect: false,
            });

            if (response.error) {
                setServerError("Invalid email or password. Please try again.");
            } else {
                router.refresh(); // Refresh to update session state
                router.push("/dashboard"); // Redirect to dashboard on successful login
            }

            setLoading(false);
        },
    });

    // return loader if loading
    if (loading) {
        return <Loader />;
    }

    // return login form
    return (
        <div className="w-full h-screen flex justify-center items-center text-gray-600">
            <div className="w-1/4 h-fit flex flex-col gap-5 px-8 py-16 justify-center text-center bg-white rounded-2xl shadow-lg">

                {/* heading */}
                <h2 className="text-2xl font-bold mb-7 text-gray-800">
                    Welcome Back! <br />
                    <span className="text-blue-600 text-4xl">InternHub</span>
                </h2>

                {/* Server errors message */}
                {serverError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{serverError}</span>
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                    {/* Email */}
                    <div className="w-full flex flex-col mb-6">
                        {/* Input field */}
                        <input
                            type="email"
                            name="email"
                            placeholder="intern@internhub.com"
                            value={values.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${touched.email && errors.email ? "border-red-500" : "border-gray-300"}`}
                        />
                        {/* Validation error message */}
                        {touched.email && errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="w-full flex flex-col mb-6">
                        {/* Input field */}
                        <input
                            type="password"
                            name="password"
                            placeholder="Your password"
                            value={values.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${touched.password && errors.password ? "border-red-500" : "border-gray-300"}`}
                        />
                        {/* Validation error message */}
                        {touched.password && errors.password && (
                            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                        )}
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition duration-200 shadow-md hover:shadow-lg active:scale-95"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>

                {/* Go back to home button */}
                <div className="text-center mt-4">
                    <button
                        onClick={() => router.push("/")}
                        className="text-blue-600 hover:text-blue-800 transition duration-200"
                    >
                        ← Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
}
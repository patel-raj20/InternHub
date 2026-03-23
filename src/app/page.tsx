import Link from "next/link";
export default function Home() {

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-blue-950 px-4">
            <div className="text-center space-y-6 bg-white/70 backdrop-blur-md shadow-xl rounded-2xl p-10">

                {/* heading */}
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 leading-tight">
                    Welcome to{" "}
                    <span className="text-blue-600 animate-pulse drop-shadow-sm">
                        InternHub 🚀
                    </span>
                </h1>

                {/* subtitle */}
                <p className="text-gray-500 text-base sm:text-lg">
                    Manage interns efficiently and easily
                </p>

                {/* buttons */}
                <div className="flex justify-center gap-4">
                    <Link
                        href="/login"
                        className="px-6 py-2.5 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition duration-200 shadow-md hover:shadow-lg active:scale-95"
                    >
                        Login
                    </Link>
                </div>

            </div>
        </div>
    );
}
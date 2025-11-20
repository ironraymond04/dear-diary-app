import { useState } from "react";
import { useNavigate } from "react-router";
import supabase from "../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
    alert("Login failed: " + error.message);
    setLoading(false);
    return;
    }

    alert("Login successful!");
    setLoading(false);
    navigate("/main");
  };


  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Log in to proceed
        </h1>

        {/* Form */}
        <div className="space-y-4 mb-6">
          {/* Email Input */}
          <div className="relative">
            <input
              type="email"
              placeholder="Email"
              className="w-full bg-gray-200 text-gray-900 placeholder-gray-700 px-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-gray-200 text-gray-900 placeholder-gray-700 px-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {/* Sign up link */}
        <p className="text-center text-gray-700 mb-6">
          Don't have an account?{' '}
          <a href="/signup" className="underline font-medium">
            Sign up
          </a>
        </p>

        {/* Log in Button */}
        <button 
        onClick={handleLogin}
        disabled={loading}
        className="cursor-pointer w-full bg-indigo-500 hover:bg-indigo-600 text-black font-medium py-4 rounded-full transition-colors">
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}
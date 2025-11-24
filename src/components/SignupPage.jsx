import { useState } from "react";
import supabase from "../lib/supabase";

export default function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState(""); 
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });

    if (error) {
      alert("Signup Failed: " + error.message);
      setLoading(false);
      return;
    }

    alert("Signup successful. Check your email for verification.");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Title */}
        <h1 className="text-3xl text-center font-bold text-gray-900 mb-8">
          Create an account
        </h1>

        {/* Form */}
        <div className="space-y-4 mb-6">
          {/* Name Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Username"
              className="w-full bg-gray-200 text-gray-900 placeholder-gray-700 px-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onChange={(e) => setName(e.target.value)}
            />
          </div>

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

        {/* Log in link */}
        <p className="text-center text-gray-700 mb-6">
          Already have an account?{' '}
          <a href="/login" className="underline font-medium">
            Log in
          </a>
        </p>

        {/* Create account Button */}
        <button 
        onClick={handleSignup}
        disabled={loading}
        className="cursor-pointer w-full bg-indigo-500 hover:bg-indigo-600 text-black font-medium py-4 rounded-full transition-colors">
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </div>
    </div>
  );
}
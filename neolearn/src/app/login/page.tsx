"use client";

import { useState, useEffect } from "react";
import { auth } from "@/firebase";
import { signIn, signUp } from "@/auth/auth"; // Ensure these functions are exported from auth.tsx
import { signOut } from "@/auth/auth"; // Import signOut function
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(auth.currentUser);
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        router.push("/courses"); // Redirect to courses if user is logged in
      }
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Reset error message
    try {
      if (isLogin) {
        await signIn(email, password, router);
      } else {
        await signUp(email, password);
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleLogout = async () => {
    await signOut();
    setUser(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-6">{isLogin ? "Login" : "Sign Up"}</h1>
      {error && <p className="text-red-500">{error}</p>}
      
      {user ? (
        <>
          <p>Welcome, {user.email}</p>
          <button
            onClick={handleLogout}
            className="mt-4 px-6 py-3 bg-red-500 hover:bg-red-700 text-white font-semibold rounded-lg transition duration-300"
          >
            Logout
          </button>
        </>
      ) : (
        <form className="flex flex-col space-y-4" onSubmit={handleAuth}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-300"
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>
      )}

      {!user && (
        <p className="mt-4">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-400 underline"
          >
            {isLogin ? "Sign up" : "Login"}
          </button>
        </p>
      )}
    </div>
  );
}

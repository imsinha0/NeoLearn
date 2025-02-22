"use client"

import Link from 'next/link';
import { auth } from '@/firebase'; // Import auth from firebase
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await auth.signOut(); // Sign out the user
    router.push('/'); // Redirect to home page
  };

  return (
    <nav className="bg-gray-800 p-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-2xl">NeoLearn</Link>
        <div>
          <Link href="/" className="text-gray-300 hover:text-white px-4">Home</Link>
          <Link href="/courses" className="text-gray-300 hover:text-white px-4">Courses</Link>
          {user ? (
            <button onClick={handleSignOut} className="text-gray-300 hover:text-white px-4">
              Sign Out
            </button>
          ) : (
            <Link href="/login" className="text-gray-300 hover:text-white px-4">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
} 
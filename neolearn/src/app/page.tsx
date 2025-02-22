import Image from "next/image";

export default function Home() {
  return (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
    <h1 className="text-5xl font-bold mb-4">Welcome to NeoLearn</h1>
    <p className="text-lg mb-8">Your AI-powered education platform.</p>
    <a href="/login">
      <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-300">
        Go to Login
      </button>
    </a>
  </div>

    
  )
}

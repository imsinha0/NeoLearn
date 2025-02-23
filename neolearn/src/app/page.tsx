"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const router = useRouter();

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const features = [
    {
      title: "AI-Powered Learning",
      description: "Personalized learning experience powered by advanced AI that adapts to your pace and style.",
      icon: "🤖"
    },
    {
      title: "Interactive Practice",
      description: "Get instant feedback and detailed explanations for practice problems in any subject.",
      icon: "✏️"
    },
    {
      title: "Custom Courses",
      description: "Create and manage your own courses with AI-generated topics and learning paths.",
      icon: "📚"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="container mx-auto px-4 py-20 text-center"
      >
        <motion.h1 
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600"
        >
          NeoLearn
        </motion.h1>
        <motion.p 
          {...fadeIn}
          className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
        >
          Transform your learning experience with AI-powered education. 
          Get personalized lessons, instant feedback, and interactive practice sessions.
        </motion.p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/login')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-colors"
        >
          Get Started
        </motion.button>
      </motion.div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* How It Works Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="container mx-auto px-4 py-16"
      >
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-6"
          >
            <div className="text-5xl mb-4">1️⃣</div>
            <h3 className="text-xl font-bold mb-2">Create Your Course</h3>
            <p className="text-gray-300">Set up your course with AI-generated topics and learning paths</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-6"
          >
            <div className="text-5xl mb-4">2️⃣</div>
            <h3 className="text-xl font-bold mb-2">Learn Interactively</h3>
            <p className="text-gray-300">Engage with AI-powered lessons and get instant feedback</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-6"
          >
            <div className="text-5xl mb-4">3️⃣</div>
            <h3 className="text-xl font-bold mb-2">Practice & Master</h3>
            <p className="text-gray-300">Test your knowledge with adaptive practice problems</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-20">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-gray-400">© 2024 NeoLearn. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

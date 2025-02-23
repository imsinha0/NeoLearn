"use client"

import { LearningChat } from '../../components/LearningChat';
import { ProblemChat } from '../../components/ProblemChat';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/firebase'; // Import your Firestore instance
import { collection, addDoc, deleteDoc, updateDoc, doc, getDocs, query, where, getDoc } from 'firebase/firestore';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { QuizChat } from '../../components/QuizChat';

type TabType = 'learn' | 'practice' | 'quiz';

export default function ChatPage() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [topics, setTopics] = useState<string[]>([]);
  const [newTopic, setNewTopic] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingTopic, setEditingTopic] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('learn');

  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  useEffect(() => {
    const loadTopics = async () => {
      if (!courseId) return;

      try {
        const courseDoc = query(collection(db, "courses"), where("id", "==", courseId));
        const courseSnapshot = await getDocs(courseDoc);
        if (courseSnapshot.empty) return;
        const courseData = courseSnapshot.docs[0].data();
        setTopics(courseData.topics);
      } catch (error) {
        console.error("Error loading topics:", error);
      }
    };

    loadTopics();
  }, [courseId, setTopics]);

  const handleAddTopic = async () => {
    const user = auth.currentUser;
    if (!user || !newTopic.trim()) return;

    try {
      const courseQuery = query(collection(db, "courses"), where("id", "==", courseId!));
      const courseSnapshot = await getDocs(courseQuery);
      const courseRef = doc(db, "courses", courseSnapshot.docs[0].id);
    
      
      await updateDoc(courseRef, {
        topics: [...topics, newTopic.trim()]
      });

      setTopics([...topics, newTopic.trim()]);
      setNewTopic("");
      setIsAdding(false);
    } catch (error) {
      console.error("Error adding topic:", error);
    }
  };

  const handleEditTopic = async () => {
    const user = auth.currentUser;
    if (!user || !newTopic.trim()) return;

    try {
      const courseQuery = query(collection(db, "courses"), where("id", "==", courseId!));
      const courseSnapshot = await getDocs(courseQuery);
      const courseRef = doc(db, "courses", courseSnapshot.docs[0].id);
      const courseDoc = await getDoc(courseRef);
      if (courseDoc.exists()) {
        const courseData = courseDoc.data();
        const updatedTopics = courseData.topics.map((t: string) => t === editingTopic ? newTopic.trim() : t);

        await updateDoc(courseRef, {
          topics: updatedTopics
        });

        setTopics(updatedTopics);
        setNewTopic("");
        setIsAdding(false);
        setEditingTopic(null);
      }
    } catch (error) {
      console.error("Error editing topic:", error);
    }
  };

  const handleDeleteTopic = async (topic: string) => {
    try {
      const courseQuery = query(collection(db, "courses"), where("id", "==", courseId!));
      const courseSnapshot = await getDocs(courseQuery);
      const courseRef = doc(db, "courses", courseSnapshot.docs[0].id);
      const courseDoc = await getDoc(courseRef);
      if (courseDoc.exists()) {
        const courseData = courseDoc.data();
        const updatedTopics = courseData.topics.filter((t: string) => t !== topic);

        await updateDoc(courseRef, {
          topics: updatedTopics
        });

        setTopics(updatedTopics);
        if (selectedTopic === topic) {
          setSelectedTopic(null);
        }
      }
    } catch (error) {
      console.error("Error deleting topic:", error);
    }
  };

  const TabButton = ({ tab, label }: { tab: TabType; label: string }) => (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setActiveTab(tab)}
      className={`px-6 py-3 rounded-lg font-semibold transition-all ${
        activeTab === tab 
          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
          : 'text-gray-400 hover:text-white'
      }`}
    >
      {label}
    </motion.button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-2">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"
        />
      </div>

      <div className="flex gap-6 p-4 relative">
        {/* Topics Sidebar */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-1/4 bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700"
        >
          <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Topics
          </h2>
          <ul className="space-y-3">
            {topics.map((topic, index) => (
              <motion.li 
                key={index}
                variants={itemVariants}
                whileHover={{ x: 5 }}
                className={`bg-gray-700/50 p-3 rounded-lg cursor-pointer transition-colors
                  ${selectedTopic === topic ? 'ring-2 ring-blue-500' : 'hover:bg-gray-600/50'}`}
              >
                <div className="flex justify-between items-center">
                  <span 
                    className="flex-grow"
                    onClick={() => setSelectedTopic(topic)}
                  >
                    {topic}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingTopic(topic);
                        setNewTopic(topic);
                        setIsAdding(true);
                      }}
                      className="p-1 text-sm bg-blue-600/80 rounded hover:bg-blue-700/80"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTopic(topic)}
                      className="p-1 text-sm bg-red-600/80 rounded hover:bg-red-700/80"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700"
          >
            {/* Tabs */}
            <div className="flex gap-4 mb-6">
              <TabButton tab="learn" label="Learn" />
              <TabButton tab="practice" label="Practice" />
              <TabButton tab="quiz" label="Quiz" />
            </div>

            {/* Content */}
            <div className="h-[calc(100vh-12rem)]">
              {selectedTopic ? (
                <>
                  {activeTab === 'learn' && <LearningChat topic={selectedTopic} courseId={courseId!} />}
                  {activeTab === 'practice' && <ProblemChat topic={selectedTopic} courseId={courseId!} />}
                  {activeTab === 'quiz' && <QuizChat topic={selectedTopic} courseId={courseId!} />}
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  Select a topic to start {activeTab === 'learn' ? 'learning' : activeTab === 'practice' ? 'practicing' : 'taking quizzes'}...
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
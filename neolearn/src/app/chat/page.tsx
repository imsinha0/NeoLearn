"use client"

import { LearningChat } from '../../components/LearningChat';
import { ProblemChat } from '../../components/ProblemChat';
import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/firebase'; // Import your Firestore instance
import { collection, addDoc, deleteDoc, updateDoc, doc, getDocs, query, where, getDoc } from 'firebase/firestore';
import { useSearchParams } from 'next/navigation';



export default function ChatPage() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [topics, setTopics] = useState<string[]>([]);
  const [newTopic, setNewTopic] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingTopic, setEditingTopic] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId');

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
        const updatedTopics = courseData.topics.map(t => t === editingTopic ? newTopic.trim() : t);

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
            const updatedTopics = courseData.topics.filter(t => t !== topic);
    
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

  return (
    <div className="flex min-h-screen bg-gray-900 text-white p-2">
      <div className="w-1/4 p-4 border-r border-gray-700">
        <h2 className="text-2xl font-bold mb-4">Topics</h2>
        <ul className="space-y-2 mb-4">
          {topics.map((topic, index) => (
            <li 
              key={index} 
              className={`bg-gray-800 p-2 rounded shadow hover:bg-gray-700 ${
                selectedTopic === topic ? 'ring-2 ring-blue-600' : ''
              }`}
            >
              <div className="flex justify-between items-center">
                <span 
                  className="cursor-pointer flex-grow"
                  onClick={() => setSelectedTopic(topic)}
                >
                  {topic}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingTopic(topic);
                      setNewTopic(topic);
                      setIsAdding(true);
                    }}
                    className="px-2 py-1 text-sm bg-blue-600 rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTopic(topic)}
                    className="px-2 py-1 text-sm bg-red-600 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        
        {isAdding ? (
          <div className="space-y-2">
            <input
              type="text"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 rounded border border-gray-700 focus:outline-none focus:border-blue-600"
              placeholder="Enter topic name"
            />
            <div className="flex space-x-2">
              <button
                onClick={editingTopic ? handleEditTopic : handleAddTopic}
                className="px-3 py-2 bg-blue-600 rounded hover:bg-blue-700 flex-1"
              >
                {editingTopic ? 'Update' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewTopic("");
                  setEditingTopic(null);
                }}
                className="px-3 py-2 bg-gray-700 rounded hover:bg-gray-600 flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full px-3 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Add Topic
          </button>
        )}
      </div>
      <div className="w-1/2 p-4">
        <h2 className="text-2xl font-bold mb-4">Learn</h2>
        <div className="bg-gray-800 p-4 rounded shadow h-[calc(100vh-10rem)]">
          {selectedTopic ? (
            <LearningChat topic={selectedTopic!} courseId={courseId!} />
          ) : (
            <p className="text-gray-300">Select a topic to start learning...</p>
          )}
        </div>
      </div>
      <div className="w-1/4 p-4">
        <h2 className="text-2xl font-bold mb-4">Problems</h2>
        <div className="bg-gray-800 p-4 rounded shadow h-[calc(100vh-10rem)]">
          {selectedTopic ? (
            <ProblemChat topic={selectedTopic!} courseId={courseId!} />
          ) : (
            <p className="text-gray-300">Select a topic to get practice problems...</p>
          )}
        </div>
      </div>
    </div>
  );
}
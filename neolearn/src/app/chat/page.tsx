"use client"

import { LearningChat } from '../../components/LearningChat';
import { ProblemChat } from '../../components/ProblemChat';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/firebase'; // Import your Firestore instance
import { collection, addDoc, deleteDoc, updateDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { useSearchParams } from 'next/navigation';

interface Topic {
  id: string;
  name: string;
  userId: string;
}


export default function ChatPage() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [newTopic, setNewTopic] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "topics"), where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);
    const userTopics = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Topic));
    setTopics(userTopics);
  };

  const handleAddTopic = async () => {
    const user = auth.currentUser;
    if (!user || !newTopic.trim()) return;

    try {
      const docRef = await addDoc(collection(db, "topics"), {
        name: newTopic.trim(),
        userId: user.uid,
        createdAt: new Date()
      });

      setTopics([...topics, { id: docRef.id, name: newTopic.trim(), userId: user.uid }]);
      setNewTopic("");
      setIsAdding(false);
    } catch (error) {
      console.error("Error adding topic:", error);
    }
  };

  const handleEditTopic = async () => {
    if (!editingTopic || !newTopic.trim()) return;

    try {
      const topicRef = doc(db, "topics", editingTopic.id);
      await updateDoc(topicRef, {
        name: newTopic.trim()
      });

      setTopics(topics.map(topic => 
        topic.id === editingTopic.id 
          ? { ...topic, name: newTopic.trim() }
          : topic
      ));
      setNewTopic("");
      setEditingTopic(null);
    } catch (error) {
      console.error("Error updating topic:", error);
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    try {
      await deleteDoc(doc(db, "topics", topicId));
      setTopics(topics.filter(topic => topic.id !== topicId));
      if (selectedTopic === topics.find(t => t.id === topicId)?.name) {
        setSelectedTopic(null);
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
          {topics.map((topic) => (
            <li 
              key={topic.id} 
              className={`bg-gray-800 p-2 rounded shadow hover:bg-gray-700 ${
                selectedTopic === topic.name ? 'ring-2 ring-blue-600' : ''
              }`}
            >
              <div className="flex justify-between items-center">
                <span 
                  className="cursor-pointer flex-grow"
                  onClick={() => setSelectedTopic(topic.name)}
                >
                  {topic.name}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingTopic(topic);
                      setNewTopic(topic.name);
                      setIsAdding(true);
                    }}
                    className="px-2 py-1 text-sm bg-blue-600 rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTopic(topic.id)}
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
            <LearningChat topic={selectedTopic} />
          ) : (
            <p className="text-gray-300">Select a topic to start learning...</p>
          )}
        </div>
      </div>
      <div className="w-1/4 p-4">
        <h2 className="text-2xl font-bold mb-4">Problems</h2>
        <div className="bg-gray-800 p-4 rounded shadow h-[calc(100vh-10rem)]">
          {selectedTopic ? (
            <ProblemChat topic={selectedTopic} />
          ) : (
            <p className="text-gray-300">Select a topic to get practice problems...</p>
          )}
        </div>
      </div>
    </div>
  );
}
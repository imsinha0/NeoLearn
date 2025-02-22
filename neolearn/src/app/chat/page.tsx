"use client"

import { LearningChat } from '../../components/LearningChat';
import { ProblemChat } from '../../components/ProblemChat';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/firebase'; // Import your Firestore instance
import { collection, addDoc, deleteDoc, updateDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { useSearchParams } from 'next/navigation';


const words = [
  "React", "JavaScript", "TypeScript", "Firebase", "Next.js", 
  "CSS", "HTML", "Node.js", "GraphQL", "Redux"
];

export default function ChatPage() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen bg-gray-900 text-white p-6">
      <div className="w-1/4 p-4 border-r border-gray-700">
        <h2 className="text-2xl font-bold mb-4">Topics</h2>
        <ul className="space-y-2">
          {words.map((word, index) => (
            <li 
              key={index} 
              onClick={() => setSelectedTopic(word)}
              className={`bg-gray-800 p-2 rounded shadow cursor-pointer hover:bg-gray-700 ${
                selectedTopic === word ? 'ring-2 ring-blue-600' : ''
              }`}
            >
              {word}
            </li>
          ))}
        </ul>
      </div>
      <div className="w-1/2 p-4">
        <h2 className="text-2xl font-bold mb-4">Learn</h2>
        <div className="bg-gray-800 p-4 rounded shadow h-[calc(100vh-8rem)]">
          {selectedTopic ? (
            <LearningChat topic={selectedTopic} />
          ) : (
            <p className="text-gray-300">Select a topic to start learning...</p>
          )}
        </div>
      </div>
      <div className="w-1/4 p-4">
        <h2 className="text-2xl font-bold mb-4">Problems</h2>
        <div className="bg-gray-800 p-4 rounded shadow h-[calc(100vh-8rem)]">
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
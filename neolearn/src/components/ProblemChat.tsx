"use client"

import { useState, useEffect } from 'react';
import { auth, db } from '@/firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function ProblemChat({ topic, courseId }: { topic: string; courseId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadChatHistory = async () => {
      const user = auth.currentUser;
      if (!user) return;
  
      const q = query(
        collection(db, "courses"),
        where("id", "==", courseId)
      );
  
      const querySnapshot = await getDocs(q);
      const courseDoc = querySnapshot.docs[0];
      const courseData = courseDoc.data();
      const chatHistory = courseData.problemChat || [];
      setMessages(chatHistory);
    };

    loadChatHistory();
  }, [courseId]);

  const clearHistory = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const courseRef = collection(db, "courses");
    const q = query(courseRef, where("id", "==", courseId));

    const querySnapshot = await getDocs(q);
    const courseDoc = querySnapshot.docs[0];
    const courseData = courseDoc.data();
    courseData.problemChat = [];
    await deleteDoc(courseDoc.ref);
    await addDoc(courseRef, courseData);
    setMessages([]);
  };

  const saveMessage = async (message: Message) => {
    const user = auth.currentUser;
    if (!user) return;

    const courseRef = collection(db, "courses");
    const q = query(courseRef, where("id", "==", courseId));

    const querySnapshot = await getDocs(q);
    const courseDoc = querySnapshot.docs[0];
    const courseData = courseDoc.data();
    const chatHistory = courseData.problemChat || [];
    chatHistory.push(message);

    await deleteDoc(courseDoc.ref);
    await addDoc(courseRef, { ...courseData, problemChat: chatHistory });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { 
      role: 'user', 
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    await saveMessage(userMessage);
    setInput('');
    setIsLoading(true);

    try {
      const context = messages
        .map(m => `${m.role}: ${m.content}`)
        .join('\n');

      const response = await fetch('/api/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          topic,
          mode: 'problem',
          context
        }),
      });

      const data = await response.json();
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: data.response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      await saveMessage(assistantMessage);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between mb-4">
        <h3 className="text-xl font-bold">Practice: {topic}</h3>
        <button
          onClick={clearHistory}
          className="px-3 py-1 bg-red-600 rounded hover:bg-red-700"
        >
          Clear History
        </button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === 'user' ? 'bg-blue-600' : 'bg-gray-700'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 p-3 rounded-lg">
              Thinking...
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for practice problems..."
          className="flex-1 px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
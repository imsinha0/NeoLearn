"use client"

import { useState, useEffect } from 'react';
import { auth, db } from '@/firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const formatMessage = (content: string) => {
  return content.split('**').map((part, index) => {
    if (index % 2 === 1) { // This is inside ** **
      const words = part.split(' ');
      const firstWord = words[0];
      const restOfContent = words.slice(1).join(' ');
      return (
        <div key={index} className="mt-2">
          <span className="font-bold">{firstWord}</span>
          {restOfContent && ' ' + restOfContent}
        </div>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

export function LearningChat({ topic, courseId }: { topic: string; courseId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const quickActions = [
    { label: "Teach me", prompt: `Teach me about ${topic}` },
    { label: "Give me an example", prompt: `Give me an example about ${topic}` },
    { label: "Explain again", prompt: `Explain ${topic} again in a different way` }
  ];

  useEffect(() => {
    const loadChatHistory = async () => {
      const user = auth.currentUser;
      if (!user) return;
  
      const q = query(
        collection(db, "courses"),
        where("id", "==", courseId),
      );
  
      const querySnapshot = await getDocs(q);
      const courseDoc = querySnapshot.docs[0];
      const courseData = courseDoc.data();
      const chatHistory = courseData.learningChat || [];
      setMessages(chatHistory);
    };

    loadChatHistory();
  }, [courseId]);

  const clearHistory = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const courseRef = collection(db, "courses");
    const q = query(
      courseRef,
      where("id", "==", courseId)
    );

    const querySnapshot = await getDocs(q);
    const courseDoc = querySnapshot.docs[0];
    const courseData = courseDoc.data();
    courseData.learningChat = [];
    await deleteDoc(courseDoc.ref);
    await addDoc(courseRef, courseData);
    setMessages([]);
  };

  const saveMessage = async (message: Message) => {
    const user = auth.currentUser;
    if (!user) return;

    const courseRef = collection(db, "courses");
    const q = query(
      courseRef,
      where("id", "==", courseId)
    );

    const querySnapshot = await getDocs(q);
    const courseDoc = querySnapshot.docs[0];
    const courseData = courseDoc.data();
    const chatHistory = courseData.learningChat || [];
    chatHistory.push(message);

    await deleteDoc(courseDoc.ref);
    await addDoc(courseRef, { ...courseData, learningChat: chatHistory });

    }
  ;

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
      // Create context from previous messages
      const context = messages
        .map(m => `${m.role}: ${m.content}`)
        .join('\n');

      const response = await fetch('/api/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          topic,
          mode: 'learn',
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

  const handleQuickAction = async (prompt: string) => {
    const userMessage: Message = { 
      role: 'user', 
      content: prompt,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    await saveMessage(userMessage);
    setIsLoading(true);

    try {
      const context = messages
        .map(m => `${m.role}: ${m.content}`)
        .join('\n');

      const response = await fetch('/api/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          topic,
          mode: 'learn',
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
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">{topic}</h3>
        <div className="flex space-x-2">
          {quickActions.map(({ label, prompt }) => (
            <button
              key={label}
              onClick={() => handleQuickAction(prompt)}
              disabled={isLoading}
              className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {label}
            </button>
          ))}
          <button
            onClick={clearHistory}
            className="px-3 py-1 bg-red-600 rounded hover:bg-red-700"
          >
            Clear History
          </button>
        </div>
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
              {formatMessage(message.content)}
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
          placeholder="Ask to learn about this topic..."
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
"use client"

import { useState, useEffect } from 'react';
import { auth, db } from '@/firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import Script from 'next/script';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Add MathJax script and config
const MathJaxScript = () => (
  <>
    <Script src="https://polyfill.io/v3/polyfill.min.js?features=es6" strategy="beforeInteractive" />
    <Script id="MathJax-script" src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js" strategy="beforeInteractive" />
  </>
);

const formatMessage = (content: string) => {
  // Split by code blocks first
  const parts = content.split('```');
  
  return parts.map((part, index) => {
    // Even indices are normal text, odd indices are code blocks
    if (index % 2 === 1) {
      // This is a code block
      return (
        <pre key={index} className="bg-gray-900 p-3 rounded-lg mt-2 overflow-x-auto">
          <code className="text-sm font-mono text-gray-200">
            {part.trim()}
          </code>
        </pre>
      );
    }

    // Handle normal text with ** markers and other formatting
    return part.split('**').map((subPart, subIndex) => {
      if (subIndex % 2 === 1) { // This is inside ** **
        const words = subPart.split(' ');
        const firstWord = words[0];
        const restOfContent = words.slice(1).join(' ');
        return (
          <div key={`${index}-${subIndex}`} className="mt-2">
            <span className="font-bold">{firstWord}</span>
            {restOfContent && ' ' + restOfContent}
          </div>
        );
      }

      // Handle HTML tags
      if (subPart.includes('<') && subPart.includes('>')) {
        return (
          <div key={`${index}-${subIndex}`} 
            className="mt-2 p-2 bg-gray-800 rounded"
            dangerouslySetInnerHTML={{ __html: subPart }}
          />
        );
      }

      // Handle LaTeX (assuming it's wrapped in $$ $$)
      if (subPart.includes('$$')) {
        const latexParts = subPart.split('$$');
        return latexParts.map((latex, latexIndex) => {
          if (latexIndex % 2 === 1) { // This is LaTeX
            return (
              <div key={`${index}-${subIndex}-${latexIndex}`} 
                className="px-2 py-1 my-2 bg-gray-800 rounded overflow-x-auto"
              >
                {`\\[${latex.trim()}\\]`}
              </div>
            );
          }
          return <span key={`${index}-${subIndex}-${latexIndex}`}>{latex}</span>;
        });
      }

      return <span key={`${index}-${subIndex}`}>{subPart}</span>;
    });
  });
};

export function ProblemChat({ topic, courseId }: { topic: string; courseId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [lastMessageTime, setLastMessageTime] = useState<Date | null>(null);

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

  // Update cooldown timer
  useEffect(() => {
    if (!lastMessageTime || cooldown <= 0) return;

    const timer = setInterval(() => {
      const secondsLeft = Math.max(
        0,
        60 - Math.floor((new Date().getTime() - lastMessageTime.getTime()) / 1000)
      );
      setCooldown(secondsLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [lastMessageTime, cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || cooldown > 0) return;

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
      
      // Start cooldown after receiving response
      setLastMessageTime(new Date());
      setCooldown(60);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFullAnswer = async () => {
    const prompt = `Please provide the complete solution and explanation for the current problem about ${topic}`;
    
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
      <MathJaxScript />
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Practice: {topic}</h3>
        <div className="flex space-x-2">
          <button
            onClick={handleFullAnswer}
            disabled={isLoading || messages.length === 0}
            className="px-3 py-1 bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
          >
            Give Full Answer
          </button>
          <button
            onClick={clearHistory}
            className="px-3 py-1 bg-red-600 rounded hover:bg-red-700"
          >
            Clear History
          </button>
        </div>
      </div>

      {/* Add cooldown indicator */}
      {cooldown > 0 && (
        <div className="mb-4 text-center py-2 bg-gray-800 rounded">
          Next problem available in {cooldown} seconds
        </div>
      )}

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
          placeholder={cooldown > 0 ? `Wait ${cooldown}s for next problem...` : "Ask for practice problems..."}
          disabled={cooldown > 0 || isLoading}
          className="flex-1 px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || cooldown > 0}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
import React from 'react';

const words = [
  "React", "JavaScript", "TypeScript", "Firebase", "Next.js", 
  "CSS", "HTML", "Node.js", "GraphQL", "Redux"
];

export default function ChatPage() {
  return (
    <div className="flex min-h-screen bg-gray-900 text-white p-6">
      <div className="w-1/4 p-4 border-r border-gray-700">
        <h2 className="text-2xl font-bold mb-4">Words</h2>
        <ul className="space-y-2">
          {words.map((word, index) => (
            <li key={index} className="bg-gray-800 p-2 rounded shadow">{word}</li>
          ))}
        </ul>
      </div>
      <div className="w-1/2 p-4">
        <h2 className="text-2xl font-bold mb-4">Learn</h2>
        <div className="bg-gray-800 p-4 rounded shadow h-96 overflow-auto">
          {/* Chat interface for learning */}
          <p className="text-gray-300">Chat interface for learning goes here...</p>
        </div>
      </div>
      <div className="w-1/4 p-4">
        <h2 className="text-2xl font-bold mb-4">Problems</h2>
        <div className="bg-gray-800 p-4 rounded shadow h-96 overflow-auto">
          {/* Chat interface for problems */}
          <p className="text-gray-300">Chat interface for problems goes here...</p>
        </div>
      </div>
    </div>
  );
}

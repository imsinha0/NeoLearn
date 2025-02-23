"use client"

import { useState } from 'react';
import { model } from '@/firebase';
import { motion } from 'framer-motion';

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  userAnswer?: string;
}

export function QuizChat({ topic }: { topic: string; courseId: string }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const generateQuiz = async () => {
    setIsLoading(true);
    setShowResults(false);
    setQuestions([]);

    try {
      const prompt = `Generate a quiz about ${topic} with exactly 5 multiple choice questions. For each question, provide 4 options and indicate the correct answer. Format your response exactly like this example:
      Question 1: What is the capital of France?
      A) London
      B) Berlin
      C) Paris
      D) Madrid
      Correct: C

      Question 2: What is 2+2?
      A) 3
      B) 4
      C) 5
      D) 6
      Correct: B`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      // Parse the text response into questions
      const questionBlocks = text.split('\n\n');
      const parsedQuestions: Question[] = questionBlocks
        .filter(block => block.trim().startsWith('Question'))
        .map(block => {
          const lines = block.split('\n');
          const question = lines[0].split(': ')[1];
          
          // Extract options without the A), B), C), D) prefixes
          const options = lines.slice(1, 5).map(line => {
            // Remove the letter prefix and any whitespace
            return line.replace(/^[A-D]\)\s*/, '').trim();
          });
          
          // Get the correct answer index (A=0, B=1, etc.)
          const correctAnswerLetter = lines[5].split(': ')[1].trim();
          const correctAnswerIndex = correctAnswerLetter.charCodeAt(0) - 65;
          const correctAnswer = options[correctAnswerIndex];
          
          return {
            question,
            options,
            correctAnswer
          };
        });

      setQuestions(parsedQuestions);
    } catch (error) {
      console.error("Error generating quiz:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (questionIndex: number, answer: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      userAnswer: answer
    };
    setQuestions(updatedQuestions);
  };

  const submitQuiz = () => {
    const correctAnswers = questions.filter(
      q => q.userAnswer === q.correctAnswer
    ).length;
    setScore(correctAnswers);
    setShowResults(true);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex justify-between items-center">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={generateQuiz}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Generate Quiz
        </motion.button>
      </div>

      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {!isLoading && questions.length > 0 && (
        <div className="flex-1 overflow-y-auto space-y-6">
          {questions.map((question, qIndex) => (
            <motion.div
              key={qIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: qIndex * 0.1 }}
              className="bg-gray-800/50 p-4 rounded-lg"
            >
              <p className="font-semibold mb-3">{qIndex + 1}. {question.question}</p>
              <div className="space-y-2">
                {question.options.map((option, oIndex) => (
                  <button
                    key={oIndex}
                    onClick={() => handleAnswer(qIndex, option)}
                    className={`w-full text-left p-2 rounded transition-colors ${
                      question.userAnswer === option
                        ? 'bg-blue-600'
                        : 'bg-gray-700 hover:bg-gray-600'
                    } ${
                      showResults
                        ? option === question.correctAnswer
                          ? 'bg-green-600'
                          : question.userAnswer === option
                          ? 'bg-red-600'
                          : ''
                        : ''
                    }`}
                    disabled={showResults}
                  >
                    
                    {option}
                  </button>
                ))}
              </div>
            </motion.div>
          ))}

          {!showResults && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={submitQuiz}
              className="w-full py-3 bg-green-600 rounded hover:bg-green-700 mb-4"
            >
              Submit Quiz
            </motion.button>
          )}

          {showResults && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-800/50 p-4 rounded-lg text-center"
            >
              <p className="text-xl font-bold mb-2">Your Score: {score}/5</p>
              <button
                onClick={generateQuiz}
                className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
              >
                Try Another Quiz
              </button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
} 
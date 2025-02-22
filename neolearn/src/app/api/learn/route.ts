import { model } from '@/firebase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { message, topic, mode, context } = await request.json();

    // Create prompt based on mode and include context
    const prompt = mode === 'learn' 
      ? `You are a teacher. Previous conversation:\n${context}\n\nExplain ${topic} concepts related to: ${message}`
      : `You are a teacher. Previous conversation:\n${context}\n\nCreate or solve problems about ${topic} related to: ${message}. For solving problems, don't give the whole answer just give hints to maximise learning.`

    // Generate response using Firebase's Vertex AI model
    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }]
    });

    // Add null check for candidates
    if (!result.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from AI model');
    }

    const response = result.response.candidates[0].content.parts[0].text;

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Learn API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process learning request' },
      { status: 500 }
    );
  }
}


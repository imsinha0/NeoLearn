import { model } from '@/firebase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { message, topic, mode } = await request.json();

    // Create prompt based on mode
    const prompt = mode === 'learn' 
      ? `You are a programming tutor. Explain ${topic} concepts related to: ${message}`
      : `You are a programming tutor. Create a practice problem about ${topic} related to: ${message}. Include a problem description, example inputs/outputs, and hints if needed.`;

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


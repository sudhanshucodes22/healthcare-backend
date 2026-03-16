import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config/env.js';

let genAI = null;
let model = null;

const initializeGemini = () => {
    if (!config.geminiApiKey) {
        console.warn('⚠️  Gemini API key not configured. AI features will use fallback responses.');
        return false;
    }

    try {
        genAI = new GoogleGenerativeAI(config.geminiApiKey);
        model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
        console.log('✅ Gemini AI initialized successfully.');
        return true;
    } catch (error) {
        console.error('❌ Error initializing Gemini:', error);
        return false;
    }
};

const isInitialized = initializeGemini();

export const analyzeDiseaseSymptoms = async (symptoms) => {
    if (!isInitialized || !model) {
        // Fallback response when API key is not configured
        return {
            prediction: `Based on your symptoms: ${symptoms}\n\nThis is a fallback response. To get AI-powered predictions, please configure your Gemini API key.\n\nGeneral recommendations:\n✓ Monitor your symptoms\n✓ Stay hydrated\n✓ Get adequate rest\n✓ Consult a healthcare professional if symptoms persist or worsen`,
            severity: 'unknown',
        };
    }

    try {
        const prompt = `You are a friendly and professional human medical AI assistant. A patient reports the following symptoms: "${symptoms}". 

Please provide the information naturally, conversing in a mix of English, Hindi, and Hinglish (like how a real Indian doctor or friend might speak, e.g., "Aapko shayad viral ho sakta hai...").

1. Possible conditions (list 2-4 most likely conditions)
2. Severity assessment (mild, moderate, or severe)
3. Recommendations for care
4. When to seek immediate medical attention

Format your response clearly with bullet points. Remember to keep the tone empathetic, human-like, and clearly state this is informational only and not a diagnosis.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract severity from response
        let severity = 'moderate';
        if (text.toLowerCase().includes('severe') || text.toLowerCase().includes('emergency')) {
            severity = 'severe';
        } else if (text.toLowerCase().includes('mild')) {
            severity = 'mild';
        }

        return {
            prediction: text,
            severity,
        };
    } catch (error) {
        console.error('Error calling Gemini API:', JSON.stringify(error, null, 2));
        console.error('Error details:', error.message);
        if (error.response) {
            console.error('API Response Error:', await error.response.text());
        }
        throw new Error('Failed to analyze symptoms. Please try again.');
    }
};

export const generateMentalHealthResponse = async (message, chatHistory = []) => {
    if (!isInitialized || !model) {
        // Fallback response
        return `Thank you for sharing. I'm here to listen and support you. To enable AI-powered mental health support, please configure your Gemini API key.\n\nIn the meantime, remember:\n• Your feelings are valid\n• It's okay to ask for help\n• Take things one day at a time\n• Consider reaching out to a mental health professional`;
    }

    try {
        const historyContext = chatHistory.length > 0
            ? `Previous conversation:\n${chatHistory.map(h => `User: ${h.message}\nAssistant: ${h.response}`).join('\n')}\n\n`
            : '';

        const prompt = `You are a compassionate, human-like mental health support friend. Your role is to provide emotional support, encouragement, and positive guidance. You must be empathetic, non-judgmental, and supportive.

Crucially, you should converse naturally in a mix of English, Hindi, and Hinglish, just like a supportive human friend in India would speak (e.g., "Koi baat nahi, take it easy", "I understand how you're feeling aesa hota hai").

${historyContext}Current message from user: "${message}"

Provide a supportive, empathetic response in conversational English/Hindi/Hinglish. Keep it warm and friendly. If the user seems to be in crisis, gently suggest professional help. Do not provide medical diagnoses.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Error calling Gemini API (Mental Health):', JSON.stringify(error, null, 2));
        console.error('Error details:', error.message);
        throw new Error('Failed to generate response. Please try again.');
    }
};

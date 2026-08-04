import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory room cache & AI helper
let aiClient: GoogleGenAI | null = null;
function getAIClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      aiClient = new GoogleGenAI({ apiKey: key });
    }
  }
  return aiClient;
}

// Health Check API
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// AI Co-Host Chat & Reaction Endpoint
app.post('/api/ai/cohost-comment', async (req, res) => {
  try {
    const { roomTitle, userAction, userName, giftName, userText } = req.body;
    const ai = getAIClient();

    if (!ai) {
      // Fallback friendly Bengali response if no key
      return res.json({
        comment: `স্বাগতম ${userName}! Hapi Voice Room এ আপনাকে অনেক শুভেচ্ছা ❤️`,
      });
    }

    const prompt = `You are "Aira AI", an energetic, joyful, and charming Bengali & English co-host bot in a popular live voice chat party room named "${roomTitle || 'Hapi Voice Adda'}".
Your job is to entertain room listeners, thank users for sending gifts, welcome new joiners, and keep the party atmosphere exciting!
Context:
- User: ${userName || 'Friend'}
- Action/Event: ${userAction || 'Chatting'}
- Gift (if any): ${giftName || 'None'}
- User Message: ${userText || ''}

Write a short, fun 1-2 sentence co-host announcement in a friendly mix of Bengali (Banglish or Bangla) and English. Use emojis! Example: "Wow Shiyam Boss! 🏎️ Bugatti Supercar পাঠানোর জন্য অনেক অনেক ধন্যবাদ! You are truly the king of this room! 👑"
Keep it strictly under 180 characters.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text ? response.text.trim() : `স্বাগতম ${userName}! Enjoy the voice adda! ✨`;
    res.json({ comment: text });
  } catch (err) {
    console.error('AI Co-host error:', err);
    res.json({
      comment: `ধন্যবাদ ${req.body?.userName || 'বন্ধু'}! Hapi Voice Room এ জয়েন করার জন্য ✨`,
    });
  }
});

// AI Room Trivia / Topic Generator Endpoint
app.post('/api/ai/topic-generator', async (req, res) => {
  try {
    const { category } = req.body;
    const ai = getAIClient();

    if (!ai) {
      return res.json({
        topic: 'আজকের সেরা টপিক: আপনার জীবনের সবচেয়ে মজার ভ্রমণ অভিজ্ঞতা কোনটি? 🚗✈️',
      });
    }

    const prompt = `Generate 1 exciting party question or topic for a live group voice chat room of category "${category || 'General Adda'}".
Make it interactive, fun for Bengali youth & audio listeners, in Bengali with English words. Add emojis. Max 25 words.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.json({ topic: response.text?.trim() || 'আজকের টপিক: আপনার প্রিয় গান কোনটি? 🎧' });
  } catch (err) {
    res.json({ topic: 'আজকের মজার আড্ডা: আপনার প্রিয় খাবার ও প্রিয় জায়গা নিয়ে বলুন! 🍔✈️' });
  }
});

// Vite / Production Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Hapi Voice Chat Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

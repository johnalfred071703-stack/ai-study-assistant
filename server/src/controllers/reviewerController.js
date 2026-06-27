require('dotenv').config();
const Groq = require('groq-sdk');
const ReviewerCache = require('../models/ReviewerCache');

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are an AI Study Assistant that creates reviewers from documents.
Rules:
1. Base everything strictly on the provided document content.
2. Do NOT add information not present in the document.
3. Preserve original terminology exactly as written.
4. Always respond in valid JSON format only — no markdown, no explanation.`;

const generateReviewer = async (req, res) => {
  const { text, mode, documentId } = req.body;

  if (!text || !mode) return res.status(400).json({ error: 'Missing text or mode' });

  if (documentId) {
    try {
      const cached = await ReviewerCache.findOne({ documentId, mode });
      if (cached) {
        console.log(`Cache hit: ${mode} for doc ${documentId}`);
        return res.json(cached.data);
      }
    } catch (err) {
      console.error('Cache lookup error:', err.message);
    }
  }

  const truncatedText = text.slice(0, 3000);

  const prompts = {
    summary: `Create a summary reviewer from this document. Return JSON:
{"sections": [{"heading": "string", "body": "string"}]}
Document: ${truncatedText}`,

    flashcards: `Create flashcards from this document. Return JSON:
{"cards": [{"q": "string", "a": "string"}]}
Generate 10 cards.
Document: ${truncatedText}`,

    quiz: `Create a quiz from this document. Return JSON:
{"questions": [{"question": "string", "choices": ["a","b","c","d"], "answer": 0}]}
Generate 10 multiple choice questions. answer is the index of the correct choice.
Document: ${truncatedText}`,

    exam: `Create a mixed practice exam from this document. Return JSON:
{"sections": [{"type": "MCQ", "items": [{"question": "string", "choices": ["a","b","c","d"], "answer": "string"}]}]}
Document: ${truncatedText}`,

    recall: `Create active recall questions from this document. Return JSON:
{"questions": [{"question": "string"}]}
Generate 10 questions. No answers.
Document: ${truncatedText}`,

    blanks: `Create fill-in-the-blank sentences from this document. Return JSON:
{"items": [{"sentence": "string with _____ for the blank", "answer": "string"}]}
Generate 10 items.
Document: ${truncatedText}`,
  };

  const prompt = prompts[mode];
  if (!prompt) return res.status(400).json({ error: 'Invalid mode' });

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const tryGenerate = async (retries = 3) => {
    try {
      const completion = await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 2000,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
      });
      return completion.choices[0].message.content;
    } catch (err) {
      if (err.status === 429 && retries > 0) {
        const waitTime = Math.min((err.headers?.['retry-after'] || 30) * 1000, 60000);
        console.log(`Rate limited. Waiting ${waitTime / 1000}s...`);
        await sleep(waitTime);
        return tryGenerate(retries - 1);
      }
      throw err;
    }
  };

  try {
    const raw = await tryGenerate();
    const parsed = JSON.parse(raw);

    if (documentId) {
      try {
        await ReviewerCache.findOneAndUpdate(
          { documentId, mode },
          { data: parsed },
          { upsert: true, new: true }
        );
        console.log(`Cache saved: ${mode} for doc ${documentId}`);
      } catch (err) {
        console.error('Cache save error:', err.message);
      }
    }

    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate reviewer' });
  }
};

module.exports = { generateReviewer };
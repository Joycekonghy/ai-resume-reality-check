import { NextApiRequest, NextApiResponse } from 'next';
import Groq from 'groq-sdk';
import multer from 'multer';
import pdfParse from 'pdf-parse';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const upload = multer({ storage: multer.memoryStorage() });

export const config = {
  api: {
    bodyParser: false,
  },
};

const runMiddleware = (req: any, res: any, fn: any) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('API called with method:', req.method);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Running multer middleware...');
    await runMiddleware(req, res, upload.single('resume'));
    
    const file = (req as any).file;
    const mode = (req as any).body.mode || 'savage';
    const industry = (req as any).body.industry || 'tech';
    const personaMode = (req as any).body.personaMode || 'realistic';
    
    console.log('File received:', !!file);
    console.log('Mode:', mode, 'Industry:', industry, 'Persona:', personaMode);
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Extract text from PDF
    let resumeText = '';
    try {
      if (file.mimetype === 'application/pdf') {
        console.log('Parsing PDF...');
        const pdfData = await pdfParse(file.buffer);
        resumeText = pdfData.text;
      } else {
        resumeText = file.buffer.toString('utf-8');
      }
      console.log('Resume text length:', resumeText.length);
    } catch (parseError) {
      console.error('Parse error:', parseError);
      return res.status(400).json({ error: 'Failed to parse file' });
    }

    if (!process.env.GROQ_API_KEY) {
      console.error('No Groq API key found');
      return res.status(500).json({ error: 'Groq API key not configured' });
    }

    // Generate roast based on mode
    const roastPrompts = {
      savage: "Roast this resume brutally but constructively. Use phrases like 'Bro your skills section is giving please pick me energy 😭' and 'These bullet points haven't seen action since 2014 💀'. Be savage but helpful.",
      genz: "Roast this resume in Gen-Z slang. Use terms like 'no cap', 'fr fr', 'this ain't it chief', 'giving main character energy but make it unemployed'. Be chaotic but helpful with crying laughing emojis.",
      gentle: "Give gentle, comedic feedback on this resume. Be kind but point out issues with humor and gentle teasing."
    };

    console.log('Calling Groq...');
    
    // Generate roast
    const roastResponse = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{
        role: "user",
        content: `${roastPrompts[mode as keyof typeof roastPrompts]}\n\nResume:\n${resumeText.substring(0, 2000)}`
      }],
      max_tokens: 500,
      temperature: 0.7
    });

    // Generate bias filters
    const biasResponse = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{
        role: "user",
        content: `Analyze this resume through 8 different hiring manager personas. Give each a brief, punchy perception in 1-2 sentences:

        1. 🤔 The Skeptic - thinks everything is exaggerated
        2. 🚀 The Visionary - loves creativity but hates fluff  
        3. 📋 The Traditionalist - cares about format and order
        4. 😵 The Overwhelmed Recruiter - skims and misses details
        5. 📊 The Data-Driven Engineer - wants numbers and metrics
        6. 👔 The CEO-Type Manager - only cares about impact
        7. 🚩 The Red-Flag Hunter - looks for problems
        8. 🔥 The Hype Beast - interprets everything as awesome

        Format as: "Persona Name: Brief perception"
        
        Resume: ${resumeText.substring(0, 1500)}`
      }],
      max_tokens: 800,
      temperature: 0.6
    });

    // Generate first impression
    const impressionResponse = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{
        role: "user",
        content: `Simulate a hiring manager's first impression of this resume:
        
        Give me:
        1. 3-second scan impression (what jumps out immediately in one sentence)
        2. 7-second scan impression (slightly deeper look in one sentence)
        
        Format as:
        3-Second: [impression]
        7-Second: [impression]
        
        Resume: ${resumeText.substring(0, 1500)}`
      }],
      max_tokens: 400,
      temperature: 0.5
    });

    // Generate industry view
    const industryResponse = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{
        role: "user",
        content: `Analyze how this resume would be perceived in the ${industry} industry. Give a brief assessment of how the candidate appears to ${industry} hiring managers in 1-2 sentences.
        
        Resume: ${resumeText.substring(0, 1500)}`
      }],
      max_tokens: 200,
      temperature: 0.6
    });

    // Generate persona analysis
    const personaResponse = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{
        role: "user",
        content: `Analyze this resume in ${personaMode} mode:
        
        - Realistic Mode: What hiring managers ACTUALLY see (unfiltered truth)
        - Idealized Mode: What the resume looks like when strengths shine brightest
        - Shadow Mode: What weaknesses the resume is accidentally signaling
        - Evil Mode: How traits can be misinterpreted by a negative reviewer
        
        Give a 2-3 sentence analysis for ${personaMode} mode.
        
        Resume: ${resumeText.substring(0, 1500)}`
      }],
      max_tokens: 300,
      temperature: 0.7
    });

    // Parse responses
    const biasText = biasResponse.choices[0]?.message?.content || "";
    const biasFilters = biasText.split('\n').filter(line => line.includes(':')).map(line => {
      const [persona, perception] = line.split(':');
      return { persona: persona.trim(), perception: perception.trim() };
    }).slice(0, 8);

    const impressionText = impressionResponse.choices[0]?.message?.content || "";
    const impressionLines = impressionText.split('\n');
    const threeSecond = impressionLines.find(line => line.includes('3-Second'))?.replace('3-Second:', '').trim() || "Quick scan shows organized layout but generic content.";
    const sevenSecond = impressionLines.find(line => line.includes('7-Second'))?.replace('7-Second:', '').trim() || "Deeper look reveals solid experience but lacks standout achievements.";

    const analysis = {
      roast: roastResponse.choices[0]?.message?.content || "Your resume needs work!",
      biasFilters,
      firstImpression: {
        threeSecond,
        sevenSecond
      },
      industryView: industryResponse.choices[0]?.message?.content || `In ${industry}: needs industry-specific optimization`,
      personaAnalysis: personaResponse.choices[0]?.message?.content || `${personaMode} analysis: Your resume shows potential but needs refinement.`
    };

    console.log('Sending response...');
    res.status(200).json(analysis);
  } catch (error) {
    console.error('API Error:', error);
  }
}

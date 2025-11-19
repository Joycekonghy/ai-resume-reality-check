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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await runMiddleware(req, res, upload.single('resume'));
    
    const file = (req as any).file;
    const industry = (req as any).body.industry || 'tech';
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Extract text from PDF
    let resumeText = '';
    if (file.mimetype === 'application/pdf') {
      const pdfData = await pdfParse(file.buffer);
      resumeText = pdfData.text;
    } else {
      resumeText = file.buffer.toString('utf-8');
    }

    // Generate ATS-optimized version
    const atsResponse = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{
        role: "user",
        content: `Rewrite this resume to be ATS-friendly with proper keywords and formatting. Focus on:
        - Clear section headers
        - Keyword optimization
        - Quantified achievements
        - Standard formatting
        
        Original Resume: ${resumeText.substring(0, 2000)}`
      }],
      max_tokens: 800,
      temperature: 0.3
    });

    // Generate modern design version
    const modernResponse = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{
        role: "user",
        content: `Rewrite this resume with modern, engaging language that stands out. Focus on:
        - Action-oriented language
        - Impact-focused statements
        - Modern terminology
        - Compelling narrative
        
        Original Resume: ${resumeText.substring(0, 2000)}`
      }],
      max_tokens: 800,
      temperature: 0.5
    });

    // Generate industry-specific version
    const industryResponse = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{
        role: "user",
        content: `Rewrite this resume specifically for the ${industry} industry. Focus on:
        - Industry-specific terminology
        - Relevant skills and technologies
        - ${industry} market expectations
        - Role-appropriate language
        
        Original Resume: ${resumeText.substring(0, 2000)}`
      }],
      max_tokens: 800,
      temperature: 0.4
    });

    const rebuiltResume = {
      atsVersion: atsResponse.choices[0]?.message?.content || "ATS-optimized version coming soon...",
      modernVersion: modernResponse.choices[0]?.message?.content || "Modern design version coming soon...",
      industryVersion: industryResponse.choices[0]?.message?.content || `${industry}-specific version coming soon...`
    };

    res.status(200).json(rebuiltResume);
  } catch (error) {
    console.error('Rebuild error:', error);
    res.status(500).json({ error: 'Resume rebuild failed' });
  }
}

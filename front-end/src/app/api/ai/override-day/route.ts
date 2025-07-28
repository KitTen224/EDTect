import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { topic, region, prefecture, dayNumber } = await request.json();

    if (!topic || !region || !dayNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const prompt = `
You are a JSON API. Return only valid JSON.

Create a 1-day itinerary in ${region} (${prefecture || region}) focused on the theme "${topic}".

Return this exact structure:
{
  "activities": [
    {
      "id": "day${dayNumber}-activity1",
      "title": "Activity Title",
      "time": "09:00",
      "duration": 90,
      "cost": 1500,
      "type": "experience",
      "icon": "🎨",
      "location": "Specific Place",
      "description": "Explain clearly what and where this is"
    }
  ]
}

Rules:
- Focus on theme: ${topic}
- Use real locations from ${region}
- Include breakfast (07:00-09:00), lunch (12:00-14:00), dinner (19:00-21:00) if relevant
- Add address context in location (e.g. 'Ninenzaka, Kyoto')
- Use Japanese cultural details
- Include hotel/accommodation (22:00-06:00) for each day with check-in time
- RETURN ONLY JSON, no explanation, no markdown
`;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const rawText = await result.response.text();
    const cleaned = rawText.replace(/```(json)?/g, '').trim();

    try {
      const parsed = JSON.parse(cleaned);
      return NextResponse.json(parsed);
    } catch (err) {
      return NextResponse.json({ error: 'Failed to parse AI output', raw: cleaned }, { status: 500 });
    }
  } catch (err) {
    return NextResponse.json({ error: 'Internal error', details: err instanceof Error ? err.message : err }, { status: 500 });
  }
}

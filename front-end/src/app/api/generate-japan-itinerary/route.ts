import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');


export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Japan itinerary API called');
    const body = await request.json();
    console.log('📝 Request body:', JSON.stringify(body, null, 2));
    
    const { regions, totalDuration, travelStyles, season } = body;

    if (!regions || !Array.isArray(regions) || regions.length === 0 || !totalDuration) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: regions and totalDuration' },
        { status: 400 }
      );
    }

    console.log('✅ Request validation passed');

    // Build Japan-specific context for multiple regions
    const regionsContext = regions.map((regionWithDays: { region: { name: string; nameJapanese: string; description: string; prefecture?: string[] }; days: number }) => `
REGION: ${regionWithDays.region.name} (${regionWithDays.region.nameJapanese})
Duration: ${regionWithDays.days} day${regionWithDays.days !== 1 ? 's' : ''}
Description: ${regionWithDays.region.description}
Major Prefectures: ${regionWithDays.region.prefecture?.join(', ') || 'Not specified'}
`).join('\n');

    const styleContext = travelStyles && travelStyles.length > 0 ? `
TRAVEL STYLES: ${travelStyles.map((style: any) => `${style.name} (${style.nameJapanese})`).join(', ')}
Style Focus: ${travelStyles.map((style: any) => style.description).join(', ')}
` : '';

    const seasonContext = season ? `
SEASON: ${season.name} (${season.nameJapanese})
Season Description: ${season.description}
Seasonal Highlights: ${season.highlights.join(', ')}
` : '';

    const regionNames = regions.map((rwd: { region: { name: string } }) => rwd.region.name).join(' and ');
    
    const prompt = `You are a JSON API. Return ONLY valid JSON, no other text.

Create ${totalDuration}-day Japan itinerary for: ${regionNames}

${regionsContext}${styleContext}${seasonContext}

Return this exact JSON structure:

{
  "days": [
    {
      "dayNumber": 1,
      "region": "Tokyo",
      "activities": [
        {
          "id": "day1-activity1",
          "title": "Senso-ji Temple Visit",
          "time": "09:00",
          "duration": 120,
          "cost": 500,
          "type": "attraction",
          "icon": "⛩️",
          "location": "Asakusa",
          "description": "Visit Tokyo's oldest temple (645 AD). Explore Nakamise-dori shopping street, see the giant red lantern, try fortune telling. Best visited early to avoid crowds."
        },
        {
          "id": "day1-activity2", 
          "title": "Sushi Breakfast",
          "time": "11:00",
          "duration": 60,
          "cost": 2000,
          "type": "meal",
          "icon": "🍣",
          "location": "Tsukiji",
          "description": "Fresh sushi at famous Tsukiji Outer Market. Try tuna, sea urchin, and seasonal fish. Authentic Tokyo breakfast experience."
        }
      ]
    }
  ]
}

Rules:
- ${totalDuration} days total
- 6-8 activities per day 
- Use these EXACT time slots: 06:00, 07:00, 08:00, 09:00, 10:00, 11:00, 12:00, 13:00, 14:00, 15:00, 16:00, 17:00, 18:00, 19:00, 20:00, 21:00, 22:00, 23:00
- Types: attraction, meal, experience
- Include breakfast (07:00-09:00), lunch (12:00-14:00), dinner (19:00-21:00)
- NO admin tasks (tickets, hotel check-in)
- Rich descriptions with cultural context

RETURN ONLY JSON - NO MARKDOWN BACKTICKS, NO EXPLANATIONS!`;

    // Check if Gemini API key is available
    if (!process.env.GEMINI_API_KEY) {
      console.log('⚠️ GEMINI_API_KEY not found in environment variables');
      return NextResponse.json(
        { 
          error: 'AI service configuration error. Gemini API key is not configured.',
          details: 'Please ensure GEMINI_API_KEY is set in environment variables'
        },
        { status: 500 }
      );
    } else {
      console.log('✅ GEMINI_API_KEY found, length:', process.env.GEMINI_API_KEY.length);
    }

    // Generate content using Gemini
    console.log('🤖 Calling Gemini API...');
    
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      console.log('📝 Prompt length:', prompt.length, 'characters');
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('✅ Gemini API success, generated', text.length, 'characters');
      return NextResponse.json({ 
        itinerary: text,
        prompt: prompt 
      });
      
    } catch (geminiError: unknown) {
      const errorMessage = geminiError instanceof Error ? geminiError.message : 'Unknown error';
      console.log('❌ Gemini API failed:', errorMessage);
      
      // Return error to user instead of fallback
      return NextResponse.json(
        { 
          error: 'Failed to generate Japan itinerary using AI. Please try again later.',
          details: `Gemini API Error: ${errorMessage}`
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error generating Japan itinerary:', error);
    return NextResponse.json(
      { 
        error: 'Unable to process your Japan travel request. Please check your request and try again.',
        details: error instanceof Error ? error.message : 'Unknown server error'
      },
      { status: 500 }
    );
  }
}
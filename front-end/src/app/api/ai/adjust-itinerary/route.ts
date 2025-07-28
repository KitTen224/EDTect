import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { regions, totalDuration, travelStyles, season, overrideRequest } = body;

    if (!regions || !totalDuration) {
      return NextResponse.json(
        { error: 'Missing required fields: regions and totalDuration' },
        { status: 400 }
      );
    }
    //rules
    let activityCountRule = '';
    let paceRule = '';
    let budgetRule = ''; 
    let foodFocusRule = '';
    if (overrideRequest) {
      if (overrideRequest.includes('観光を減らし') || overrideRequest.includes('ゆったり滞在')) {
        activityCountRule = '- Limit daily activities to 2-3 main attractions/experiences. Focus on quality over quantity.';
        paceRule = '- Ensure a relaxed pace with ample free time and longer durations for each activity.';
      }
      if (overrideRequest.includes('経済的') || overrideRequest.includes('旅費を抑え')) { // Kiểm tra từ khóa cho chi phí thấp
        budgetRule = '- Propose more economical attractions, restaurants (e.g., local eateries, ramen shops), and budget-friendly accommodation options. Aim for lower "cost" values for all activities.';
      }
      if (overrideRequest.includes('高級') || overrideRequest.includes('贅沢')) { // Kiểm tra từ khóa cho chi phí cao
        budgetRule = '- Propose premium attractions, high-end restaurants, and luxury accommodation options. Aim for higher "cost" values for all activities.';
      }
      if (overrideRequest.includes('食べ歩きをメイン') || overrideRequest.includes('グルメ') || overrideRequest.includes('B級グルメ')) {
        foodFocusRule = '- Emphasize local cuisine, street food, and unique dining experiences. Include more "meal" type activities and suggest places known for their food culture. Keep attractions nearby dining spots.';
      }
    }

    const regionNames = regions.map((r: any) => r.region.name).join(' and ');

    const regionsContext = regions.map((r: any) => `
REGION: ${r.region.name} (${r.region.nameJapanese})
Duration: ${r.days} days
Description: ${r.region.description}
Major Prefectures: ${(r.region.prefecture || []).join(', ') || 'Not specified'}
`).join('\n');

    const styleContext = travelStyles?.length > 0 ? `
TRAVEL STYLES: ${travelStyles.map((s: any) => `${s.name} (${s.nameJapanese})`).join(', ')}
Style Focus: ${travelStyles.map((s: any) => s.description).join(', ')}
` : '';

    const seasonContext = season ? `
SEASON: ${season.name} (${season.nameJapanese})
Season Description: ${season.description}
Seasonal Highlights: ${season.highlights?.join(', ') || ''}
` : '';

    const prompt = `You are a JSON API. Return ONLY valid JSON, no other text.

User already has a Japan travel plan for ${totalDuration} days across these regions: ${regionNames}.
Now the user wants to adjust this plan with the following request:
"${overrideRequest || 'No specific request'}"

Please recreate the entire itinerary from scratch, but take the user's request into account.

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
          "startTime": "09:00",
          "duration": 120,
          "cost": 500,
          "type": "attraction",
          "icon": "⛩️",
          "location": "Asakusa",
          "description": "Visit Tokyo's oldest temple..."
        },
        {
          "id": "day1-activity2",
          "title": "Sushi Breakfast",
          "startTime": "07:30",
          "duration": 60,
          "cost": 1500,
          "type": "meal",
          "icon": "🍣",
          "location": "Tsukiji",
          "description": "Breakfast in traditional fish market..."
        },
        {
          "id": "day1-activity8",
          "title": "Shinjuku Hotel Stay",
          "startTime": "22:00",
          "duration": 480,
          "cost": 10000,
          "type": "accommodation",
          "icon": "🏨",
          "location": "Shinjuku",
          "description": "Modern hotel stay in downtown Shinjuku..."
        }
      ]
    }
  ]
}

Rules:
- ${totalDuration} days total
- Use real locations from ${regionNames}
- Use these EXACT time slots: 06:00, 07:00, 08:00, 09:00, 10:00, 11:00, 12:00, 13:00, 14:00, 15:00, 16:00, 17:00, 18:00, 19:00, 20:00, 21:00, 22:00, 23:00
- Include breakfast (07:00-09:00), lunch (12:00-14:00), dinner (19:00-21:00)
- Every activity must include a field "startTime" (e.g. "14:00").
- Every activity's "cost" field must be a **pure integer number**, without any currency symbols or commas. For example, 500, not "¥500" or "500 JPY".
- Include hotel/accommodation (22:00-06:00) for each day with check-in time.
- Activities should cover essential daily needs (meals, rest, leisure) unless the user request indicates otherwise.
- Types are flexible but must fit the travel style and request (e.g., onsen, hiking, food-focused, relaxing).
- Hotels should be well-located, authentic Japanese or international options.
- Include hotel amenities, location benefits, and cultural context.
- NO admin tasks (tickets, booking confirmations).
- Rich descriptions with cultural context.
- Ensure "icon" fields are valid single emoji characters.
${activityCountRule}  
${paceRule}           
${budgetRule}
${foodFocusRule}
RETURN ONLY JSON - NO MARKDOWN BACKTICKS, NO EXPLANATIONS!`;

    try {
      // Đổi model sang bản stable hơn hoặc bản Pro để tuân thủ tốt hơn nếu cần
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
      console.log('📝 Prompt length:', prompt.length, 'characters');
      console.log('📝 Generated Prompt:\n', prompt); // Log toàn bộ prompt để kiểm tra

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const rawText = response.text();

      const cleanedText = rawText.replace(/```json|```/g, '').trim(); // Regex chặt chẽ hơn
      console.log("👉 Cleaned Gemini output:", cleanedText);

      let parsed;
      try {
        parsed = JSON.parse(cleanedText);
        console.log("👉 Parsed Gemini output (JSON):", JSON.stringify(parsed, null, 2)); // Log JSON đã parse
      } catch (e: any) {
        console.error("❌ Failed to parse JSON from Gemini:", e.message);
        console.error("❌ Raw Gemini output that failed to parse:\n", rawText); // Log raw output để debug
        throw new Error("Gemini output is not valid JSON. Check format.");
      }

      // 💡 Thêm kiểm tra cấu trúc cơ bản của output Gemini
      if (!parsed || !Array.isArray(parsed.days)) {
        throw new Error("Gemini output 'days' array is missing or invalid.");
      }

      console.log("👉 Fetching Laravel API with days data...");

      // Gửi dữ liệu đã parse (đảm bảo nó là JSON hợp lệ) đến Laravel
      await fetch('http://localhost:8000/api/ai/save-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 1, // Thay bằng user_id thực tế nếu có
          title: `AI Japan Itinerary (${new Date().toLocaleDateString()})`,
          description: "Generated from AI",
          days: parsed.days, // Gửi dữ liệu 'days' đã parse
        })
      });

      return NextResponse.json({
        itinerary: cleanedText, // Gửi về cleanedText để client parse lại
        prompt: prompt
      });

    } catch (geminiError: unknown) {
      const errorMessage = geminiError instanceof Error ? geminiError.message : 'Unknown error';
      console.log('❌ Gemini API failed:', errorMessage);

      return NextResponse.json(
        {
          error: 'Failed to generate Japan itinerary using AI. Please try again later.',
          details: `Gemini API Error: ${errorMessage}`
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error processing Japan travel request:', error);
    return NextResponse.json(
      {
        error: 'Unable to process your Japan travel request. Please check your request and try again.',
        details: error instanceof Error ? error.message : 'Unknown server error'
      },
      { status: 500 }
    );
  }
}
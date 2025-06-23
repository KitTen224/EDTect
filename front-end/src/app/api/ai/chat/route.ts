import { NextRequest, NextResponse } from 'next/server';

interface ChatRequest {
    message: string;
    context?: {
        currentPlan?: any;
        preferences?: any;
    };
}

interface ChatResponse {
    reply: string;
    plan?: any;
    suggestions?: string[];
}

export async function POST(request: NextRequest) {
    try {
        const body: ChatRequest = await request.json();
        const { message, context } = body;

        // Mock AI processing - replace with real AI service later
        const response = await processAIMessage(message, context);

        return NextResponse.json(response);
    } catch (error) {
        console.error('Chat AI error:', error);
        return NextResponse.json(
            { error: 'AIチャットでエラーが発生しました' },
            { status: 500 }
        );
    }
}

async function processAIMessage(message: string, context?: any): Promise<ChatResponse> {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const lowerMessage = message.toLowerCase();

    // Simple keyword-based responses for demo
    if (lowerMessage.includes('地域') || lowerMessage.includes('場所')) {
        return {
            reply: '他の地域をご提案しますね。現在のプランを基に、関西地方（京都・大阪・奈良）や九州地方（福岡・長崎・熊本）はいかがでしょうか？文化的な体験や美食を楽しめます。',
            suggestions: ['関西地方のプランを作って', '九州地方を提案して', '北海道はどうですか？']
        };
    }

    if (lowerMessage.includes('予算') || lowerMessage.includes('価格')) {
        return {
            reply: '予算に関するご相談ですね。現在の予算に応じて、より豪華な宿泊施設や特別な体験を追加したプレミアムプラン、または費用を抑えたエコノミープランをご提案できます。',
            suggestions: ['予算を上げてプレミアムプランを', '費用を抑えたプランを作って', '中級クラスのプランを提案して']
        };
    }

    if (lowerMessage.includes('温泉') || lowerMessage.includes('お風呂')) {
        return {
            reply: '温泉がお好みですね！箱根、熱海、草津、有馬温泉など、日本の名湯を巡るプランをご提案します。温泉旅館での宿泊と地元の美食もお楽しみいただけます。',
            plan: {
                theme: 'onsen',
                locations: ['箱根', '熱海', '草津'],
                duration: 4
            }
        };
    }

    if (lowerMessage.includes('食べ物') || lowerMessage.includes('料理') || lowerMessage.includes('グルメ')) {
        return {
            reply: 'グルメ旅行がお好みですね！築地市場、道頓堀、博多の屋台など、日本各地の名物料理を味わう美食ツアーをご提案します。',
            suggestions: ['東京のグルメプランを', '大阪の食べ歩きプランを', '地方の郷土料理プランを']
        };
    }

    if (lowerMessage.includes('変更') || lowerMessage.includes('修正')) {
        return {
            reply: 'プランの変更についてお手伝いします。具体的にどの部分を変更されたいでしょうか？日程、場所、宿泊施設、アクティビティなど、お気軽にお申し付けください。',
            suggestions: ['1日目の予定を変更して', '宿泊施設を変えて', '観光地を追加して']
        };
    }

    if (lowerMessage.includes('のんびり') || lowerMessage.includes('ゆっくり')) {
        return {
            reply: 'ゆったりとしたスケジュールをお望みですね。移動時間を短縮し、各地での滞在時間を長めに取った、のんびりプランをご提案します。',
            plan: {
                pace: 'relaxed',
                activitiesPerDay: 2,
                restTime: 'extended'
            }
        };
    }

    // Default response
    return {
        reply: 'ご質問ありがとうございます。お客様のご要望についてもう少し詳しく教えていただけますでしょうか？より具体的なアドバイスをさせていただきます。',
        suggestions: [
            '観光地について教えて',
            '宿泊施設を変更したい', 
            '予算を調整したい',
            'スケジュールを変更したい'
        ]
    };
}

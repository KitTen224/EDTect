import { NextRequest, NextResponse } from 'next/server';
import { getRecentLogsFromLaravel, saveLogToLaravel } from '@/lib/chat/history';
import { findSimilarMessage } from '@/lib/chat/message_matcher';
import { ruleBasedResponse } from '@/lib/chat/rules';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, context } = body;
    const userId = 1; // sau này truyền động

    await saveLogToLaravel(userId, message);

    const history = await getRecentLogsFromLaravel(userId);
    const similar = findSimilarMessage(message, history);

    if (similar?.response_text) {
      return NextResponse.json({
        reply: similar.response_text,
        reused: true
      });
    }

    const ruleResult = await ruleBasedResponse(message, context);
    await saveLogToLaravel(userId, message, ruleResult.reply);

    return NextResponse.json(ruleResult);

  } catch (error) {
    console.error('Chat AI error:', error);
    return NextResponse.json(
      { error: 'AIチャットでエラーが発生しました' },
      { status: 500 }
    );
  }
}

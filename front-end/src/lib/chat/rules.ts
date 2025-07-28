import { regenerateTimelineWithOverride } from '@/utils/adjustFullItinerary';
import { applySingleDayOverrideToTimeline } from '@/utils/timelineOverrides';
import { fetchRealActivitiesByAI } from '@/utils/timelineOverrides';

export async function ruleBasedResponse(message: string, context?: any) {
  const lower = message.toLowerCase();
  const currentPlan = context?.currentPlan;

  // のんびりプラン（ゆったり）
  
  if (lower.includes('観光少なめ') || lower.includes('少なめの観光') || lower.includes('のんびり') || lower.includes('ゆっくり')) {
        if (!currentPlan) {
            return { reply: '現在のプランが見つかりませんでした。' };
        }

        try {
            // Log input data to regenerateTimelineWithOverride
            console.log('📝 Calling regenerateTimelineWithOverride with currentPlan:', currentPlan);

            const newTimeline = await regenerateTimelineWithOverride({
                regions: currentPlan.regions,
                totalDuration: currentPlan.totalDuration,
                travelStyles: currentPlan.travelStyles,
                season: currentPlan.season,
                interests: currentPlan.interests || [],
                overrideRequest: '観光を減らし、ゆったり滞在できる内容に'
            });

            console.log('✅ Successfully regenerated timeline for "観光少なめ":', newTimeline);

            return {
                reply: '観光地を少なくした新しいプランを作成しました。',
                plan: {
                    timeline: newTimeline // TRẢ VỀ TOÀN BỘ newTimeline Ở ĐÂY
                }
            };
        } catch (error) {
            console.error('❌ Error regenerating plan for "観光少なめ":', error);
            // Cải thiện thông báo lỗi cho người dùng
            return {
                reply: `プランの再作成に失敗しました。詳細: ${error instanceof Error ? error.message : '不明なエラー'}. もう一度お試しください。`
            };
        }
    }
  // 予算
  if (lower.includes('予算を下げて') || lower.includes('安くして')) {
    if (!currentPlan) {
        return { reply: '現在のプランが見つかりませんでした。' };
    }

    try {
        const newTimeline = await regenerateTimelineWithOverride({
            regions: currentPlan.regions,
            totalDuration: currentPlan.totalDuration,
            travelStyles: currentPlan.travelStyles,
            season: currentPlan.season,
            interests: currentPlan.interests || [],
            overrideRequest: '全体的な旅費を抑え、より経済的なアクティビティや宿泊施設を提案してください。' // Yêu cầu cụ thể hơn
        });

        return {
            reply: '予算を抑えた新しいプランを作成しました。',
            plan: {
                timeline: newTimeline
            }
        };
    } catch (error) {
        console.error('❌ Error regenerating low-budget plan:', error);
        return {
            reply: `予算調整プランの再作成に失敗しました。詳細: ${error instanceof Error ? error.message : '不明なエラー'}. もう一度お試しください。`
        };
    }
  }

  // "高級プラン" (premium)
  if (lower.includes('高級プラン') || lower.includes('贅沢な旅に')) {
    if (!currentPlan) {
        return { reply: '現在のプランが見つかりませんでした。' };
    }

    try {
        const newTimeline = await regenerateTimelineWithOverride({
            regions: currentPlan.regions,
            totalDuration: currentPlan.totalDuration,
            travelStyles: currentPlan.travelStyles,
            season: currentPlan.season,
            interests: currentPlan.interests || [],
            overrideRequest: '全体的な旅費を上げ、より高級な体験や宿泊施設を提案してください。'
        });

        return {
            reply: '高級な新しいプランを作成しました。',
            plan: {
                timeline: newTimeline
            }
        };
    } catch (error) {
        console.error('❌ Error regenerating premium plan:', error);
        return {
            reply: `高級プランの再作成に失敗しました。詳細: ${error instanceof Error ? error.message : '不明なエラー'}. もう一度お試しください。`
        };
    }
  }
  //食べ歩きメイン/グルメ
  if (lower.includes('食べ歩きメイン') || lower.includes('グルメ') || lower.includes('食べ歩き')) {
        if (!currentPlan) {
            return { reply: '現在のプランが見つかりませんでした。' };
        }

        try {
            const newTimeline = await regenerateTimelineWithOverride({
                regions: currentPlan.regions,
                totalDuration: currentPlan.totalDuration,
                travelStyles: currentPlan.travelStyles,
                season: currentPlan.season,
                interests: currentPlan.interests || [],
                // Yêu cầu cụ thể cho Gemini: tập trung vào ẩm thực, các món ăn đường phố, nhà hàng địa phương
                overrideRequest: '食べ歩きをメインとし、各地のB級グルメや名物料理、地元の人気店を巡るプランを提案してください。食事の回数を増やし、観光地は食事の近くに限定してください。'
            });

            return {
                reply: '食べ歩きメインの新しいプランを作成しました。',
                plan: {
                    timeline: newTimeline
                }
            };
        } catch (error) {
            console.error('❌ Error regenerating food-focused plan:', error);
            return {
                reply: `食べ歩きプランの再作成に失敗しました。詳細: ${error instanceof Error ? error.message : '不明なエラー'}. もう一度お試しください。`
            };
        }
  }
  //単一日変更: 〇日目 主題変更
  const match = message.match(/(\d{1,2})日目/);
  const dayNumber = match ? parseInt(match[1], 10) : null;

  if (dayNumber && currentPlan) {
    const regionName = currentPlan.days[dayNumber - 1]?.region?.name || 'Kyoto';
    const prefecture = currentPlan.days[dayNumber - 1]?.region?.prefecture?.[0];

    const topicMap: Record<string, string> = {
      '自然': '自然体験',
      '温泉': '温泉',
      'グルメ': 'グルメ',
      '食べ歩き': 'グルメ',
      '文化': '文化体験',
      '体験': '文化体験',
      'ショッピング': 'ショッピング',
      '買い物': 'ショッピング'
    };

    for (const key in topicMap) {
      if (message.includes(key)) {
        const topic = topicMap[key];
        const activities = await fetchRealActivitiesByAI(dayNumber, topic, regionName, prefecture);
        const newTimeline = applySingleDayOverrideToTimeline({
          modifiedDay: dayNumber,
          overrideActivities: activities
        }, currentPlan);

        return {
          reply: `${dayNumber}日目を${topic}に変更しました。`,
          plan: { timeline: newTimeline }
        };
      }
    }
  }

  // 4. 地域変更
  if (lower.includes('地域変更') || lower.includes('場所変更')) {
    return {
      reply: '他の地域をご提案しますね。ページのフッターに「Start Over」をクリックしたらできます。',
      suggestions: ['']
    };
  }

  // Default fallback
  return {
    reply: 'もう少し詳しく教えていただけますか？',
    suggestions: ['観光地について教えて', '予算を調整したい', 'のんびりしたプランが欲しい']
  };
}

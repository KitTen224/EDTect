import { JapanTimeline, TimelineActivity } from '@/types/travel';

export interface DayOverride {
  modifiedDay: number;
  overrideActivities: TimelineActivity[];
}

// ⚙️ Hàm thay đổi hoạt động của 1 ngày cụ thể
export function applySingleDayOverrideToTimeline(
  override: DayOverride,
  originalTimeline: JapanTimeline
): JapanTimeline {
  if (!originalTimeline || !originalTimeline.days) return originalTimeline;

  // console.log('[DEBUG] available dayNumbers:', originalTimeline.days.map(d => d.dayNumber));
  const updatedDays = originalTimeline.days.map((day) => {
    if (day.dayNumber === override.modifiedDay) {
      return {
        ...day,
        activities: override.overrideActivities,
        totalCost: override.overrideActivities.reduce((sum, act) => sum + (act.estimatedCost || 0), 0)
      };
    }
    return day;
  });

  return {
    ...originalTimeline,
    days: updatedDays
  };
}
//gọi api gemini
export async function fetchRealActivitiesByAI(day: number, topic: string, region: string, prefecture?: string): Promise<TimelineActivity[]> {
  const response = await fetch('http://localhost:3000/api/ai/override-day', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic,
      region,
      prefecture,
      dayNumber: day
    })
  });

  const data = await response.json();

  if (!data.activities || !Array.isArray(data.activities)) {
    throw new Error('Invalid AI response: no activities returned');
  }

  return data.activities.map((a: any) => ({
    id: a.id,
    name: a.title,
    description: a.description,
    startTime: a.time,
    duration: a.duration,
    type: a.type,
    icon: a.icon,
    estimatedCost: a.cost,
    location: a.location
  }));
}


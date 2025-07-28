import { JapanTimeline } from '@/types/travel';

export function applyPacingToTimeline(
  originalTimeline: JapanTimeline,
  pacing: {
    activitiesPerDay?: number;
    restTime?: string;
    pace?: string;
  }
): JapanTimeline {
  if (!originalTimeline || !originalTimeline.days) return originalTimeline;

  const { activitiesPerDay } = pacing;

  const adjustedDays = originalTimeline.days.map((day) => {
    const trimmedActivities =
      activitiesPerDay && day.activities.length > activitiesPerDay
        ? day.activities.slice(0, activitiesPerDay)
        : day.activities;

    return {
      ...day,
      activities: trimmedActivities,
      totalCost: trimmedActivities.reduce((sum, act) => sum + (act.estimatedCost || 0), 0),
    };
  });

  return {
    ...originalTimeline,
    days: adjustedDays,
  };
  
}

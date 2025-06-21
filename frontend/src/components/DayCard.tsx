'use client';

import React from 'react';
import { useDrop } from 'react-dnd';
import { motion } from 'framer-motion';
import { TimelineDay, TimelineActivity } from '@/types/travel';
import ActivityCard from './ActivityCard';

interface DayCardProps {
    day: TimelineDay;
    dayIndex: number;
    onMoveActivity: (activityId: string, fromDayIndex: number, toDayIndex: number, newTimeSlot?: string) => void;
    onUpdateActivity: (dayIndex: number, activityId: string, updates: Partial<TimelineActivity>) => void;
    onShowActivityDetails?: (activity: TimelineActivity) => void;
}

// Extracted TimeSlotDropZone component to prevent re-creation on renders
interface TimeSlotDropZoneProps {
    timeSlot: string;
    activity: TimelineActivity | undefined;
    dayIndex: number;
    isPeakTime: boolean;
    onMoveActivity: (activityId: string, fromDayIndex: number, toDayIndex: number, newTimeSlot?: string) => void;
    onUpdateActivity: (dayIndex: number, activityId: string, updates: Partial<TimelineActivity>) => void;
    onShowActivityDetails?: (activity: TimelineActivity) => void;
    isTimeSlotAvailable: (time: string, draggingActivityId?: string) => boolean;
    canActivityFitInTimeSlot: (duration: number, timeSlot: string) => boolean;
}

function TimeSlotDropZone({
    timeSlot,
    activity,
    dayIndex,
    isPeakTime,
    onMoveActivity,
    onUpdateActivity,
    onShowActivityDetails,
    isTimeSlotAvailable,
    canActivityFitInTimeSlot
}: TimeSlotDropZoneProps) {
    const [{ isOverSlot, canDrop }, dropSlot] = useDrop(() => ({
        accept: 'activity',
        drop: (item: { id: string; fromDayIndex: number; duration: number; name: string }) => {
            console.log('🎯 DROP EVENT FIRED!', {
                item,
                timeSlot,
                dayIndex,
                targetSlot: timeSlot
            });
            // Handle both same-day and cross-day moves with specific time slot
            onMoveActivity(item.id, item.fromDayIndex, dayIndex, timeSlot);
        },
        canDrop: (item: { id: string; fromDayIndex: number; duration: number; name: string }) => {
            const canDropResult = isTimeSlotAvailable(timeSlot, item.id) && 
                                  canActivityFitInTimeSlot(item.duration, timeSlot);
            console.log('🔍 CAN DROP CHECK:', {
                item: item.name,
                timeSlot,
                available: isTimeSlotAvailable(timeSlot, item.id),
                fitsInTime: canActivityFitInTimeSlot(item.duration, timeSlot),
                canDrop: canDropResult
            });
            return canDropResult;
        },
        collect: (monitor) => ({
            isOverSlot: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    }));

    return (
        <div ref={dropSlot as any} className="w-full h-full">
            {activity ? (
                <div className="w-full max-w-full overflow-hidden">
                    <ActivityCard
                        activity={activity}
                        dayIndex={dayIndex}
                        onUpdate={(updates) => onUpdateActivity(dayIndex, activity.id, updates)}
                        onShowDetails={onShowActivityDetails}
                    />
                </div>
            ) : (
                <motion.div 
                    className={`w-full h-12 rounded-lg border-2 border-dashed transition-all flex items-center justify-center ${
                        isOverSlot && canDrop
                            ? 'border-green-400 bg-green-50 shadow-lg' 
                            : isOverSlot && !canDrop
                            ? 'border-red-400 bg-red-50'
                            : isPeakTime 
                            ? 'border-gray-200 group-hover:border-gray-300 group-hover:bg-gray-50' 
                            : 'border-gray-100 group-hover:border-gray-200'
                    }`}
                    whileHover={{ scale: isOverSlot ? 1.02 : 1.01 }}
                    animate={{
                        scale: isOverSlot && canDrop ? 1.05 : 1,
                        boxShadow: isOverSlot && canDrop ? "0 8px 25px rgba(34, 197, 94, 0.3)" : "none"
                    }}
                >
                    <div className={`text-center transition-opacity ${
                        isOverSlot 
                            ? 'opacity-100' 
                            : 'opacity-0 group-hover:opacity-100'
                    }`}>
                        {isOverSlot && canDrop ? (
                            <div className="flex items-center space-x-1 text-green-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-xs font-medium">Drop here at {timeSlot}</span>
                            </div>
                        ) : isOverSlot && !canDrop ? (
                            <div className="flex items-center space-x-1 text-red-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span className="text-xs font-medium">Cannot drop here</span>
                            </div>
                        ) : (
                            <span className="text-xs text-gray-400">Drop activity here</span>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
}

export default function DayCard({ day, dayIndex, onMoveActivity, onUpdateActivity, onShowActivityDetails }: DayCardProps) {
    // Generate dynamic time slots that include both fixed hourly slots AND actual activity times
    const generateTimeSlots = () => {
        const fixedSlots: string[] = [];
        // Generate standard hourly slots (6 AM to 11 PM)
        for (let hour = 6; hour <= 23; hour++) {
            fixedSlots.push(`${hour.toString().padStart(2, '0')}:00`);
        }
        
        // Get all unique activity times from the day
        const activityTimes = day.activities.map(activity => activity.startTime);
        
        // Combine fixed slots with activity times and remove duplicates
        const allTimes = [...new Set([...fixedSlots, ...activityTimes])];
        
        // Sort chronologically
        return allTimes.sort((a, b) => {
            const [aHour, aMin] = a.split(':').map(Number);
            const [bHour, bMin] = b.split(':').map(Number);
            return (aHour * 60 + aMin) - (bHour * 60 + bMin);
        });
    };

    const timeSlots = generateTimeSlots();
    
    console.log('🕐 DayCard Debug - Day', day.dayNumber, ':', {
        totalActivities: day.activities.length,
        activityTimes: day.activities.map(a => `${a.startTime}: ${a.name}`),
        generatedTimeSlots: timeSlots.length,
        timeSlots: timeSlots
    });

    const getActivityAtTime = (time: string) => {
        return day.activities.find(activity => activity.startTime === time);
    };

    // Find orphaned activities - activities that don't have matching time slots
    const getOrphanedActivities = () => {
        return day.activities.filter(activity => !timeSlots.includes(activity.startTime));
    };

    const orphanedActivities = getOrphanedActivities();
    
    if (orphanedActivities.length > 0) {
        console.log('🚨 Orphaned Activities Found for Day', day.dayNumber, ':', orphanedActivities.map(a => `${a.startTime}: ${a.name}`));
    }

    // Helper function to check if a time slot is available for dropping
    const isTimeSlotAvailable = (time: string, draggingActivityId?: string) => {
        const existingActivity = getActivityAtTime(time);
        // Available if empty, or if it's the same activity being dragged
        return !existingActivity || existingActivity.id === draggingActivityId;
    };

    // Helper function to validate if activity can fit in time slot
    const canActivityFitInTimeSlot = (activityDuration: number, timeSlot: string) => {
        const hour = parseInt(timeSlot.split(':')[0]);
        const slotMinutes = hour * 60;
        const endMinutes = slotMinutes + activityDuration;
        const endHour = Math.floor(endMinutes / 60);
        
        // Check if activity ends before day ends (23:59)
        return endHour < 24;
    };


    return (
        <motion.div
            className="bg-white rounded-xl shadow-sm border-2 border-gray-200 transition-all duration-200"
            whileHover={{ scale: 1.005 }}
        >
            {/* Full Width Day Header */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                            <span className="text-xl font-semibold text-red-600">{day.dayNumber}</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800">
                                Day {day.dayNumber}
                            </h3>
                            <p className="text-sm text-gray-500 flex items-center space-x-2">
                                <span className="text-lg">{day.region.icon}</span>
                                <span className="font-medium">{day.region.name}</span>
                                <span className="text-gray-400">•</span>
                                <span>{day.region.nameJapanese}</span>
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-8">
                        {/* Activity Summary */}
                        <div className="text-center">
                            <div className="text-2xl font-semibold text-gray-800">{day.activities.length}</div>
                            <div className="text-xs text-gray-500">Activities</div>
                        </div>
                        
                        {/* Cost Summary */}
                        <div className="text-center">
                            <div className="text-2xl font-semibold text-green-600">¥{Math.round(day.totalCost/1000)}K</div>
                            <div className="text-xs text-gray-500">Daily Cost</div>
                        </div>
                        
                        {/* Activity Type Indicators */}
                        <div className="flex items-center space-x-2">
                            {['attraction', 'meal', 'transport', 'accommodation', 'experience'].map((type) => {
                                const count = day.activities.filter(activity => activity.type === type).length;
                                const colors = {
                                    attraction: 'bg-blue-500',
                                    meal: 'bg-orange-500',
                                    transport: 'bg-gray-500',
                                    accommodation: 'bg-purple-500',
                                    experience: 'bg-green-500'
                                };
                                
                                return count > 0 ? (
                                    <div key={type} className="relative group">
                                        <div className={`w-3 h-3 rounded-full ${colors[type as keyof typeof colors]}`} />
                                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            {count} {type}
                                        </div>
                                    </div>
                                ) : null;
                            })}
                            {day.activities.length === 0 && (
                                <div className="text-sm text-gray-400">No activities scheduled</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Responsive Activity Layout */}
            <div className="p-6">
                {/* Activity List - Responsive Layout */}
                <div className="space-y-3">
                    {timeSlots.map((timeSlot) => {
                        const activity = getActivityAtTime(timeSlot);
                        const hour = parseInt(timeSlot.split(':')[0]);
                        const isPeakTime = hour >= 9 && hour <= 17;
                        
                        return (
                            <div key={timeSlot} className="group">
                                {/* Mobile/Tablet Layout - Stack vertically */}
                                <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                                    {/* Time Label */}
                                    <div className={`w-full md:w-16 text-sm font-mono text-left md:text-right flex-shrink-0 ${
                                        isPeakTime ? 'text-gray-700 font-medium' : 'text-gray-400'
                                    }`}>
                                        {timeSlot}
                                    </div>
                                    
                                    {/* Timeline Connector - Hidden on mobile */}
                                    <div className="hidden md:flex flex-col items-center flex-shrink-0">
                                        <div className={`w-3 h-3 rounded-full border-2 border-white ${
                                            activity 
                                                ? 'bg-red-500' 
                                                : isPeakTime 
                                                ? 'bg-gray-300' 
                                                : 'bg-gray-200'
                                        }`} />
                                        {timeSlot !== timeSlots[timeSlots.length - 1] && (
                                            <div className="w-px h-8 bg-gray-200 mt-1" />
                                        )}
                                    </div>
                                    
                                    {/* Activity Slot with Individual Drop Zone */}
                                    <div className="flex-1 min-h-[60px] flex items-center w-full max-w-full overflow-hidden">
                                        <TimeSlotDropZone 
                                            timeSlot={timeSlot}
                                            activity={activity}
                                            dayIndex={dayIndex}
                                            isPeakTime={isPeakTime}
                                            onMoveActivity={onMoveActivity}
                                            onUpdateActivity={onUpdateActivity}
                                            onShowActivityDetails={onShowActivityDetails}
                                            isTimeSlotAvailable={isTimeSlotAvailable}
                                            canActivityFitInTimeSlot={canActivityFitInTimeSlot}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Orphaned Activities Fallback Display */}
                {orphanedActivities.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-orange-200 bg-orange-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                            <span className="text-orange-600">⚠️</span>
                            <h4 className="text-sm font-medium text-orange-700">
                                Additional Activities ({orphanedActivities.length})
                            </h4>
                        </div>
                        <p className="text-xs text-orange-600 mb-3">
                            These activities have non-standard times and are displayed separately:
                        </p>
                        <div className="space-y-2">
                            {orphanedActivities.map((activity) => (
                                <div key={activity.id} className="bg-white rounded-lg p-3 border border-orange-200">
                                    <ActivityCard
                                        activity={activity}
                                        dayIndex={dayIndex}
                                        onUpdate={(updates) => onUpdateActivity(dayIndex, activity.id, updates)}
                                        onShowDetails={onShowActivityDetails}
                                    />
                                    <div className="mt-2 text-xs text-orange-600">
                                        🕐 Original time: {activity.startTime}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Add Activity Section */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                    <button className="w-full py-3 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center space-x-2 border-2 border-dashed border-gray-300 hover:border-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span className="font-medium">Add New Activity</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
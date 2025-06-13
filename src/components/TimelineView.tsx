'use client';

import React, { useState, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { motion } from 'framer-motion';
import { JapanTimeline, TimelineActivity } from '@/types/travel';
import DayCard from './DayCard';
import ActivityDetailModal from './ActivityDetailModal';

interface TimelineViewProps {
    timeline: JapanTimeline;
    onTimelineUpdate?: (updatedTimeline: JapanTimeline) => void;
}

export default function TimelineView({ timeline, onTimelineUpdate }: TimelineViewProps) {
    const [currentTimeline, setCurrentTimeline] = useState<JapanTimeline>(timeline);
    const [selectedActivity, setSelectedActivity] = useState<TimelineActivity | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const moveActivity = useCallback((
        activityId: string,
        fromDayIndex: number,
        toDayIndex: number,
        newTimeSlot?: string
    ) => {
        const updatedDays = [...currentTimeline.days];
        
        // Find and remove the activity from the source day
        const sourceDay = updatedDays[fromDayIndex];
        const activityIndex = sourceDay.activities.findIndex(activity => activity.id === activityId);
        
        if (activityIndex === -1) return;
        
        const [movedActivity] = sourceDay.activities.splice(activityIndex, 1);
        
        // If moving to a different day, add to target day
        if (fromDayIndex !== toDayIndex) {
            const targetDay = updatedDays[toDayIndex];
            
            // Update start time if provided
            if (newTimeSlot) {
                movedActivity.startTime = newTimeSlot;
            }
            
            targetDay.activities.push(movedActivity);
            
            // Sort activities by start time
            targetDay.activities.sort((a, b) => a.startTime.localeCompare(b.startTime));
        } else {
            // Moving within the same day - just update time if provided
            if (newTimeSlot) {
                movedActivity.startTime = newTimeSlot;
            }
            sourceDay.activities.push(movedActivity);
            sourceDay.activities.sort((a, b) => a.startTime.localeCompare(b.startTime));
        }
        
        // Always recalculate costs for affected days
        updatedDays[fromDayIndex].totalCost = updatedDays[fromDayIndex].activities
            .reduce((sum, activity) => sum + (activity.estimatedCost || 0), 0);
        
        if (fromDayIndex !== toDayIndex) {
            updatedDays[toDayIndex].totalCost = updatedDays[toDayIndex].activities
                .reduce((sum, activity) => sum + (activity.estimatedCost || 0), 0);
        }
        
        const updatedTimeline = {
            ...currentTimeline,
            days: updatedDays
        };
        
        setCurrentTimeline(updatedTimeline);
        onTimelineUpdate?.(updatedTimeline);
    }, [currentTimeline, onTimelineUpdate]);

    const updateActivity = useCallback((
        dayIndex: number,
        activityId: string,
        updates: Partial<TimelineActivity>
    ) => {
        const updatedDays = [...currentTimeline.days];
        const day = updatedDays[dayIndex];
        const activityIndex = day.activities.findIndex(activity => activity.id === activityId);
        
        if (activityIndex === -1) return;
        
        day.activities[activityIndex] = {
            ...day.activities[activityIndex],
            ...updates
        };
        
        // Always recalculate day cost to ensure accuracy
        day.totalCost = day.activities
            .reduce((sum, activity) => sum + (activity.estimatedCost || 0), 0);
        
        const updatedTimeline = {
            ...currentTimeline,
            days: updatedDays
        };
        
        setCurrentTimeline(updatedTimeline);
        onTimelineUpdate?.(updatedTimeline);
    }, [currentTimeline, onTimelineUpdate]);

    const totalCost = currentTimeline.days.reduce((sum, day) => sum + day.totalCost, 0);

    const handleShowActivityDetails = useCallback((activity: TimelineActivity) => {
        setSelectedActivity(activity);
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedActivity(null);
    }, []);

    const handleActivityUpdate = useCallback((updates: Partial<TimelineActivity>) => {
        if (!selectedActivity) return;
        
        // Find and update the activity in the timeline
        const updatedDays = [...currentTimeline.days];
        for (const day of updatedDays) {
            const activityIndex = day.activities.findIndex(a => a.id === selectedActivity.id);
            if (activityIndex !== -1) {
                day.activities[activityIndex] = { ...day.activities[activityIndex], ...updates };
                // Recalculate day cost
                day.totalCost = day.activities.reduce((sum, activity) => sum + (activity.estimatedCost || 0), 0);
                break;
            }
        }
        
        const updatedTimeline = { ...currentTimeline, days: updatedDays };
        setCurrentTimeline(updatedTimeline);
        onTimelineUpdate?.(updatedTimeline);
        handleCloseModal();
    }, [selectedActivity, currentTimeline, onTimelineUpdate, handleCloseModal]);

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="bg-gradient-to-br from-red-50 via-white to-pink-50">
                {/* Enhanced Header with Better Stats */}
                <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                    <div className="max-w-4xl mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-xl font-light text-gray-800 mb-1">
                                    <span className="text-red-600">日</span>本 Journey Timeline
                                </h1>
                                <p className="text-sm text-gray-600">
                                    Click activities for details • Drag to reorder
                                </p>
                            </div>
                            
                            {/* Enhanced Summary Stats */}
                            <div className="flex items-center space-x-4">
                                <div className="text-center">
                                    <div className="text-xl font-light text-gray-800">{currentTimeline.totalDuration}</div>
                                    <div className="text-xs text-gray-500">Days</div>
                                </div>
                                <div className="w-px h-8 bg-gray-200"></div>
                                <div className="text-center">
                                    <div className="text-xl font-light text-green-600">¥{Math.round(totalCost/1000)}K</div>
                                    <div className="text-xs text-gray-500">Total Cost</div>
                                </div>
                                <div className="w-px h-8 bg-gray-200"></div>
                                <div className="text-center">
                                    <div className="text-xl font-light text-blue-600">{currentTimeline.regions.length}</div>
                                    <div className="text-xs text-gray-500">Regions</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Timeline Content */}
                <div className="max-w-4xl mx-auto px-4 py-6">
                    {/* Region Summary Bar */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6"
                    >
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-medium text-gray-800">Journey Overview</h3>
                                <div className="text-sm text-gray-500">
                                    {currentTimeline.travelStyles.length > 0 && (
                                        <span>{currentTimeline.travelStyles.map(s => s.name).join(', ')} • </span>
                                    )}
                                    {currentTimeline.season?.name}
                                </div>
                            </div>
                            <div className="flex items-center space-x-6">
                                {currentTimeline.regions.map((regionWithDays, index) => (
                                    <div key={regionWithDays.region.id} className="flex items-center space-x-2">
                                        <span className="text-xl">{regionWithDays.region.icon}</span>
                                        <div>
                                            <div className="text-sm font-medium text-gray-800">
                                                {regionWithDays.region.name}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {regionWithDays.days} day{regionWithDays.days !== 1 ? 's' : ''}
                                            </div>
                                        </div>
                                        {index < currentTimeline.regions.length - 1 && (
                                            <div className="text-gray-300 ml-4">→</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Full Width Timeline Layout for PC */}
                    <div className="space-y-6">
                        {currentTimeline.days.map((day, dayIndex) => (
                            <motion.div
                                key={`day-${day.dayNumber}`}
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: dayIndex * 0.1 }}
                                className="w-full"
                            >
                                <DayCard
                                    day={day}
                                    dayIndex={dayIndex}
                                    onMoveActivity={moveActivity}
                                    onUpdateActivity={updateActivity}
                                    onShowActivityDetails={handleShowActivityDetails}
                                />
                            </motion.div>
                        ))}
                    </div>

                    {/* Timeline Legend */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                    >
                        <h4 className="text-lg font-medium text-gray-800 mb-4">Activity Types</h4>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
                                <span className="text-sm text-gray-600">Attractions</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 bg-orange-100 border border-orange-200 rounded"></div>
                                <span className="text-sm text-gray-600">Meals</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div>
                                <span className="text-sm text-gray-600">Transport</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 bg-purple-100 border border-purple-200 rounded"></div>
                                <span className="text-sm text-gray-600">Accommodation</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
                                <span className="text-sm text-gray-600">Experiences</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Activity Detail Modal */}
            <ActivityDetailModal
                activity={selectedActivity}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onUpdate={handleActivityUpdate}
            />
        </DndProvider>
    );
}
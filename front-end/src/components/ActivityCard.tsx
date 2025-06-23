'use client';

import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { motion } from 'framer-motion';
import { TimelineActivity } from '@/types/travel';

interface ActivityCardProps {
    activity: TimelineActivity;
    dayIndex: number;
    onUpdate: (updates: Partial<TimelineActivity>) => void;
    onShowDetails?: (activity: TimelineActivity) => void;
}

export default function ActivityCard({ activity, dayIndex, onUpdate, onShowDetails }: ActivityCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValues, setEditValues] = useState({
        name: activity.name,
        duration: activity.duration,
        estimatedCost: activity.estimatedCost || 0,
        notes: activity.notes || ''
    });

    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'activity',
        item: () => {
            console.log('🚀 DRAG STARTED:', {
                activity: activity.name,
                id: activity.id,
                fromDay: dayIndex,
                duration: activity.duration
            });
            return { 
                id: activity.id, 
                fromDayIndex: dayIndex, 
                duration: activity.duration,
                name: activity.name 
            };
        },
        end: (item, monitor) => {
            console.log('🏁 DRAG ENDED:', {
                activity: activity.name,
                dropped: monitor.didDrop(),
                result: monitor.getDropResult()
            });
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

    const getActivityTypeColor = (type: TimelineActivity['type']) => {
        switch (type) {
            case 'attraction':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'meal':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'transport':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'accommodation':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'experience':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
        }
        return `${mins}m`;
    };

    const handleSave = () => {
        onUpdate({
            name: editValues.name,
            duration: editValues.duration,
            estimatedCost: editValues.estimatedCost,
            notes: editValues.notes
        });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditValues({
            name: activity.name,
            duration: activity.duration,
            estimatedCost: activity.estimatedCost || 0,
            notes: activity.notes || ''
        });
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <motion.div 
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="w-full p-3 bg-white border-2 border-red-300 rounded-lg shadow-md"
            >
                <div className="space-y-2">
                    <input
                        type="text"
                        value={editValues.name}
                        onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                        className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                        placeholder="Activity name"
                    />
                    
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="number"
                            value={editValues.duration}
                            onChange={(e) => setEditValues({ ...editValues, duration: parseInt(e.target.value) || 0 })}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                            placeholder="Duration (min)"
                        />
                        <input
                            type="number"
                            value={editValues.estimatedCost}
                            onChange={(e) => setEditValues({ ...editValues, estimatedCost: parseInt(e.target.value) || 0 })}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                            placeholder="Cost (¥)"
                        />
                    </div>
                    
                    <textarea
                        value={editValues.notes}
                        onChange={(e) => setEditValues({ ...editValues, notes: e.target.value })}
                        className="w-full text-xs border border-gray-300 rounded px-2 py-1 resize-none"
                        rows={2}
                        placeholder="Notes..."
                    />
                    
                    <div className="flex space-x-2">
                        <button
                            onClick={handleSave}
                            className="flex-1 text-xs bg-green-500 text-white rounded py-1 hover:bg-green-600 transition-colors"
                        >
                            Save
                        </button>
                        <button
                            onClick={handleCancel}
                            className="flex-1 text-xs bg-gray-300 text-gray-700 rounded py-1 hover:bg-gray-400 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            ref={drag as any}
            className={`w-full max-w-full p-2 bg-white border rounded-lg cursor-pointer transition-all duration-200 ${
                isDragging ? 'opacity-50 scale-95 shadow-lg' : 'hover:shadow-md hover:-translate-y-0.5'
            } group overflow-hidden`}
            whileHover={{ scale: 1.005 }}
            whileDrag={{ scale: 1.02 }}
            onClick={() => onShowDetails?.(activity)}
            onDoubleClick={() => setIsEditing(true)}
        >
            {/* Compact Single Row Layout */}
            <div className="flex items-center space-x-2 w-full">
                {/* Icon */}
                <span className="text-base flex-shrink-0">{activity.icon}</span>
                
                {/* Main Content */}
                <div className="flex-1 min-w-0 overflow-hidden">
                    <h4 className="text-sm font-medium text-gray-800 truncate">{activity.name}</h4>
                </div>
                
                {/* Compact Info */}
                <div className="flex items-center space-x-2 text-xs flex-shrink-0">
                    {/* Duration */}
                    <span className="text-gray-600">{formatDuration(activity.duration)}</span>
                    
                    {/* Cost */}
                    {activity.estimatedCost && (
                        <span className="text-green-600 font-medium">¥{activity.estimatedCost.toLocaleString()}</span>
                    )}
                    
                    {/* Type Badge */}
                    <div className={`text-xs px-1.5 py-0.5 rounded-full border font-medium ${getActivityTypeColor(activity.type)}`}>
                        {activity.type.charAt(0).toUpperCase()}
                    </div>
                    
                    {/* Edit Icon */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsEditing(true);
                        }}
                        className="opacity-0 group-hover:opacity-60 p-1 text-gray-400 hover:text-gray-600 rounded transition-all"
                        title="Edit activity"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
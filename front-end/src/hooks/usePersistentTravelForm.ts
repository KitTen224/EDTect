/**
 * Custom hook for managing persistent travel form state
 * Handles automatic saving/loading of form data with debouncing
 */

import { useState, useEffect, useCallback } from 'react';
import { JapanTravelFormData, RegionWithDays, JapanTravelStyle, JapanSeason } from '@/types/travel';
import { persistenceService, TravelFormState } from '@/lib/persistence';

export interface UsePersistentTravelFormOptions {
  autoSaveDelay?: number; // Debounce delay in milliseconds
  onLoadError?: (error: string) => void;
  onSaveError?: (error: string) => void;
}

export interface UsePersistentTravelFormReturn {
  // Form state
  step: 'region' | 'ordering' | 'style' | 'season' | 'summary';
  selectedRegions: RegionWithDays[];
  selectedStyles: JapanTravelStyle[];
  selectedSeason: JapanSeason | null;
  
  // State setters
  setStep: (step: 'region' | 'ordering' | 'style' | 'season' | 'summary') => void;
  setSelectedRegions: (regions: RegionWithDays[]) => void;
  setSelectedStyles: (styles: JapanTravelStyle[]) => void;
  setSelectedSeason: (season: JapanSeason | null) => void;
  
  // Loading and error states
  isLoading: boolean;
  isRestoring: boolean;
  saveError: string | null;
  isMounted: boolean;
  
  // Utility functions
  clearFormData: () => Promise<void>;
  getFormData: () => JapanTravelFormData;
  hasUnsavedChanges: boolean;
  storageInfo: {
    isAvailable: boolean;
    adapterType: string;
  };
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export function usePersistentTravelForm(
  options: UsePersistentTravelFormOptions = {}
): UsePersistentTravelFormReturn {
  const {
    autoSaveDelay = 500,
    onLoadError,
    onSaveError
  } = options;

  // Form state
  const [step, setStepState] = useState<'region' | 'ordering' | 'style' | 'season' | 'summary'>('region');
  const [selectedRegions, setSelectedRegionsState] = useState<RegionWithDays[]>([]);
  const [selectedStyles, setSelectedStylesState] = useState<JapanTravelStyle[]>([]);
  const [selectedSeason, setSelectedSeasonState] = useState<JapanSeason | null>(null);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false); // Start false for both server and client
  const [saveError, setSaveError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Storage info for debugging
  const storageInfo = {
    isAvailable: persistenceService.isStorageAvailable(),
    adapterType: persistenceService.getAdapterType()
  };

  // Handle mounting and restoration
  useEffect(() => {
    setIsMounted(true);
    
    // Only run restoration on client-side
    if (typeof window === 'undefined') {
      return;
    }

    const loadSavedState = async () => {
      console.log('🔄 Starting form data restoration...');
      
      try {
        setIsRestoring(true);
        const savedState = await persistenceService.loadTravelFormState();
        
        if (savedState) {
          console.log('✅ Found saved form data:', {
            step: savedState.step,
            regions: savedState.selectedRegions.length,
            styles: savedState.selectedStyles.length,
            lastUpdated: new Date(savedState.lastUpdated).toLocaleString()
          });
          
          setStepState(savedState.step);
          setSelectedRegionsState(savedState.selectedRegions);
          setSelectedStylesState(savedState.selectedStyles);
          setSelectedSeasonState(savedState.selectedSeason);
          setHasUnsavedChanges(false);
        } else {
          console.log('ℹ️ No saved form data found, starting fresh');
        }
      } catch (error: any) {
        const errorMessage = 'Failed to restore saved form data';
        console.error('❌ Form restoration error:', error);
        onLoadError?.(errorMessage);
      } finally {
        console.log('✅ Form restoration completed');
        setIsRestoring(false);
      }
    };

    // Add timeout protection to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn('⚠️ Form restoration timeout, forcing completion');
      setIsRestoring(false);
    }, 3000); // 3 second timeout

    // Small delay to ensure hydration is complete
    const restoreTimeout = setTimeout(() => {
      loadSavedState().finally(() => {
        clearTimeout(timeoutId);
      });
    }, 100);

    // Cleanup timeouts on unmount
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(restoreTimeout);
    };
  }, []);

  // Save state with debouncing
  const saveState = useCallback(
    debounce(async (state: Omit<TravelFormState, 'lastUpdated'>) => {
      if (isRestoring) return; // Don't save while restoring
      
      try {
        setIsLoading(true);
        setSaveError(null);
        await persistenceService.saveTravelFormState(state);
        setHasUnsavedChanges(false);
      } catch (error: any) {
        const errorMessage = 'Failed to save form data';
        console.error(errorMessage, error);
        setSaveError(errorMessage);
        onSaveError?.(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }, autoSaveDelay),
    [autoSaveDelay, isRestoring, onSaveError]
  );

  // Auto-save when state changes
  useEffect(() => {
    if (!isRestoring) {
      setHasUnsavedChanges(true);
      saveState({
        step,
        selectedRegions,
        selectedStyles,
        selectedSeason
      });
    }
  }, [step, selectedRegions, selectedStyles, selectedSeason, saveState, isRestoring]);

  // State setters with change tracking
  const setStep = useCallback((newStep: 'region' | 'ordering' | 'style' | 'season' | 'summary') => {
    setStepState(newStep);
  }, []);

  const setSelectedRegions = useCallback((regions: RegionWithDays[]) => {
    setSelectedRegionsState(regions);
  }, []);

  const setSelectedStyles = useCallback((styles: JapanTravelStyle[]) => {
    setSelectedStylesState(styles);
  }, []);

  const setSelectedSeason = useCallback((season: JapanSeason | null) => {
    setSelectedSeasonState(season);
  }, []);

  // Clear form data
  const clearFormData = useCallback(async () => {
    try {
      await persistenceService.clearTravelFormState();
      setStepState('region');
      setSelectedRegionsState([]);
      setSelectedStylesState([]);
      setSelectedSeasonState(null);
      setHasUnsavedChanges(false);
      setSaveError(null);
    } catch (error: any) {
      console.error('Failed to clear form data:', error);
      const errorMessage = 'Failed to clear form data';
      setSaveError(errorMessage);
      onSaveError?.(errorMessage);
    }
  }, [onSaveError]);

  // Get current form data in the expected format
  const getFormData = useCallback((): JapanTravelFormData => {
    const totalDuration = selectedRegions.reduce((sum, regionWithDays) => sum + regionWithDays.days, 0);
    const orderedRegions = [...selectedRegions].sort((a, b) => (a.order || 0) - (b.order || 0));
    
    return {
      regions: orderedRegions,
      totalDuration,
      travelStyles: selectedStyles,
      season: selectedSeason || undefined,
      interests: [] // We'll implement this later
    };
  }, [selectedRegions, selectedStyles, selectedSeason]);

  return {
    // Form state
    step,
    selectedRegions,
    selectedStyles,
    selectedSeason,
    
    // State setters
    setStep,
    setSelectedRegions,
    setSelectedStyles,
    setSelectedSeason,
    
    // Loading and error states
    isLoading,
    isRestoring,
    saveError,
    isMounted,
    
    // Utility functions
    clearFormData,
    getFormData,
    hasUnsavedChanges,
    storageInfo
  };
}
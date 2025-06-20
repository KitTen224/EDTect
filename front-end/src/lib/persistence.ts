/**
 * Persistence layer for storing and retrieving travel form data
 * Provides an abstraction over different storage mechanisms
 */

import { JapanTravelFormData, RegionWithDays, JapanTravelStyle, JapanSeason } from '@/types/travel';

// Interface for form step data that will be persisted
export interface TravelFormState {
  step: 'region' | 'ordering' | 'style' | 'season' | 'summary';
  selectedRegions: RegionWithDays[];
  selectedStyles: JapanTravelStyle[];
  selectedSeason: JapanSeason | null;
  formData?: JapanTravelFormData;
  lastUpdated: number; // timestamp
}

// Base interface for persistence adapters
export interface PersistenceAdapter {
  isAvailable(): boolean;
  save(key: string, data: any): Promise<void>;
  load(key: string): Promise<any | null>;
  remove(key: string): Promise<void>;
}

// LocalStorage adapter implementation
export class LocalStorageAdapter implements PersistenceAdapter {
  isAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      const testKey = '__persistence_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      console.warn('LocalStorage not available:', error);
      return false;
    }
  }

  async save(key: string, data: any): Promise<void> {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);
    } catch (error) {
      console.error('LocalStorage save error:', error);
      throw new Error('Failed to save data to localStorage');
    }
  }

  async load(key: string): Promise<any | null> {
    try {
      const serializedData = localStorage.getItem(key);
      if (serializedData === null) {
        return null;
      }
      return JSON.parse(serializedData);
    } catch (error) {
      console.error('LocalStorage load error:', error);
      return null; // Return null on error rather than throwing
    }
  }

  async remove(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('LocalStorage remove error:', error);
    }
  }
}

// Memory storage fallback adapter
export class MemoryStorageAdapter implements PersistenceAdapter {
  private storage: Map<string, any> = new Map();

  isAvailable(): boolean {
    return true; // Always available as fallback
  }

  async save(key: string, data: any): Promise<void> {
    this.storage.set(key, data);
  }

  async load(key: string): Promise<any | null> {
    return this.storage.get(key) || null;
  }

  async remove(key: string): Promise<void> {
    this.storage.delete(key);
  }
}

// Main persistence service
export class PersistenceService {
  private adapter: PersistenceAdapter;
  private readonly storageKey = 'travel_form_data';

  constructor() {
    // Choose the best available adapter
    if (typeof window === 'undefined') {
      // SSR compatibility - use memory adapter on server
      console.log('🔧 Persistence: Using MemoryStorage (SSR mode)');
      this.adapter = new MemoryStorageAdapter();
    } else {
      // Browser environment - prefer localStorage, fallback to memory
      const localStorageAdapter = new LocalStorageAdapter();
      if (localStorageAdapter.isAvailable()) {
        console.log('🔧 Persistence: Using LocalStorage');
        this.adapter = localStorageAdapter;
      } else {
        console.log('🔧 Persistence: LocalStorage unavailable, using MemoryStorage fallback');
        this.adapter = new MemoryStorageAdapter();
      }
    }
  }

  /**
   * Save travel form state with automatic timestamp
   */
  async saveTravelFormState(state: Omit<TravelFormState, 'lastUpdated'>): Promise<void> {
    const stateWithTimestamp: TravelFormState = {
      ...state,
      lastUpdated: Date.now()
    };

    try {
      await this.adapter.save(this.storageKey, stateWithTimestamp);
    } catch (error) {
      console.error('Failed to save travel form state:', error);
      throw error;
    }
  }

  /**
   * Load travel form state
   */
  async loadTravelFormState(): Promise<TravelFormState | null> {
    try {
      console.log('📖 Loading travel form state...');
      const state = await this.adapter.load(this.storageKey);
      
      if (!state) {
        console.log('📖 No saved state found');
        return null;
      }

      // Validate the structure
      if (!this.isValidTravelFormState(state)) {
        console.warn('📖 Invalid travel form state structure, clearing data');
        await this.clearTravelFormState();
        return null;
      }

      console.log('📖 Successfully loaded valid travel form state');
      return state;
    } catch (error) {
      console.error('📖 Failed to load travel form state:', error);
      return null;
    }
  }

  /**
   * Clear travel form state
   */
  async clearTravelFormState(): Promise<void> {
    try {
      await this.adapter.remove(this.storageKey);
    } catch (error) {
      console.error('Failed to clear travel form state:', error);
    }
  }

  /**
   * Check if storage is available
   */
  isStorageAvailable(): boolean {
    return this.adapter.isAvailable();
  }

  /**
   * Get adapter type for debugging
   */
  getAdapterType(): string {
    return this.adapter.constructor.name;
  }

  /**
   * Validate travel form state structure
   */
  private isValidTravelFormState(state: any): state is TravelFormState {
    return (
      state &&
      typeof state === 'object' &&
      ['region', 'ordering', 'style', 'season', 'summary'].includes(state.step) &&
      Array.isArray(state.selectedRegions) &&
      Array.isArray(state.selectedStyles) &&
      (state.selectedSeason === null || typeof state.selectedSeason === 'object') &&
      typeof state.lastUpdated === 'number'
    );
  }
}

// Create singleton instance
export const persistenceService = new PersistenceService();
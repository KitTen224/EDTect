// Gemini-Powered Photo Service for fetching activity images
// Uses existing Gemini API + free image services (Unsplash)

interface PhotoOptions {
    searchTerms: string;
    location?: string;
    type?: 'attraction' | 'meal' | 'accommodation' | 'experience' | 'transport';
    activityName?: string;
}

interface PhotoResult {
    url: string;
    width: number;
    height: number;
    source: 'unsplash' | 'fallback' | 'cached';
    attribution?: string;
}

class PhotoService {
    private cache = new Map<string, PhotoResult>();

    constructor() {
        // No additional API keys needed - uses existing Gemini setup + free Unsplash API
    }

    /**
     * Get photo for an activity using free services with Gemini-generated search terms
     */
    async getActivityPhoto(options: PhotoOptions): Promise<PhotoResult> {
        const cacheKey = this.getCacheKey(options);
        
        // Check cache first
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey)!;
        }

        let result: PhotoResult;

        try {
            // Try Unsplash API (free) with optimized search terms
            result = await this.getUnsplashPhoto(options);
            if (result) {
                this.cache.set(cacheKey, result);
                return result;
            }
        } catch (error) {
            console.warn('Unsplash API failed, using fallback:', error);
        }

        // Final fallback to curated images
        result = this.getFallbackPhoto(options);
        this.cache.set(cacheKey, result);
        return result;
    }

    /**
     * Get photo from Unsplash API (free)
     */
    private async getUnsplashPhoto(options: PhotoOptions): Promise<PhotoResult | null> {
        try {
            // Clean and optimize search terms for better results
            const searchQuery = this.optimizeSearchTerms(options.searchTerms, options.type);
            
            // Use Unsplash Source API (no API key required for basic usage)
            const unsplashUrl = `https://source.unsplash.com/800x600/?${encodeURIComponent(searchQuery)}`;
            
            // Test if the URL returns a valid image
            const response = await fetch(unsplashUrl, { method: 'HEAD' });
            
            if (response.ok) {
                return {
                    url: unsplashUrl,
                    width: 800,
                    height: 600,
                    source: 'unsplash',
                    attribution: 'Photo from Unsplash'
                };
            }
            
            return null;
        } catch (error) {
            console.error('Unsplash API error:', error);
            return null;
        }
    }

    /**
     * Optimize search terms for better photo results
     */
    private optimizeSearchTerms(searchTerms: string, type?: string): string {
        // Clean up search terms and add context keywords
        let optimized = searchTerms.toLowerCase();
        
        // Add context based on activity type
        switch (type) {
            case 'attraction':
                optimized += ' tourism landmark japan';
                break;
            case 'meal':
                optimized += ' japanese food cuisine';
                break;
            case 'accommodation':
                optimized += ' hotel japan interior';
                break;
            case 'experience':
                optimized += ' activity japan culture';
                break;
            case 'transport':
                optimized += ' transportation japan';
                break;
            default:
                optimized += ' japan';
        }
        
        // Remove common words that don't help with image search
        const stopWords = ['visit', 'explore', 'experience', 'try', 'see', 'enjoy', 'check-in'];
        optimized = optimized.split(' ').filter(word => !stopWords.includes(word)).join(' ');
        
        return optimized;
    }


    /**
     * Get fallback photo based on activity type
     */
    private getFallbackPhoto(options: PhotoOptions): PhotoResult {
        // Default images by activity type (you can replace these with actual fallback URLs)
        const fallbackImages = {
            attraction: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800', // Japanese temple
            meal: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800', // Japanese food
            accommodation: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', // Japanese hotel
            experience: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800', // Japan experience
            transport: 'https://images.unsplash.com/photo-1544373150-b0de3ba6eb48?w=800' // Japan transport
        };

        const defaultImage = 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800'; // Japan general

        return {
            url: fallbackImages[options.type || 'attraction'] || defaultImage,
            width: 800,
            height: 600,
            source: 'fallback'
        };
    }

    /**
     * Generate cache key for photo options
     */
    private getCacheKey(options: PhotoOptions): string {
        return `${options.searchTerms}-${options.location}-${options.type}-${options.placeId}`;
    }

    /**
     * Clear photo cache
     */
    clearCache(): void {
        this.cache.clear();
    }

    /**
     * Check if service is properly configured
     */
    isConfigured(): boolean {
        // Always configured since we use free services
        return true;
    }
}

// Export singleton instance
export const photoService = new PhotoService();
export type { PhotoOptions, PhotoResult };
type CacheOptions = {
  expirationMinutes?: number;
};

/**
 * A utility for caching data in localStorage with expiration
 */
export const storageCache = {
  /**
   * Save data to localStorage with expiration
   */
  set: <T>(key: string, data: T, options: CacheOptions = {}) => {
    try {
      const expirationMinutes = options.expirationMinutes || 60; // Default 1 hour
      const now = new Date();
      const item = {
        data,
        expiry: now.getTime() + expirationMinutes * 60 * 1000,
      };
      localStorage.setItem(key, JSON.stringify(item));
      return true;
    } catch (error) {
      console.error('Error saving to cache:', error);
      return false;
    }
  },

  /**
   * Get data from localStorage if not expired
   */
  get: <T>(key: string): T | null => {
    try {
      const itemStr = localStorage.getItem(key);
      
      // Return null if no item exists
      if (!itemStr) return null;
      
      const item = JSON.parse(itemStr);
      const now = new Date();
      
      // Check if expired
      if (now.getTime() > item.expiry) {
        localStorage.removeItem(key);
        return null;
      }
      
      return item.data;
    } catch (error) {
      console.error('Error retrieving from cache:', error);
      return null;
    }
  },

  /**
   * Remove item from cache
   */
  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Clear all cache items
   */
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get data from cache, or fetch it if not available/expired
   */
  getOrFetch: async <T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> => {
    // Try to get from cache first
    const cachedData = storageCache.get<T>(key);
    
    if (cachedData !== null) {
      return cachedData;
    }
    
    // If not in cache or expired, fetch fresh data
    try {
      const data = await fetchFn();
      storageCache.set(key, data, options);
      return data;
    } catch (error) {
      throw error;
    }
  }
}; 
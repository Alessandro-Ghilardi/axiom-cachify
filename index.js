/**
 * Axiom Cachify - Zero-dependency in-memory cache
 * Features: TTL, LRU eviction, statistics
 */

class Cachify {
    constructor(options = {}) {
        this.cache = new Map();
        this.maxSize = options.maxSize || 1000;
        this.defaultTTL = options.defaultTTL || 60000; // 1 minute default
        this.cleanupInterval = options.cleanupInterval || 60000; // 1 minute

        // Statistics
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            evictions: 0
        };

        // LRU tracking
        this.accessOrder = new Map(); // key -> timestamp

        // Start periodic cleanup
        this.cleanupTimer = setInterval(() => {
            this.cleanup();
        }, this.cleanupInterval);
    }

    /**
     * Set a value in the cache
     * @param {string} key - Cache key
     * @param {*} value - Value to cache
     * @param {number} ttl - Time to live in milliseconds (optional)
     */
    set(key, value, ttl = this.defaultTTL) {
        const now = Date.now();
        const expiry = ttl > 0 ? now + ttl : null;

        // If at max size, evict least recently used
        if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
            this.evictLRU();
        }

        this.cache.set(key, {
            value,
            expiry,
            createdAt: now
        });

        this.accessOrder.set(key, now);
        this.stats.sets++;
    }

    /**
     * Get a value from the cache
     * @param {string} key - Cache key
     * @returns {*} Cached value or undefined if not found/expired
     */
    get(key) {
        const entry = this.cache.get(key);

        if (!entry) {
            this.stats.misses++;
            return undefined;
        }

        // Check if expired
        if (entry.expiry && Date.now() > entry.expiry) {
            this.delete(key);
            this.stats.misses++;
            return undefined;
        }

        // Update access time for LRU
        this.accessOrder.set(key, Date.now());
        this.stats.hits++;

        return entry.value;
    }

    /**
     * Check if a key exists and is not expired
     * @param {string} key - Cache key
     * @returns {boolean}
     */
    has(key) {
        const entry = this.cache.get(key);

        if (!entry) return false;

        if (entry.expiry && Date.now() > entry.expiry) {
            this.delete(key);
            return false;
        }

        return true;
    }

    /**
     * Delete a key from the cache
     * @param {string} key - Cache key
     * @returns {boolean} True if key was deleted
     */
    delete(key) {
        const deleted = this.cache.delete(key);
        this.accessOrder.delete(key);
        if (deleted) {
            this.stats.deletes++;
        }
        return deleted;
    }

    /**
     * Clear all entries from the cache
     */
    clear() {
        this.cache.clear();
        this.accessOrder.clear();
    }

    /**
     * Get the number of entries in the cache
     * @returns {number}
     */
    get size() {
        return this.cache.size;
    }

    /**
     * Get cache statistics
     * @returns {Object} Statistics object
     */
    getStats() {
        return {
            ...this.stats,
            hitRate: this.stats.hits + this.stats.misses > 0
                ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2) + '%'
                : '0%',
            size: this.cache.size,
            maxSize: this.maxSize
        };
    }

    /**
     * Reset statistics
     */
    resetStats() {
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            evictions: 0
        };
    }

    /**
     * Evict least recently used entry
     */
    evictLRU() {
        let lruKey = null;
        let lruTime = Infinity;

        for (const [key, time] of this.accessOrder.entries()) {
            if (time < lruTime) {
                lruTime = time;
                lruKey = key;
            }
        }

        if (lruKey) {
            this.delete(lruKey);
            this.stats.evictions++;
        }
    }

    /**
     * Cleanup expired entries
     */
    cleanup() {
        const now = Date.now();
        let cleaned = 0;

        for (const [key, entry] of this.cache.entries()) {
            if (entry.expiry && now > entry.expiry) {
                this.delete(key);
                cleaned++;
            }
        }

        return cleaned;
    }

    /**
     * Get all keys (non-expired)
     * @returns {Array<string>}
     */
    keys() {
        const now = Date.now();
        const validKeys = [];

        for (const [key, entry] of this.cache.entries()) {
            if (!entry.expiry || now <= entry.expiry) {
                validKeys.push(key);
            }
        }

        return validKeys;
    }

    /**
     * Get all values (non-expired)
     * @returns {Array<*>}
     */
    values() {
        const now = Date.now();
        const validValues = [];

        for (const [key, entry] of this.cache.entries()) {
            if (!entry.expiry || now <= entry.expiry) {
                validValues.push(entry.value);
            }
        }

        return validValues;
    }

    /**
     * Stop the cleanup interval
     */
    destroy() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
        }
    }
}

// Convenience function for single-instance usage
let defaultCache = null;

function createCache(options) {
    return new Cachify(options);
}

function setDefaultCache(cache) {
    defaultCache = cache;
}

function getDefaultCache() {
    if (!defaultCache) {
        defaultCache = new Cachify();
    }
    return defaultCache;
}

// Export
module.exports = Cachify;
module.exports.createCache = createCache;
module.exports.setDefaultCache = setDefaultCache;
module.exports.getDefaultCache = getDefaultCache;

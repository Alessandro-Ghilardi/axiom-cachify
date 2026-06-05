# axiom-cachify

A zero-dependency in-memory cache with TTL, LRU eviction, and built-in statistics for Node.js applications.

## Features

- ⚡ **Zero Dependencies**: Built only with native Node.js modules
- ⏱️ **TTL Support**: Set time-to-live for individual cache entries
- 🔄 **LRU Eviction**: Automatically evicts least recently used items when at capacity
- 📊 **Built-in Statistics**: Track hits, misses, evictions, and hit rate
- 🧹 **Automatic Cleanup**: Periodic removal of expired entries
- 🎯 **Simple API**: Easy-to-use get/set/delete interface
- 🔧 **Configurable**: Customize max size, default TTL, and cleanup interval

## Installation

```bash
npm install axiom-cachify
```

## Quick Start

```javascript
const Cachify = require('axiom-cachify');

// Create a cache instance
const cache = new Cachify({
    maxSize: 1000,        // Maximum number of entries
    defaultTTL: 60000,    // Default TTL: 1 minute
    cleanupInterval: 60000 // Cleanup interval: 1 minute
});

// Set a value
cache.set('user:1', { name: 'John', age: 30 });

// Get a value
const user = cache.get('user:1');
console.log(user); // { name: 'John', age: 30 }

// Set with custom TTL (5 seconds)
cache.set('session:abc', { data: 'temp' }, 5000);

// Check if key exists
if (cache.has('user:1')) {
    console.log('User is cached');
}

// Delete a key
cache.delete('user:1');

// Get statistics
console.log(cache.getStats());
// { hits: 5, misses: 2, sets: 10, deletes: 3, evictions: 0, hitRate: '71.43%', size: 5, maxSize: 1000 }
```

## API Reference

### Constructor Options

```javascript
new Cachify({
    maxSize: 1000,           // Maximum cache size (default: 1000)
    defaultTTL: 60000,       // Default TTL in milliseconds (default: 60000)
    cleanupInterval: 60000   // Cleanup interval in milliseconds (default: 60000)
})
```

### Methods

#### `set(key, value, ttl?)`

Store a value in the cache.

- **key** (string): Cache key
- **value** (any): Value to cache
- **ttl** (number, optional): Time to live in milliseconds (uses default if not specified)

```javascript
cache.set('api:data', { result: 'success' });
cache.set('temp:data', { result: 'temp' }, 5000); // 5 seconds TTL
```

#### `get(key)`

Retrieve a value from the cache. Returns `undefined` if not found or expired.

- **key** (string): Cache key
- **Returns**: Cached value or undefined

```javascript
const data = cache.get('api:data');
```

#### `has(key)`

Check if a key exists and is not expired.

- **key** (string): Cache key
- **Returns**: boolean

```javascript
if (cache.has('api:data')) {
    console.log('Data is cached');
}
```

#### `delete(key)`

Remove a key from the cache.

- **key** (string): Cache key
- **Returns**: boolean (true if deleted)

```javascript
cache.delete('api:data');
```

#### `clear()`

Remove all entries from the cache.

```javascript
cache.clear();
```

#### `getStats()`

Get cache statistics including hits, misses, evictions, and hit rate.

- **Returns**: Object with statistics

```javascript
const stats = cache.getStats();
// {
//   hits: 100,
//   misses: 20,
//   sets: 80,
//   deletes: 10,
//   evictions: 5,
//   hitRate: '83.33%',
//   size: 65,
//   maxSize: 1000
// }
```

#### `resetStats()`

Reset all statistics to zero.

```javascript
cache.resetStats();
```

#### `keys()`

Get all non-expired keys.

- **Returns**: Array of strings

```javascript
const allKeys = cache.keys();
```

#### `values()`

Get all non-expired values.

- **Returns**: Array of values

```javascript
const allValues = cache.values();
```

#### `destroy()`

Stop the cleanup interval. Call this when shutting down your application.

```javascript
cache.destroy();
```

## Use Cases

- **API Response Caching**: Cache expensive API calls
- **Session Storage**: Temporary session data with automatic expiry
- **Database Query Results**: Cache frequent database queries
- **Computed Values**: Store expensive computation results
- **Rate Limiting**: Track request counts (combine with axiom-traffic-shaper)

## Example: API Caching

```javascript
const Cachify = require('axiom-cachify');
const cache = new Cachify({ defaultTTL: 300000 }); // 5 minutes

async function getUserData(userId) {
    const cacheKey = `user:${userId}`;
    
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached) {
        return cached;
    }
    
    // Fetch from database
    const data = await database.fetchUser(userId);
    
    // Store in cache
    cache.set(cacheKey, data);
    
    return data;
}
```

## Performance

- **O(1)** get/set/delete operations
- **O(n)** cleanup operation (runs periodically in background)
- Minimal memory overhead per entry

## License

MIT

## Author

Alessandro Ghilardi

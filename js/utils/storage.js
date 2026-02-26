/**
 * Save data to localStorage under the given key.
 *
 * @param {string} key - The localStorage key
 * @param {*} data - The data to serialize and store
 */
function saveToStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

/**
 * Load and parse data from localStorage by key.
 *
 * @param {string} key - The localStorage key to retrieve
 * @returns {*} - The parsed value, or null if not found
 */
function loadFromStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}

/**
 * Clear all entries from localStorage.
 * Use when resetting app state or invalidating stale cache.
 */
function clearStorage() {
  localStorage.clear();
}

export { saveToStorage, loadFromStorage, clearStorage };

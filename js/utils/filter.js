/**
 * Returns items where the given field includes the search text.
 * Case-insensitive.
 *
 * @param {Array} data - Array of objects to filter
 * @param {string} field - The key to filter on
 * @param {string} filteredText - The text to search for
 * @returns {Array} - Filtered array
 */
export function filter(data, field, filteredText) {
  return data.filter((item) => {
    const value = item?.[field];
    if (typeof value !== "string") return false;
    return value.toLowerCase().includes(filteredText.toLowerCase());
  });
}

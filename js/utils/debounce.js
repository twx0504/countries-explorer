/**
 * Wrap a function so it only executes after a specified delay has passed
 * since the last time it was invoked. Useful for limiting how often
 * expensive operations run in response to frequent events like input or scroll.
 *
 * @param {Function} callback - The function to debounce
 * @param {number} [delay=300] - Milliseconds to wait before invoking the callback
 * @returns {Function} - The debounced function
 */
export function debounce(callback, delay = 300) {
  let timeoutId = null;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}

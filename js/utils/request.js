/**
 * Make a fetch request and return parsed JSON data.
 *
 * @param {string} url - The URL to fetch
 * @returns {Promise<object|null>} - Parsed JSON response, or null if request fails
 */
export async function request(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP error: ${res.status} ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.error("Request failed:", err);
    return null;
  }
}

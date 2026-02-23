import {
  ALL,
  REGION,
  NAME,
  COUNTRY_INFO_URL,
  COUNTRY_URL,
} from "./constants.js";

export const countryCardsData = [];
export let filteredCountryData = [];
export const cca3ToNameMap = {};
export let countryDetail = {};

let activeRegion = "";
let activeSearch = "";

/**
 * Make a fetch request and return parsed JSON data.
 *
 * @param {string} url - The URL to fetch
 * @returns {Promise<object|null>} - Parsed JSON response, or null if request fails
 */
async function request(url) {
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

/**
 * Fetch all countries and populate shared data structures.
 * Should be called once on app initialization.
 *
 * @returns {Promise<Array>} - Raw array of all country objects from the API
 */
export async function fetchAll() {
  const countries = await request(COUNTRY_URL);
  if (!countries) return [];
  createCCA3ToName(countries);
  createCardData(countries);
  // Initialize the filteredCountryData on the first render
  applyFilters();
  return countries;
}

/**
 * Fetch detailed info for a single country by its common name.
 * Uses fullText=true to avoid partial name matches (e.g. "China" matching Hong Kong).
 *
 * @param {string} name - The common name of the country (e.g. "Germany")
 * @returns {Promise<Array>} - Single-element array containing the country object
 */
export async function fetchCountryInfo(name) {
  const url = `${COUNTRY_INFO_URL}/${name.toLowerCase()}?fullText=true`;
  const data = await request(url);
  if (!data) {
    console.warn(`No data returned for country: ${name}`);
    return null;
  }
  return data;
}

/**
 * Filter countries by region and store results in filteredCountryData.
 *
 * @param {string} region - The region to filter by (e.g. "Europe")
 */
export function filterByRegion(region) {
  activeRegion = region === ALL ? "" : region;
  applyFilters();
}

/**
 * Filter countries by search text and store results in filteredCountryData.
 *
 * @param {string} search - The search string to match against country names
 */
export function filterBySearch(search) {
  activeSearch = search.trim();
  applyFilters();
}

/**
 * Build a lookup map of cca3 code → country common name.
 * Used to resolve border country codes into readable names in the detail view.
 *
 * @param {Array} countries - Raw array of country objects from the API
 */
function createCCA3ToName(countries) {
  countries.forEach(({ name, cca3 }) => {
    const commonName = name?.common;
    if (cca3 && commonName) {
      cca3ToNameMap[cca3] = commonName;
    }
  });
}

/**
 * Extract and flatten the fields needed for country cards into countryCardsData.
 * Keeps card data lightweight — full details are fetched separately on demand.
 *
 * @param {Array} countries - Raw array of country objects from the API
 */
function createCardData(countries) {
  countryCardsData.length = 0;

  const newArr = countries.map(
    ({ name, capital, population, region, flags }) => ({
      name: name?.common ?? "Unknown",
      capital: capital?.[0] ?? "N/A",
      population: population ?? 0,
      region: region ?? "Unknown",
      flag: flags?.png ?? "",
      alt: flags?.alt ?? `Flag of ${name?.common ?? "country"}`,
    }),
  );

  countryCardsData.push(...newArr);
}

/**
 * Transform raw API country data into the shape used by the detail view
 * and store it in the shared countryDetail object.
 *
 * @param {Array} country - Single-element array returned by the API
 */
export function createCountryDetail(country) {
  try {
    const {
      name,
      population,
      region,
      subregion,
      capital,
      tld,
      currencies,
      languages,
      borders,
      flags,
    } = country[0];

    const languageList = Object.values(languages ?? {});

    const currenciesList = Object.values(currencies ?? {}).map((currency) => {
      return toTitleCase(currency.name);
    });

    const nativeName = getNativeName(name, languages);

    countryDetail = {
      name: name?.common ?? "Unknown",
      nativeName: nativeName ?? name?.common ?? "Unknown",
      population: population ?? 0,
      region: region ?? "Unknown",
      subregion: subregion ?? "Unknown",
      capital: capital?.[0] ?? "N/A",
      tld: tld?.[0] ?? "N/A",
      currencies: currenciesList.join(", "),
      languages: languageList.join(", "),
      borders: borders ?? [],
      flags: flags ?? {},
    };
  } catch (err) {
    console.error("Failed to parse country detail:", err);
  }
}

/**
 * Generic filter — returns items where the given field includes the search text.
 * Case-insensitive.
 *
 * @param {Array} data - Array of objects to filter
 * @param {string} field - The key to filter on
 * @param {string} filteredText - The text to search for
 * @returns {Array} - Filtered array
 */
function filter(data, field, filteredText) {
  return data.filter((item) => {
    const value = item?.[field];
    if (typeof value !== "string") return false;
    return value.toLowerCase().includes(filteredText.toLowerCase());
  });
}

/**
 * Apply active region and search filters together on countryCardsData.
 * Filters are combined — both must match for a country to appear.
 * Skips a filter if its value is empty (no filter applied for that field).
 */
function applyFilters() {
  let res = countryCardsData;
  if (activeRegion) {
    res = filter(res, REGION, activeRegion);
  }

  if (activeSearch) {
    res = filter(res, NAME, activeSearch);
  }

  filteredCountryData = res;
}

/**
 * Convert a string to title case (e.g. "euro" → "Euro").
 *
 * @param {string} str - A string to be processed
 * @returns {string} - The processed string
 */
function toTitleCase(str) {
  return str.replace(/\w\S*/g, (match) => {
    return match.charAt(0).toUpperCase() + match.substr(1);
  });
}

/**
 * Get the native name for a country.
 *
 * Iterates through the country's spoken languages and returns the common
 * native name for the first language that has a match in nativeName.
 *
 * Note: This is imperfect — the first language in the list is not necessarily
 * the most spoken one, and there's no way to determine that from the API alone.
 *
 * @param {object} name - The name object from the API
 * @param {object} languages - The languages object from the API (keyed by ISO 639-3 code)
 * @returns {string} - The native country name, or the common name as fallback
 */
function getNativeName(name, languages = {}) {
  const langs = Object.keys(languages);
  const nativeNames = name?.nativeName ?? {};
  for (const lang of langs) {
    if (nativeNames?.[lang]) {
      return nativeNames[lang].common;
    }
  }
  return name?.common ?? "Unknown"; // fallback
}

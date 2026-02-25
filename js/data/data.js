import {
  ALL,
  REGION,
  NAME,
  COUNTRY_INFO_URL,
  COUNTRY_URL,
} from "./constants.js";

import { request } from "../utils/request.js";
import { filter } from "../utils/filter.js";

const allCountries = [];
const cca3ToNameMap = {};

let activeRegion = "";
let activeSearch = "";

/**
 * Fetch all countries and populate shared data structures.
 * Resets active region and search filters.
 * Should be called once on app initialization.
 *
 * @returns {Promise<Array>} - Flattened array of country card data
 */
async function fetchAll() {
  const countries = await request(COUNTRY_URL);
  if (!countries) return [];
  createCCA3ToName(countries);
  resetActiveFilters();
  return createCardData(countries);
}

/**
 * Fetch detailed info for a single country by its common name.
 * Uses fullText=true to avoid partial name matches (e.g. "China" matching "Hong Kong").
 *
 * @param {string} name - The common name of the country (e.g. "Germany")
 * @returns {Promise<object|null>} - Transformed country detail object, or null if request fails
 */
async function fetchCountryInfo(name) {
  if (!name) return null;
  const url = `${COUNTRY_INFO_URL}/${name.toLowerCase()}?fullText=true`;
  const country = await request(url);
  if (!country) {
    console.warn(`No data returned for country: ${name}`);
    return null;
  }
  return createCountryDetail(country);
}

/**
 * Filter countries by region and return the filtered result.
 * Passing the ALL constant resets the region filter.
 *
 * @param {string} region - The region to filter by (e.g. "Europe"), or ALL to show all
 * @returns {Array} - Filtered array of country card objects
 */
function filterByRegion(region) {
  activeRegion = region === ALL ? "" : region;
  return applyFilters();
}

/**
 * Filter countries by search text and return the filtered result.
 *
 * @param {string} search - The search string to match against country names
 * @returns {Array} - Filtered array of country card objects
 */
function filterBySearch(search) {
  activeSearch = search.trim();
  return applyFilters();
}

/**
 * Apply active region and search filters together on allCountries.
 * Filters are combined — both must match for a country to appear.
 * Skips a filter if its value is empty (no active filter for that field).
 *
 * @returns {Array} - Filtered array of country card objects
 */
function applyFilters() {
  let res = allCountries;
  if (activeRegion) {
    res = filter(res, REGION, activeRegion);
  }
  if (activeSearch) {
    res = filter(res, NAME, activeSearch);
  }
  return res;
}

/**
 * Reset active region and search filter state to their defaults.
 * Called on fetchAll to ensure a clean state on re-initialization.
 */
function resetActiveFilters() {
  activeRegion = "";
  activeSearch = "";
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
 * Extract and flatten the fields needed for country cards into allCountries.
 * Keeps card data lightweight — full details are fetched separately on demand.
 *
 * @param {Array} countries - Raw array of country objects from the API
 * @returns {Array} - Flattened array of country card objects
 */
function createCardData(countries) {
  allCountries.length = 0;

  const newArr = countries.map(
    ({ name, capital, population, region, flags }) => ({
      name: name?.common ?? "Unknown",
      capital: capital?.[0] ?? "N/A",
      population: population ?? 0,
      region: region ?? "Unknown",
      flags: flags ?? {},
    }),
  );

  allCountries.push(...newArr);
  return newArr;
}

/**
 * Transform raw API country data into the shape used by the detail view.
 *
 * @param {Array} country - Single-element array returned by the API
 * @returns {object} - Transformed country detail object, or empty object on failure
 */
function createCountryDetail(country) {
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

    const transformedBorders = transformBorderNames(borders ?? []);

    const nativeName = getNativeName(name, languages);

    return {
      name: name?.common ?? "Unknown",
      nativeName: nativeName ?? name?.common ?? "Unknown",
      population: population ?? 0,
      region: region ?? "Unknown",
      subregion: subregion ?? "Unknown",
      capital: capital?.[0] ?? "N/A",
      tld: tld?.[0] ?? "N/A",
      currencies: currenciesList?.length ? currenciesList.join(", ") : "N/A",
      languages: languageList?.length ? languageList.join(", ") : "N/A",
      borders: transformedBorders,
      flags: {
        svg: flags?.svg ?? "",
        alt: flags?.alt ?? `Flag of ${name?.common ?? "Unknown"}`,
      },
    };
  } catch (err) {
    console.error("Failed to parse country detail:", err);
    return {};
  }
}

/**
 * Convert a string to title case (e.g. "euro" → "Euro").
 *
 * @param {string} str - A string to be processed
 * @returns {string} - The processed string
 */
function toTitleCase(str) {
  return str.replace(/\w\S*/g, (match) => {
    return match.charAt(0).toUpperCase() + match.slice(1);
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
  return name?.common ?? "Unknown";
}

/**
 * Resolve an array of cca3 border codes into country common names.
 * Uses the cca3ToNameMap populated during fetchAll.
 *
 * @param {Array} borders - Array of cca3 codes (e.g. ["DEU", "FRA"])
 * @returns {Array} - Array of country common names
 */
function transformBorderNames(borders) {
  if (!borders) return [];
  if (!Array.isArray(borders)) return [borders];
  return borders.map((border) => cca3ToNameMap[border]);
}

export {
  fetchAll,
  fetchCountryInfo,
  filterBySearch,
  filterByRegion,
  resetActiveFilters,
  allCountries,
  cca3ToNameMap,
  transformBorderNames,
};

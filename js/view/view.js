import { fetchAll, fetchCountryInfo } from "../data/data.js";
import {
  ALL,
  DARK_THEME,
  LIGHT_THEME,
  LIGHT_THEME_TEXT,
  LIGHT_THEME_LOGO,
  DARK_THEME_TEXT,
  DARK_THEME_LOGO,
} from "../data/constants.js";

const root = document.documentElement;
const countries = document.querySelector(".js-countries");
const toolbar = document.querySelector(".js-toolbar");
const searchBar = document.querySelector(".js-toolbar__search-inp");
const filterOptions = document.querySelector(".js-toolbar__filter-options");
const toolbarFilterText = document.querySelector(".js-toolbar__filter-text");
const logo = document.querySelector(".js-theme-logo");
const themeText = document.querySelector(".js-theme-text");
const countryDetail = document.querySelector(".js-country-detail");

/**
 * Render country cards into the countries section.
 * Shows an error message if data is invalid, or a not-found message if empty.
 *
 * @param {Array} data - Array of country card objects to render
 */
function renderCountryCards(data) {
  if (!Array.isArray(data)) {
    countries.innerHTML = "<div>Failed to load countries.</div>";
    return;
  }

  if (data.length === 0) {
    countries.innerHTML = `<div>
        <p>No countries found.</p>
        <small>Try adjusting your search or filter.</small>
    </div>`;
    return;
  }

  let countrysHTML = data
    .map(({ name, population, region, capital, flags }) => {
      return `
      <article class="country-card" data-name="${name}" data-region="${region}" tabindex="0" role="button">
        <div class="country-card__image-wrapper">
          <img
            draggable="false"
            loading="lazy"
            class="country-card__image"
            src="${flags.svg}"  
            alt="${flags.alt}"
          />
        </div>
        <div class="country-card__content">
          <h2 class="country-card__name text-preset-3">${name}</h2>
          <ul class="country-card__meta">
            <li class="country-card__meta-item">
              <strong class="text-preset-5-semibold">Population: </strong>
              <span class="country-card__value text-preset-5-regular">
                ${population}
              </span>
            </li>
            <li class="country-card__meta-item">
              <strong class="text-preset-5-semibold">Region: </strong>
              <span class="country-card__value text-preset-5-regular">
                ${region}
              </span>
            </li>
            <li class="country-card__meta-item">
              <strong class="text-preset-5-semibold">Capital: </strong>
              <span class="country-card__value text-preset-5-regular">
                ${capital}
              </span>
            </li>
          </ul>
        </div>
      </article>`;
    })
    .join("");
  countries.innerHTML = countrysHTML;
}

/**
 * Fetch and render the full detail view for a country.
 *
 * @param {string} countryName - The common name of the country to display
 * @returns {Promise<void>}
 */
async function renderCountryDetail(countryName) {
  if (!countryName) return;

  const country = await fetchCountryInfo(countryName);

  const {
    name,
    nativeName,
    population,
    region,
    subregion,
    capital,
    tld,
    currencies,
    languages,
    borders,
    flags,
  } = country;

  const countryDetailHTML = `
    <a class="back-link js-back-link" href="/" role="button" draggable="false">
      <span class="iconfont">&#xe671; </span>Back</a>
      <article>
        <section class="country-image">
          <img src="${flags.svg}" alt="${flags.alt}" draggable="false" />
        </section>
        <section class="country-description">
          <h2 class="text-preset-1">${name}</h2>
          <div class="country-detail__info text-preset-5-light">
            <ul>
              <li>
                <strong class="text-preset-5-semibold">Native Name: </strong
                ><span>${nativeName}</span>
              </li>
              <li>
                <strong class="text-preset-5-semibold">Population: </strong
                ><span>${population} </span>
              </li>
              <li>
                <strong class="text-preset-5-semibold">Region: </strong
                ><span>${region}</span>
              </li>
              <li>
                <strong class="text-preset-5-semibold">Sub Region: </strong
                ><span>${subregion}</span>
              </li>
              <li>
                <strong class="text-preset-5-semibold">Capital: </strong
                ><span>${capital} </span>
              </li>
            </ul>
            <ul>
              <li>
                <strong class="text-preset-5-semibold"
                  >Top Level Domain: </strong
                ><span>${tld}</span>
              </li>
              <li>
                <strong class="text-preset-5-semibold">Currencies: </strong
                ><span>${currencies} </span>
              </li>
              <li>
                <strong class="text-preset-5-semibold">Languages: </strong
                ><span>${languages}</span>
              </li>
            </ul>
          </div>
          <div class="country-detail__borders">
            <strong class="text-preset-5-semibold">Border Countries: </strong>
            <ul class="text-preset-5-light">
              ${renderBorders(borders)}
            </ul>
          </div>
        </section>
      </article>
    `;

  countryDetail.innerHTML = countryDetailHTML;
}

/**
 * Render border country list items from an array of country names.
 * Returns a "None" item if borders is empty or not an array.
 *
 * @param {Array} borders - Array of border country names
 * @returns {string} - HTML string of <li> elements
 */
function renderBorders(borders) {
  if (!Array.isArray(borders) || borders.length === 0) {
    console.warn("Argument: borders is not an array or empty.");
    return `<li class="no-border">None</li>`;
  }
  return borders
    .map((border) => {
      return `<li class="border js-border" tabindex="0" role="button" data-name="${border}">${border}</li>`;
    })
    .join("");
}

/**
 * Initialize the app by fetching all countries and rendering the country cards.
 *
 * @returns {Promise<void>}
 */
async function init() {
  const data = await fetchAll();
  renderCountryCards(data);
}

/**
 * Show the country detail view for the given target element.
 * Hides the toolbar and country grid while the detail is visible.
 *
 * @param {HTMLElement} target - Element with a data-name attribute for the country
 * @returns {Promise<void>}
 */
async function showCountryDetail(target) {
  const countryName = target.dataset.name?.trim();

  if (countryName) {
    await renderCountryDetail(countryName);
    countryDetail.style.display = "block";
    toolbar.style.display = "none";
    countries.style.display = "none";
  }
}

/**
 * Hide the country detail view and restore the toolbar and country grid.
 */
function hideCountryDetail() {
  countryDetail.style.display = "none";
  toolbar.style.display = "flex";
  countries.style.display = "grid";
}

/**
 * Update the filter dropdown label text.
 *
 * @param {string} text - The text to display (e.g. "Europe" or "Filter by Region")
 */
function changeFilterText(text) {
  toolbarFilterText.textContent = text;
}

/**
 * Toggle the filter options dropdown open or closed.
 */
function toggleFilterOptions() {
  if (filterOptions) {
    filterOptions.classList.toggle("hidden");
  }
}

/**
 * Update the country cards and filter label after a region is selected.
 *
 * @param {string} currentRegion - The selected region label
 * @param {Array} filteredData - Filtered array of country card objects
 */
function updateFilterOptions(currentRegion, filteredData) {
  renderCountryCards(filteredData);
  changeFilterText(currentRegion);
}

/**
 * Determine the next theme based on the current one.
 *
 * @param {string} currentTheme - The current theme ("light" or "dark")
 * @returns {string} - The next theme to apply
 */
function getNextTheme(currentTheme) {
  return currentTheme === LIGHT_THEME ? DARK_THEME : LIGHT_THEME;
}

/**
 * Apply a theme to the root element and update the theme toggle UI.
 *
 * @param {string} nextTheme - The theme to apply ("light" or "dark")
 */
function applyTheme(nextTheme) {
  root.setAttribute("data-theme", nextTheme);
  const isLight = nextTheme === LIGHT_THEME;

  logo.innerHTML = isLight ? LIGHT_THEME_LOGO : DARK_THEME_LOGO;
  themeText.textContent = isLight ? LIGHT_THEME_TEXT : DARK_THEME_TEXT;
}

/**
 * Toggle between light and dark theme.
 */
function toggleTheme() {
  let currentTheme = root.getAttribute("data-theme");
  const nextTheme = getNextTheme(currentTheme);
  applyTheme(nextTheme);
}

/**
 * Reset the filter dropdown to its default state (hidden, showing "Filter by Region").
 */
function resetFilterOptions() {
  filterOptions.classList.add("hidden");
  changeFilterText(ALL);
}

/**
 * Clear the search bar input.
 *
 * @param {HTMLInputElement} searchBar - The search input element to clear
 */
function resetSearchBar(searchBar) {
  searchBar.value = "";
}

/**
 * Reset the home view — re-fetch all countries, hide detail view,
 * clear search, reset filter, and re-render country cards.
 *
 * @returns {Promise<void>}
 */
async function resetHomeView() {
  const allCountries = await fetchAll();
  hideCountryDetail();
  resetSearchBar(searchBar);
  resetFilterOptions();
  renderCountryCards(allCountries);
}

export {
  init,
  renderCountryCards,
  renderCountryDetail,
  showCountryDetail,
  hideCountryDetail,
  toggleFilterOptions,
  changeFilterText,
  toggleTheme,
  updateFilterOptions,
  resetHomeView,
};

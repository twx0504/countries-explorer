import { debounce } from "./utils/debounce.js";

import { saveToStorage, loadFromStorage } from "./utils/storage.js";
import {
  fetchAll,
  createCardData,
  setCCA3ToNameMap,
  applyFilters,
  sortInAlphabeticalOrder,
} from "./data/data.js";
import {
  renderCountryCards,
  showCountryDetail,
  hideCountryDetail,
  toggleFilterOptions,
  updateFilterOptions,
  toggleTheme,
  resetHomeView,
  resetSearchBar,
  applyTheme,
} from "./view/view.js";
import { CCA3_TO_NAME, REST_COUNTRIES, THEME } from "./data/constants.js";

// DOM References
const searchBar = document.querySelector(".js-toolbar__search-inp");
const countries = document.querySelector(".js-countries");

let countriesCache = [];
let activeRegion = "";
let activeSearch = "";

init();

/**
 * Initialize the app by fetching all countries and rendering the country cards.
 *
 * @returns {Promise<void>}
 */
async function init() {
  countriesCache = loadFromStorage(REST_COUNTRIES);
  const cca3ToNameCache = loadFromStorage(CCA3_TO_NAME);
  const themeCache = loadFromStorage(THEME);

  if (themeCache) {
    applyTheme(themeCache);
  }

  if (countriesCache && cca3ToNameCache) {
    renderCountryCards(countriesCache);
    setCCA3ToNameMap(cca3ToNameCache);
    return;
  }

  const { countries, cca3ToName } = await fetchAll();

  let cardData = createCardData(countries);
  cardData = sortInAlphabeticalOrder(cardData);
  countriesCache = cardData;
  setCCA3ToNameMap(cca3ToName);
  resetActiveFilters();
  saveToStorage(REST_COUNTRIES, cardData);
  saveToStorage(CCA3_TO_NAME, cca3ToName);
  renderCountryCards(cardData);
}

/**
 * Reset active region and search filter state to their defaults.
 * Called on fetchAll to ensure a clean state on re-initialization.
 */
function resetActiveFilters() {
  activeRegion = "";
  activeSearch = "";
}
// Filter

/**
 * Filters country cards by the selected region and updates the filter UI.
 * @param {HTMLElement} target - The clicked filter item element.
 */
function handleFilterOptions(target) {
  const selectedRegion = target.dataset.region;
  activeRegion = selectedRegion;

  if (activeRegion === "") {
    resetActiveFilters();
    resetSearchBar(searchBar);
  }

  const filteredData = applyFilters(countriesCache, {
    region: activeRegion,
    search: activeSearch,
  });

  updateFilterOptions(activeRegion, filteredData);
  toggleFilterOptions();
}

// Search

const debouncedHandleSearch = debounce(handleSearch);

searchBar.addEventListener("input", debouncedHandleSearch);

/**
 * Handles search input and renders filtered country cards.
 * @param {InputEvent} e - The input event from the search bar.
 */
function handleSearch(e) {
  const searchText = e.target.value.trim();
  activeSearch = searchText;
  const filteredData = applyFilters(countriesCache, {
    search: activeSearch,
    region: activeRegion,
  });
  renderCountryCards(filteredData);
}

// Events — delegate click and keyboard (Enter) to a shared handler

document.addEventListener("click", handleActions);

document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  handleActions(e);
});

/**
 * Handles delegated click and keyboard (Enter) events across the app.
 * Routes actions based on the event target.
 * @param {MouseEvent|KeyboardEvent} e - The triggering event.
 */
function handleActions(e) {
  const target = e.target;

  // Navigate home
  if (target.classList.contains("js-header__home-link")) {
    e.preventDefault();
    return resetHomeView(countriesCache);
  }

  // Toggle light/dark theme
  if (target.closest(".js-header__theme-toggle")) {
    return toggleTheme();
  }

  // Filter dropdown — item click filters, anything else toggles open/close
  if (target.closest(".js-toolbar__filter")) {
    if (target.classList.contains("js-toolbar__filter-item")) {
      return handleFilterOptions(target);
    }
    return toggleFilterOptions();
  }

  // Go back from country detail to home
  if (target.classList.contains("js-back-link")) {
    console.log("click");
    e.preventDefault();
    return hideCountryDetail();
  }

  // Show a bordering country from the detail view
  if (target.classList.contains("js-border")) {
    return showCountryDetail(target);
  }

  // Show country detail when clicking a country card
  const article = target.closest("article");
  if (countries.contains(article)) {
    return showCountryDetail(article);
  }
}

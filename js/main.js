import { debounce } from "./utils/debounce.js";
import { filterByRegion, filterBySearch } from "./data/data.js";
import {
  init,
  renderCountryCards,
  showCountryDetail,
  hideCountryDetail,
  toggleFilterOptions,
  updateFilterOptions,
  toggleTheme,
  resetHomeView,
} from "./view/view.js";

// DOM References
const searchBar = document.querySelector(".js-toolbar__search-inp");
const countries = document.querySelector(".js-countries");

init();

// Filter

/**
 * Filters country cards by the selected region and updates the filter UI.
 * @param {HTMLElement} target - The clicked filter item element.
 */
function handleFilterOptions(target) {
  const currentRegion = target.dataset.region;
  const filteredData = filterByRegion(currentRegion);
  updateFilterOptions(currentRegion, filteredData);
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
  const filteredData = filterBySearch(searchText);
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
    return resetHomeView();
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

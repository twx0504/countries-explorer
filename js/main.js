const html = document.documentElement;
const themeToggle = document.querySelector(".js-header__theme-toggle");
const filter = document.querySelector(".js-toolbar__filter-toggle");
const filterOptions = document.querySelector(".js-toolbar__filter-options");
const searchBar = document.querySelector(".js-toolbar__search-inp");
const logo = document.querySelector(".js-theme-logo");
const themeText = document.querySelector(".js-theme-text");
const LIGHT_THEME = "light";
const DARK_THEME = "dark";

// Theme
themeToggle.addEventListener("click", () => {
  let theme = html.getAttribute("data-theme");
  if (theme === LIGHT_THEME) {
    html.setAttribute("data-theme", DARK_THEME);
    logo.innerHTML = "&#xe6a2;";
    themeText.textContent = "Light Mode";
  } else {
    html.setAttribute("data-theme", LIGHT_THEME);
    logo.innerHTML = "&#xe600;";
    themeText.textContent = "Dark Mode";
  }
});

// Filter
// TODO: 1. Figure out mouseenter, mouseleave and the options list disappear issue.
filter.addEventListener("click", (e) => {
  if (filterOptions) {
    filterOptions.classList.toggle("hidden");
  }
});

// Filter Options
// TODO: 1. get the region text, 2. filter out the data to be displayed, 3. render
if (filterOptions) {
  filterOptions.addEventListener("click", (e) => {
    const target = e.target.closest("li");
    if (target.tagName !== "LI") return;
    // Filter data to be display in countries.
    // Render
  });
}

// Search
// TODO: 1. get the value from search bar. 2. filter out the data to be displayed, 3. render
searchBar.addEventListener("input", (e) => {
  const val = e.target.value;
  console.log(val);
});

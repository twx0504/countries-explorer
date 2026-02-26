TODO:

1. Implement localStorage

    - Implemented loadFromStorage, saveToStorage, clearStorage 
    - Implemented theme cache.

2. Restructure Code
    - filter logic -> removed filterByRegion & filterBySearch, in place with applyFilters
    - Removed allCountries in data.js
    - Moved localStorage logic to data.js
3. Fix card scale up and appear above filter options by adding z-index:100.
4. Fix Nepal Flag image background transparent issue -> Set as #fff in dark theme.
5. Fix clicking on Countries Explorer header and loading failed issue
    - It is due to resetHomeView inner fetchAll and renderCountries using countries instead of cardData.
6. Show countries in alphabetical order.
7. TODO: Keydown event: ESC to back to home view.
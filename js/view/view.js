import { fetchAll } from "../data/data.js";

const countries = document.querySelector(".countries");

export async function renderCountryCards() {
  let res = await fetchAll();
  let countrysHTML = res
    .map(
      ({ name, population, region, capital, flags }) =>
        `<article class="country-card" data-name=${name.common} data-region=${region}>
      <div class="country-card__image-wrapper">
        <img
          loading="lazy"
          class="country-card__image"
          src="${flags.svg}"
          alt="${flags.alt}"
        />
      </div>
      <div class="country-card__content">
        <h2 class="country-card__name text-preset-3">${name.common}</h2>
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
    </article>`,
    )
    .join("\n");
  countries.innerHTML = countrysHTML;
}

export function renderCountryDetail() {}

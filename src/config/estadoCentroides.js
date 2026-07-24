/**
 * Approximate centroid coordinates for each Brazilian state (UF), used
 * as a fallback marker position on `BrazilMap` when a municipality
 * entity does not carry its own lat/lng (the IBGE localidades API does
 * not return geographic coordinates).
 */
export const ESTADO_CENTROIDES = {
  AC: [-9.0238, -70.812],
  AL: [-9.5713, -36.782],
  AP: [1.4148, -51.7754],
  AM: [-3.4168, -65.8561],
  BA: [-12.5797, -41.7007],
  CE: [-5.4984, -39.3206],
  DF: [-15.7998, -47.8645],
  ES: [-19.1834, -40.3089],
  GO: [-15.827, -49.8362],
  MA: [-4.9609, -45.2744],
  MT: [-12.6819, -56.9211],
  MS: [-20.7722, -54.7852],
  MG: [-18.5122, -44.555],
  PA: [-3.9019, -52.4783],
  PB: [-7.24, -36.782],
  PR: [-24.89, -51.55],
  PE: [-8.8137, -36.9541],
  PI: [-7.7183, -42.7289],
  RJ: [-22.9068, -43.2096],
  RN: [-5.4026, -36.9541],
  RS: [-30.0346, -51.2177],
  RO: [-11.5057, -63.5806],
  RR: [2.7376, -62.0751],
  SC: [-27.2423, -50.2189],
  SP: [-23.5505, -46.6333],
  SE: [-10.5741, -37.3857],
  TO: [-10.1753, -48.2982],
}

export default ESTADO_CENTROIDES

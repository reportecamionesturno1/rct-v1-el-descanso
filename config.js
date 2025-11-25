/*
  config.js – Parámetros de configuración del proyecto
  - GAS_ENDPOINT: URL del WebApp de Google Apps Script (backend)
  - FLAGS: banderas de desarrollo/producción
*/

const GAS_ENDPOINT = ""; // Ejemplo: "https://script.google.com/macros/s/AKfycb.../exec"
const FLAGS = {
  ENV: "dev",           // "dev" | "prod"
  ENABLE_BACKEND: false // cuando lo conectes, cambia a true y usa sendToBackend()
};

// Puedes exponerlos en window si lo requieres en otras partes
window.__RCT_CONFIG__ = { GAS_ENDPOINT, FLAGS };
export { GAS_ENDPOINT, FLAGS };
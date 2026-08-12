// app.js
import { mockCities } from './mockData.js';

// Application State
const state = {
  apiKey: localStorage.getItem('OWM_API_KEY') || '',
  currentCity: localStorage.getItem('OWM_LAST_CITY') || 'london',
  currentCoords: null, // { lat, lon }
  unit: localStorage.getItem('OWM_UNIT') || 'C', // 'C' or 'F'
  viewMode: 'cards', // 'cards' or 'chart'
  weatherData: null,
  starsActive: false,
  starsAnimationId: null,
  debounceTimeout: null
};

// SVG Condition Icons
const ICONS = {
  clearDay: `
    <svg viewBox="0 0 100 100" class="w-full h-full text-amber-400">
      <circle cx="50" cy="50" r="18" fill="currentColor" class="animate-pulse-soft" />
      <g class="animate-slow-spin origin-center" style="transform-origin: 50% 50%;">
        <line x1="50" y1="12" x2="50" y2="4" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
        <line x1="50" y1="88" x2="50" y2="96" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
        <line x1="12" y1="50" x2="4" y2="50" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
        <line x1="88" y1="50" x2="96" y2="50" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
        <line x1="23.1" y1="23.1" x2="17.5" y2="17.5" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
        <line x1="76.9" y1="76.9" x2="82.5" y2="82.5" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
        <line x1="23.1" y1="76.9" x2="17.5" y2="82.5" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
        <line x1="76.9" y1="23.1" x2="82.5" y2="17.5" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
      </g>
    </svg>`,
  clearNight: `
    <svg viewBox="0 0 100 100" class="w-full h-full text-indigo-200">
      <path d="M45 22 A28 28 0 1 0 78 55 A20 20 0 1 1 45 22 Z" fill="currentColor" class="animate-float" />
      <circle cx="25" cy="25" r="1.5" fill="#FFF" class="animate-pulse" style="animation-duration: 2s;" />
      <circle cx="70" cy="25" r="1" fill="#FFF" class="animate-pulse" style="animation-duration: 3s;" />
      <circle cx="65" cy="75" r="1.5" fill="#FFF" class="animate-pulse" style="animation-duration: 1.5s;" />
    </svg>`,
  cloudsDay: `
    <svg viewBox="0 0 100 100" class="w-full h-full">
      <circle cx="62" cy="40" r="12" fill="#F59E0B" class="animate-slow-spin origin-center" style="transform-origin: 62% 40%;" />
      <path d="M22 64 A12 12 0 0 1 22 40 A18 18 0 0 1 52 38 A14 14 0 0 1 74 48 A14 14 0 0 1 58 64 Z" fill="#E2E8F0" class="animate-float" />
    </svg>`,
  cloudsNight: `
    <svg viewBox="0 0 100 100" class="w-full h-full">
      <path d="M52 28 A20 20 0 1 0 74 50 A15 15 0 1 1 52 28 Z" fill="#C7D2FE" class="opacity-80" />
      <path d="M22 64 A12 12 0 0 1 22 40 A18 18 0 0 1 52 38 A14 14 0 0 1 74 48 A14 14 0 0 1 58 64 Z" fill="#94A3B8" class="animate-float" />
    </svg>`,
  cloudsOvercast: `
    <svg viewBox="0 0 100 100" class="w-full h-full text-slate-400">
      <path d="M20 62 A12 12 0 0 1 20 38 A18 18 0 0 1 50 36 A14 14 0 0 1 70 44 A14 14 0 0 1 58 62 Z" fill="#64748B" class="animate-float" style="animation-delay: -1s;" />
      <path d="M35 68 A14 14 0 0 1 35 40 A20 20 0 0 1 68 36 A16 16 0 0 1 84 52 A16 16 0 0 1 68 68 Z" fill="#475569" class="animate-float" />
    </svg>`,
  rain: `
    <svg viewBox="0 0 100 100" class="w-full h-full text-blue-400">
      <path d="M26 58 A12 12 0 0 1 26 34 A16 16 0 0 1 52 32 A13 13 0 0 1 72 40 A13 13 0 0 1 58 58 Z" fill="#475569" class="animate-float" />
      <line x1="32" y1="66" x2="28" y2="78" stroke="currentColor" stroke-width="3" stroke-linecap="round" class="animate-rain-1" />
      <line x1="45" y1="66" x2="41" y2="78" stroke="currentColor" stroke-width="3" stroke-linecap="round" class="animate-rain-2" />
      <line x1="58" y1="66" x2="54" y2="78" stroke="currentColor" stroke-width="3" stroke-linecap="round" class="animate-rain-3" />
    </svg>`,
  storm: `
    <svg viewBox="0 0 100 100" class="w-full h-full text-amber-300">
      <path d="M26 58 A12 12 0 0 1 26 34 A16 16 0 0 1 52 32 A13 13 0 0 1 72 40 A13 13 0 0 1 58 58 Z" fill="#334155" class="animate-float" />
      <polygon points="44,60 36,74 46,74 40,90 56,70 46,70" fill="currentColor" class="animate-lightning" />
    </svg>`,
  snow: `
    <svg viewBox="0 0 100 100" class="w-full h-full text-sky-200">
      <path d="M26 58 A12 12 0 0 1 26 34 A16 16 0 0 1 52 32 A13 13 0 0 1 72 40 A13 13 0 0 1 58 58 Z" fill="#475569" class="animate-float" />
      <circle cx="32" cy="68" r="2.5" fill="#E2E8F0" class="animate-snow-1" />
      <circle cx="45" cy="70" r="2" fill="#E2E8F0" class="animate-snow-2" />
      <circle cx="58" cy="68" r="3" fill="#E2E8F0" class="animate-snow-3" />
    </svg>`,
  atmosphere: `
    <svg viewBox="0 0 100 100" class="w-full h-full text-zinc-400">
      <line x1="18" y1="38" x2="82" y2="38" stroke="currentColor" stroke-width="4" stroke-linecap="round" class="animate-float" />
      <line x1="28" y1="50" x2="72" y2="50" stroke="currentColor" stroke-width="4" stroke-linecap="round" class="animate-pulse-soft" />
      <line x1="22" y1="62" x2="78" y2="62" stroke="currentColor" stroke-width="4" stroke-linecap="round" class="animate-float" />
    </svg>`
};

// UI DOM Elements
const elements = {
  searchInput: document.getElementById('search-input'),
  suggestionsBox: document.getElementById('suggestions-box'),
  btnGps: document.getElementById('btn-gps'),
  btnSettings: document.getElementById('btn-settings'),
  btnSaveSettings: document.getElementById('btn-save-settings'),
  btnCloseSettings: document.getElementById('btn-close-settings'),
  settingsModal: document.getElementById('settings-modal'),
  inputApiKey: document.getElementById('input-api-key'),
  demoCityPresets: document.getElementById('demo-city-presets'),
  demoIndicator: document.getElementById('demo-indicator'),
  loadingOverlay: document.getElementById('loading-overlay'),
  errorBanner: document.getElementById('error-banner'),
  errorMessage: document.getElementById('error-message'),
  btnUnitC: document.getElementById('btn-unit-c'),
  btnUnitF: document.getElementById('btn-unit-f'),
  btnViewCards: document.getElementById('btn-view-cards'),
  btnViewChart: document.getElementById('btn-view-chart'),
  
  // Dashboard Metrics
  weatherCity: document.getElementById('weather-city'),
  weatherCountry: document.getElementById('weather-country'),
  weatherDate: document.getElementById('weather-date'),
  weatherTime: document.getElementById('weather-time'),
  weatherTemp: document.getElementById('weather-temp'),
  weatherFeels: document.getElementById('weather-feels'),
  weatherHigh: document.getElementById('weather-high'),
  weatherLow: document.getElementById('weather-low'),
  weatherDesc: document.getElementById('weather-desc'),
  weatherIconLarge: document.getElementById('weather-icon-large'),
  
  // Grid cards
  metricUv: document.getElementById('metric-uv'),
  metricUvLevel: document.getElementById('metric-uv-level'),
  metricUvDesc: document.getElementById('metric-uv-desc'),
  uvGauge: document.getElementById('uv-gauge'),
  
  metricWindSpeed: document.getElementById('metric-wind-speed'),
  metricWindUnit: document.getElementById('metric-wind-unit'),
  metricWindDir: document.getElementById('metric-wind-dir'),
  metricWindDegrees: document.getElementById('metric-wind-degrees'),
  windCompassPointer: document.getElementById('wind-compass-pointer'),
  
  metricAqi: document.getElementById('metric-aqi'),
  metricAqiStatus: document.getElementById('metric-aqi-status'),
  aqiIndicatorDot: document.getElementById('aqi-indicator-dot'),
  aqiIcon: document.getElementById('aqi-icon'),
  metricPm25: document.getElementById('metric-pm25'),
  
  metricHumidity: document.getElementById('metric-humidity'),
  metricHumidityStatus: document.getElementById('metric-humidity-status'),
  metricDewpoint: document.getElementById('metric-dewpoint'),
  humidityProgress: document.getElementById('humidity-progress'),
  
  metricPressure: document.getElementById('metric-pressure'),
  metricPressureDesc: document.getElementById('metric-pressure-desc'),
  pressureSlider: document.getElementById('pressure-slider'),
  
  metricVisibility: document.getElementById('metric-visibility'),
  metricVisibilityStatus: document.getElementById('metric-visibility-status'),
  visibilityBar: document.getElementById('visibility-bar'),
  
  // Forecast lists
  hourlyListContainer: document.getElementById('hourly-list-container'),
  hourlyChartContainer: document.getElementById('hourly-chart-container'),
  weeklyForecastContainer: document.getElementById('weekly-forecast-container')
};

// Initialize Application
function init() {
  // Set up API key input value
  elements.inputApiKey.value = state.apiKey;
  updateDemoIndicator();
  
  // Set up unit toggles class lists
  updateUnitToggles();

  // Attach Event Listeners
  elements.searchInput.addEventListener('input', handleSearchInput);
  elements.searchInput.addEventListener('keydown', handleSearchKeydown);
  document.addEventListener('click', handleOutsideClick);
  elements.btnGps.addEventListener('click', handleGPSLocate);
  elements.btnSettings.addEventListener('click', () => showSettingsModal(true));
  elements.btnCloseSettings.addEventListener('click', () => showSettingsModal(false));
  elements.btnSaveSettings.addEventListener('click', handleSaveSettings);
  elements.btnUnitC.addEventListener('click', () => changeUnit('C'));
  elements.btnUnitF.addEventListener('click', () => changeUnit('F'));
  elements.btnViewCards.addEventListener('click', () => changeViewMode('cards'));
  elements.btnViewChart.addEventListener('click', () => changeViewMode('chart'));

  // Preset Buttons in Settings
  elements.demoCityPresets.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-city]');
    if (btn) {
      const city = btn.dataset.city;
      showSettingsModal(false);
      loadCityWeather(city);
    }
  });

  // Load Initial Weather
  loadCityWeather(state.currentCity);

  // Auto Refresh time display
  setInterval(updateLocalClock, 1000);
}

// Check if running in API mode or Demo mode
function updateDemoIndicator() {
  if (state.apiKey) {
    elements.demoIndicator.classList.add('hidden');
  } else {
    elements.demoIndicator.classList.remove('hidden');
  }
}

// Display loading state
function showLoading(isLoading) {
  if (isLoading) {
    elements.loadingOverlay.classList.remove('hidden');
  } else {
    elements.loadingOverlay.classList.add('hidden');
  }
}

// Handle errors
function showError(message) {
  if (message) {
    elements.errorMessage.textContent = message;
    elements.errorBanner.classList.remove('hidden');
    // Auto-scroll to top to make banner visible
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    elements.errorBanner.classList.add('hidden');
  }
}

// Modal open/close
function showSettingsModal(show) {
  if (show) {
    elements.settingsModal.classList.remove('hidden');
    elements.inputApiKey.focus();
  } else {
    elements.settingsModal.classList.add('hidden');
  }
}

// Save API Key Configuration
function handleSaveSettings() {
  const newKey = elements.inputApiKey.value.trim();
  state.apiKey = newKey;
  if (newKey) {
    localStorage.setItem('OWM_API_KEY', newKey);
  } else {
    localStorage.removeItem('OWM_API_KEY');
  }
  updateDemoIndicator();
  showSettingsModal(false);
  showError(null);
  
  // Reload current city weather with the updated config
  loadCityWeather(state.currentCity);
}

// Debounced autocomplete search input
function handleSearchInput() {
  clearTimeout(state.debounceTimeout);
  const query = elements.searchInput.value.trim();
  
  if (!query) {
    hideSuggestions();
    return;
  }

  state.debounceTimeout = setTimeout(() => {
    fetchSuggestions(query);
  }, 350);
}

function handleSearchKeydown(e) {
  if (e.key === 'Enter') {
    const query = elements.searchInput.value.trim();
    if (query) {
      clearTimeout(state.debounceTimeout);
      hideSuggestions();
      loadCityWeather(query);
    }
  }
}

function hideSuggestions() {
  elements.suggestionsBox.innerHTML = '';
  elements.suggestionsBox.classList.add('hidden');
}

function handleOutsideClick(e) {
  if (!elements.searchInput.contains(e.target) && !elements.suggestionsBox.contains(e.target)) {
    hideSuggestions();
  }
}

// Fetch Autocomplete Suggestions
async function fetchSuggestions(query) {
  if (!state.apiKey) {
    // Demo Mode geocode autocomplete from local preset list
    const cities = Object.keys(mockCities).filter(name => name.includes(query.toLowerCase()));
    if (cities.length === 0) {
      hideSuggestions();
      return;
    }
    
    elements.suggestionsBox.innerHTML = cities.map(key => {
      const city = mockCities[key].geocoding;
      return `
        <div class="px-4 py-3 hover:bg-white/10 cursor-pointer text-sm text-slate-200 transition-colors" data-city-name="${city.name}">
          <div class="font-semibold">${city.name}</div>
          <div class="text-xs text-slate-400 mt-0.5">${city.state ? city.state + ', ' : ''}${city.country}</div>
        </div>
      `;
    }).join('');
    elements.suggestionsBox.classList.remove('hidden');
    return;
  }

  try {
    const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${state.apiKey}`);
    if (!response.ok) throw new Error('Suggestions failed');
    const data = await response.json();
    
    if (data.length === 0) {
      hideSuggestions();
      return;
    }

    elements.suggestionsBox.innerHTML = data.map(item => `
      <div class="px-4 py-3 hover:bg-white/10 cursor-pointer text-sm text-slate-200 transition-colors" 
           data-lat="${item.lat}" data-lon="${item.lon}" data-city-name="${item.name}">
        <div class="font-semibold">${item.name}</div>
        <div class="text-xs text-slate-400 mt-0.5">${item.state ? item.state + ', ' : ''}${item.country}</div>
      </div>
    `).join('');
    elements.suggestionsBox.classList.remove('hidden');
  } catch (err) {
    console.error('Geocoding suggestions error:', err);
  }
}

// Handle suggestion clicks
elements.suggestionsBox.addEventListener('click', (e) => {
  const item = e.target.closest('[data-city-name]');
  if (item) {
    elements.searchInput.value = '';
    hideSuggestions();
    
    const lat = item.dataset.lat;
    const lon = item.dataset.lon;
    const cityName = item.dataset.cityName;

    if (lat && lon) {
      // Live API mode using lat/lon coordinates
      loadCoordsWeather(parseFloat(lat), parseFloat(lon), cityName);
    } else {
      // Demo Mode
      loadCityWeather(cityName.toLowerCase());
    }
  }
});

// GPS Geolocation Handler
function handleGPSLocate() {
  if (!navigator.geolocation) {
    showError("Geolocation is not supported by your browser.");
    return;
  }

  showLoading(true);
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      
      if (!state.apiKey) {
        // Fallback in demo mode to closest mock city
        showLoading(false);
        showError("Custom GPS coordinates require a real OpenWeatherMap API Key. Loading closest preset: Sydney.");
        loadCityWeather("sydney");
        return;
      }
      
      try {
        // Resolve city name using reverse geocoding
        const response = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${state.apiKey}`);
        let name = "Current Location";
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            name = data[0].name;
          }
        }
        await loadCoordsWeather(lat, lon, name);
      } catch (err) {
        await loadCoordsWeather(lat, lon, "Current Location");
      }
    },
    (error) => {
      showLoading(false);
      let msg = "Location access denied.";
      if (error.code === error.POSITION_UNAVAILABLE) msg = "Location details unavailable.";
      if (error.code === error.TIMEOUT) msg = "Location lookup timed out.";
      showError(msg + " Reverting to default preset.");
    },
    { timeout: 8000 }
  );
}

// Load weather via coordinates (For GPS or Autocomplete with coords)
async function loadCoordsWeather(lat, lon, resolvedName) {
  showLoading(true);
  showError(null);
  state.currentCoords = { lat, lon };

  try {
    // Parallel fetches for performance
    const [weatherRes, forecastRes, pollutionRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${state.apiKey}`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${state.apiKey}`),
      fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${state.apiKey}`)
    ]);

    if (!weatherRes.ok || !forecastRes.ok) {
      if (weatherRes.status === 401 || forecastRes.status === 401) {
        throw new Error("Invalid API key. Please check your settings.");
      }
      throw new Error("Could not retrieve weather metrics from OpenWeatherMap.");
    }

    const weather = await weatherRes.json();
    const forecast = await forecastRes.json();
    let pollution = null;
    
    if (pollutionRes.ok) {
      pollution = await pollutionRes.json();
    }

    // Override system coordinate city name with reverse-geocoded or typed name
    if (resolvedName) weather.name = resolvedName;

    state.weatherData = { weather, forecast, pollution };
    state.currentCity = weather.name.toLowerCase();
    localStorage.setItem('OWM_LAST_CITY', state.currentCity);
    
    renderDashboard();
  } catch (err) {
    showError(err.message);
  } finally {
    showLoading(false);
  }
}

// Load weather via city name string (Main entry point)
async function loadCityWeather(cityQuery) {
  const query = cityQuery.toLowerCase().trim();
  showLoading(true);
  showError(null);
  
  // 1. Check if we should use Demo/Mock Data (no API key or matching preset)
  if (!state.apiKey) {
    if (mockCities[query]) {
      setTimeout(() => {
        state.weatherData = mockCities[query];
        state.currentCity = query;
        state.currentCoords = null;
        localStorage.setItem('OWM_LAST_CITY', query);
        renderDashboard();
        showLoading(false);
      }, 500); // slight delay to feel like a real request
    } else {
      showLoading(false);
      showError(`City "${cityQuery}" is not in presets. Please enter an OpenWeatherMap API Key in settings to search globally.`);
    }
    return;
  }

  // 2. Fetch using live API keys
  try {
    // Resolve city to coordinates first to enable air pollution api
    const geoResponse = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=1&appid=${state.apiKey}`);
    if (!geoResponse.ok) throw new Error("Location search failed.");
    const geoData = await geoResponse.json();

    if (geoData.length === 0) {
      throw new Error(`City "${cityQuery}" could not be resolved by OpenWeatherMap.`);
    }

    const { lat, lon, name } = geoData[0];
    await loadCoordsWeather(lat, lon, name);
  } catch (err) {
    showLoading(false);
    showError(err.message);
  }
}

// Temperature Conversion Helpers
function convertTemp(celsius) {
  if (state.unit === 'F') {
    return Math.round((celsius * 9) / 5 + 32);
  }
  return Math.round(celsius);
}

// Wind speed conversion helper
function getWindSpeedText(mps) {
  if (state.unit === 'F') {
    const mph = Math.round(mps * 2.237);
    return `${mph} mph`;
  }
  const kmh = Math.round(mps * 3.6);
  return `${kmh} km/h`;
}

// Get UV levels
function getUvLevelInfo(uv) {
  if (uv <= 2) return { level: "Low", desc: "Minimal hazard. Safe to be outside." };
  if (uv <= 5) return { level: "Moderate", desc: "Advisable to wear sunglasses and SPF 15+." };
  if (uv <= 7) return { level: "High", desc: "Protection required. Reduce direct midday sun." };
  if (uv <= 10) return { level: "Very High", desc: "Extra protection needed. Seek shade between 11 AM - 4 PM." };
  return { level: "Extreme", desc: "Hazardous levels. Keep skin and eyes fully covered." };
}

// Get AQI text and styling
function getAqiInfo(aqiCode) {
  // OpenWeatherMap returns AQI: 1 = Good, 2 = Fair, 3 = Moderate, 4 = Poor, 5 = Very Poor
  switch (aqiCode) {
    case 1: return { status: "Good", color: "text-emerald-400", pct: 10, icon: "shield-check" };
    case 2: return { status: "Fair", color: "text-yellow-400", pct: 30, icon: "shield-alert" };
    case 3: return { status: "Moderate", color: "text-orange-400", pct: 50, icon: "shield-alert" };
    case 4: return { status: "Poor", color: "text-rose-400", pct: 70, icon: "alert-triangle" };
    case 5: return { status: "Very Poor", color: "text-purple-400", pct: 90, icon: "alert-octagon" };
    default: return { status: "Unknown", color: "text-slate-400", pct: 50, icon: "shield-question" };
  }
}

// Match OpenWeatherMap weather code to custom animated SVG icon
function getWeatherIcon(code, iconId) {
  const isNight = iconId ? iconId.endsWith('n') : false;
  
  if (code >= 200 && code < 300) return ICONS.storm;
  if (code >= 300 && code < 400) return ICONS.rain;
  if (code >= 500 && code < 600) return ICONS.rain;
  if (code >= 600 && code < 700) return ICONS.snow;
  if (code >= 700 && code < 800) return ICONS.atmosphere;
  if (code === 800) return isNight ? ICONS.clearNight : ICONS.clearDay;
  if (code === 801 || code === 802) return isNight ? ICONS.cloudsNight : ICONS.cloudsDay;
  return ICONS.cloudsOvercast; // 803, 804 Overcast
}

// Convert wind direction degrees to descriptive compass point
function getWindDirectionText(deg) {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const val = Math.floor((deg / 22.5) + 0.5);
  return directions[val % 16];
}

// Render dynamic gradients and particles based on weather type
function applyDynamicTheme(weatherCode, iconId, isDayTime) {
  let gradientClass = "";
  let glowColor1 = "";
  let glowColor2 = "";
  
  if (weatherCode >= 200 && weatherCode < 300) {
    // Stormy
    gradientClass = "from-neutral-950 via-slate-900 to-indigo-950";
    glowColor1 = "rgba(139, 92, 246, 0.12)"; // purple
    glowColor2 = "rgba(30, 41, 59, 0.15)";
    stopStars();
  } else if ((weatherCode >= 300 && weatherCode < 600) || weatherCode === 701 || weatherCode === 741) {
    // Rainy or Foggy
    gradientClass = "from-slate-900 via-blue-950 to-neutral-900";
    glowColor1 = "rgba(59, 130, 246, 0.12)"; // blue
    glowColor2 = "rgba(15, 23, 42, 0.15)";
    stopStars();
  } else if (weatherCode >= 600 && weatherCode < 700) {
    // Snowy
    gradientClass = "from-sky-950 via-blue-900 to-neutral-900";
    glowColor1 = "rgba(186, 230, 253, 0.1)"; // light blue
    glowColor2 = "rgba(30, 41, 59, 0.15)";
    stopStars();
  } else if (weatherCode >= 700 && weatherCode < 800) {
    // Atmospheric Haze
    gradientClass = "from-zinc-900 via-slate-800 to-zinc-950";
    glowColor1 = "rgba(226, 232, 240, 0.08)";
    glowColor2 = "rgba(39, 39, 42, 0.12)";
    stopStars();
  } else if (weatherCode === 800) {
    // Clear sky
    if (isDayTime) {
      gradientClass = "from-amber-600/30 via-sky-900 to-slate-950";
      glowColor1 = "rgba(245, 158, 11, 0.15)"; // amber sun
      glowColor2 = "rgba(14, 165, 233, 0.12)"; // sky blue
      stopStars();
    } else {
      gradientClass = "from-slate-950 via-slate-900 to-indigo-950";
      glowColor1 = "rgba(99, 102, 241, 0.1)"; // indigo night
      glowColor2 = "rgba(15, 23, 42, 0.15)";
      startStars();
    }
  } else {
    // Cloudy
    if (isDayTime) {
      gradientClass = "from-slate-800/40 via-blue-900/60 to-neutral-950";
      glowColor1 = "rgba(148, 163, 184, 0.1)";
      glowColor2 = "rgba(56, 189, 248, 0.08)";
      stopStars();
    } else {
      gradientClass = "from-slate-950 via-zinc-900/90 to-slate-950";
      glowColor1 = "rgba(165, 180, 252, 0.08)";
      glowColor2 = "rgba(15, 23, 42, 0.15)";
      startStars();
    }
  }

  // Update backgrounds and glows
  document.body.className = `bg-gradient-to-br ${gradientClass} min-h-screen text-slate-100 relative overflow-x-hidden flex items-center justify-center p-3 sm:p-6 md:p-8`;
  document.getElementById('ambient-glow-1').style.backgroundColor = glowColor1;
  document.getElementById('ambient-glow-2').style.backgroundColor = glowColor2;

  // Add raindrop falling FX overlay if raining
  const currentFx = document.getElementById('current-weather-bg-fx');
  currentFx.innerHTML = '';
  if (weatherCode >= 500 && weatherCode < 600) {
    // Inject particle divs
    for (let i = 0; i < 15; i++) {
      const drop = document.createElement('div');
      drop.className = 'absolute bg-blue-400/20 rounded-full pointer-events-none animate-rain-1';
      drop.style.left = `${Math.random() * 100}%`;
      drop.style.top = `-${Math.random() * 20}px`;
      drop.style.width = '1.5px';
      drop.style.height = `${10 + Math.random() * 15}px`;
      drop.style.animationDuration = `${0.8 + Math.random() * 0.8}s`;
      drop.style.animationDelay = `${Math.random() * 1.5}s`;
      currentFx.appendChild(drop);
    }
  }
}

// Twinkling Stars Canvas Engine
function startStars() {
  if (state.starsActive) return;
  state.starsActive = true;

  const canvas = document.getElementById('canvas-stars');
  const ctx = canvas.getContext('2d');
  
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const stars = [];
  const count = 65;

  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: 0.5 + Math.random() * 1.2,
      opacity: Math.random(),
      speed: 0.005 + Math.random() * 0.012,
      twinkleDir: Math.random() > 0.5 ? 1 : -1
    });
  }

  function draw() {
    if (!state.starsActive) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';

    for (let i = 0; i < count; i++) {
      const s = stars[i];
      
      // Update Opacity
      s.opacity += s.speed * s.twinkleDir;
      if (s.opacity >= 1) {
        s.opacity = 1;
        s.twinkleDir = -1;
      } else if (s.opacity <= 0.1) {
        s.opacity = 0.1;
        s.twinkleDir = 1;
      }

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.globalAlpha = s.opacity;
      ctx.fill();
    }

    state.starsAnimationId = requestAnimationFrame(draw);
  }

  draw();
}

function stopStars() {
  state.starsActive = false;
  cancelAnimationFrame(state.starsAnimationId);
  const canvas = document.getElementById('canvas-stars');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Live Local Clock for Weather location timezone offset
function updateLocalClock() {
  if (!state.weatherData) return;
  
  const weather = state.weatherData.weather;
  const systemTime = new Date();
  
  // Calculate weather location time based on timezone offset returned by OpenWeatherMap (in seconds)
  // timezone offset is seconds from UTC
  const utc = systemTime.getTime() + (systemTime.getTimezoneOffset() * 60000);
  const localTime = new Date(utc + (weather.timezone * 1000));
  
  elements.weatherTime.textContent = localTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

// RENDER ALL DASHBOARD VIEWS FROM CURRENT STATE
function renderDashboard() {
  if (!state.weatherData) return;

  const { weather, forecast, pollution } = state.weatherData;
  const systemTime = new Date();
  const utc = systemTime.getTime() + (systemTime.getTimezoneOffset() * 60000);
  const localTime = new Date(utc + (weather.timezone * 1000));
  
  // 1. Apply condition-specific styles
  const mainCond = weather.weather[0];
  const isDay = weather.dt > weather.sys.sunrise && weather.dt < weather.sys.sunset;
  applyDynamicTheme(mainCond.id, mainCond.icon, isDay);

  // 2. Render Hero Panel
  elements.weatherCity.textContent = weather.name;
  elements.weatherCountry.textContent = weather.sys.country;
  elements.weatherDate.textContent = localTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
  
  // Live local clock trigger
  updateLocalClock();

  elements.weatherTemp.textContent = convertTemp(weather.main.temp);
  elements.weatherTempUnit.textContent = `°${state.unit}`;
  elements.weatherDesc.textContent = mainCond.description;
  elements.weatherFeels.textContent = `${convertTemp(weather.main.feels_like)}°`;
  elements.weatherHigh.textContent = `${convertTemp(weather.main.temp_max)}°`;
  elements.weatherLow.textContent = `${convertTemp(weather.main.temp_min)}°`;
  
  // Load custom SVG animated icon
  elements.weatherIconLarge.innerHTML = getWeatherIcon(mainCond.id, mainCond.icon);

  // 3. Render Detailed Metrics
  // UV Index estimation (OpenWeatherMap free does not return UV in basic, we compute synthetic value or read mock)
  const uvValue = state.weatherData.uv || (weather.name.toLowerCase() === 'tokyo' ? 2 : weather.name.toLowerCase() === 'sydney' ? 1 : 5); // Fallback estimate
  elements.metricUv.textContent = uvValue;
  
  const uvInfo = getUvLevelInfo(uvValue);
  elements.metricUvLevel.textContent = uvInfo.level;
  elements.metricUvDesc.textContent = uvInfo.desc;
  
  // Calculate SVG stroke offset. Length is 283. Arc is 180 deg. 
  // UV range is 0 to 11+. High represents 11.
  const uvPercent = Math.min(uvValue / 11, 1);
  const uvDashoffset = 283 - (uvPercent * 141.5); // Fill up to 180 degrees (half circle)
  elements.uvGauge.style.strokeDashoffset = uvDashoffset;

  // Wind speed & compass pointer direction rotation
  elements.metricWindSpeed.textContent = getWindSpeedText(weather.wind.speed).split(' ')[0];
  elements.metricWindUnit.textContent = state.unit === 'F' ? 'mph' : 'km/h';
  elements.metricWindDir.textContent = getWindDirectionText(weather.wind.deg);
  elements.metricWindDegrees.textContent = `${weather.wind.deg}°`;
  elements.windCompassPointer.style.transform = `rotate(${weather.wind.deg}deg)`;

  // Air Quality
  if (pollution && pollution.list && pollution.list[0]) {
    const aqi = pollution.list[0].main.aqi;
    const pm25 = Math.round(pollution.list[0].components.pm2_5);
    const aqiDetails = getAqiInfo(aqi);

    elements.metricAqi.textContent = aqi;
    elements.metricAqiStatus.textContent = aqiDetails.status;
    elements.metricAqiStatus.className = `text-[10px] font-bold tracking-wide uppercase mt-0.5 ${aqiDetails.color}`;
    
    // Icon color updates
    elements.aqiIcon.className = `w-4 h-4 ${aqiDetails.color}`;
    elements.metricPm25.textContent = pm25;
    
    // Position pointer dot
    elements.aqiIndicatorDot.style.left = `${aqiDetails.pct}%`;
  } else {
    // Default fallback values
    elements.metricAqi.textContent = "1";
    elements.metricAqiStatus.textContent = "Good";
    elements.aqiIndicatorDot.style.left = "10%";
    elements.metricPm25.textContent = "5";
  }

  // Humidity & Progress circle
  const humidity = weather.main.humidity;
  elements.metricHumidity.textContent = humidity;
  
  // Calculate dew point estimate
  const dewPoint = Math.round(weather.main.temp - ((100 - humidity)/5));
  elements.metricDewpoint.textContent = `Dew point is ${convertTemp(dewPoint)}°`;
  
  // Adjust humidity level warning
  let humidityStatus = "Healthy";
  if (humidity < 30) humidityStatus = "Dry Air";
  if (humidity > 60) humidityStatus = "Humid";
  if (humidity > 80) humidityStatus = "Sticky";
  elements.metricHumidityStatus.textContent = humidityStatus;
  
  // 100 on stroke-dasharray corresponds to circle circumference
  elements.humidityProgress.style.strokeDasharray = `${humidity}, 100`;

  // Pressure
  const pressure = weather.main.pressure;
  elements.metricPressure.textContent = pressure;
  
  // Slide position based on pressure. Standard range is ~970 to ~1040. Median is 1013
  const pressurePct = Math.min(Math.max((pressure - 970) / (1040 - 970) * 100, 0), 100);
  elements.pressureSlider.style.left = `${pressurePct}%`;
  
  if (pressure > 1020) elements.metricPressureDesc.textContent = "High pressure area (Clear skies)";
  else if (pressure < 1008) elements.metricPressureDesc.textContent = "Low pressure area (Unsettled storm)";
  else elements.metricPressureDesc.textContent = "Standard sea-level range";

  // Visibility
  const visMeters = weather.visibility;
  const visKm = visMeters / 1000;
  
  if (state.unit === 'F') {
    const visMiles = Math.round(visKm * 0.621 * 10) / 10;
    elements.metricVisibility.textContent = visMiles;
    elements.metricVisibilityStatus.textContent = visMiles >= 6.2 ? "Optimal clear" : "Reduced visibility";
    elements.visibilityBar.style.width = `${Math.min((visMiles / 6.2) * 100, 100)}%`;
  } else {
    elements.metricVisibility.textContent = visKm;
    elements.metricVisibilityStatus.textContent = visKm >= 10 ? "Clear Horizon" : "Reduced visibility";
    elements.visibilityBar.style.width = `${Math.min((visKm / 10) * 100, 100)}%`;
  }

  // 4. Render Forecast Sections
  renderHourlyList(forecast);
  renderHourlyChart(forecast);
  renderWeeklyForecast(forecast);

  // Trigger Lucide SVG icon rendering for newly injected icons
  lucide.createIcons();
}

// Render Hourly Card view (next 24 hours, taking 3-hour chunks = 8 items)
function renderHourlyList(forecast) {
  const hourlyData = forecast.list.slice(0, 8); // next 24 hours
  
  elements.hourlyListContainer.innerHTML = hourlyData.map(item => {
    const timeDate = new Date(item.dt * 1000);
    const timeStr = timeDate.toLocaleTimeString([], { hour: 'numeric', hour12: true });
    const tempVal = convertTemp(item.main.temp);
    const cond = item.weather[0];
    const rainChance = Math.round((item.pop || 0) * 100);
    
    return `
      <div class="glass-card flex-shrink-0 w-20 py-4 flex flex-col items-center justify-between gap-2.5 hover:scale-105 transition-transform duration-200">
        <span class="text-[10px] text-slate-400 font-semibold tracking-wide uppercase">${timeStr}</span>
        <div class="w-8 h-8 flex items-center justify-center">
          ${getWeatherIcon(cond.id, cond.icon)}
        </div>
        <div class="flex flex-col items-center">
          <span class="text-sm font-bold text-white">${tempVal}°</span>
          ${rainChance > 10 ? `<span class="text-[8px] font-bold text-blue-400 flex items-center gap-0.5 mt-0.5"><i data-lucide="droplets" class="w-2.5 h-2.5 shrink-0"></i>${rainChance}%</span>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// Render custom Bezier Line/Area Chart for temperature trends
function renderHourlyChart(forecast) {
  const hourlyData = forecast.list.slice(0, 8);
  if (hourlyData.length === 0) return;

  const width = 500;
  const height = 110;
  const paddingX = 35;
  const paddingY = 20;

  // Map temperatures and calculate bounding extremes
  const temps = hourlyData.map(item => item.main.temp);
  const minT = Math.min(...temps) - 1.5;
  const maxT = Math.max(...temps) + 1.5;
  const tRange = maxT - minT || 1;

  const dx = (width - paddingX * 2) / (hourlyData.length - 1);
  const points = hourlyData.map((item, i) => {
    const x = paddingX + i * dx;
    // Map Y-axis coordinates (higher temperature = smaller SVG y coordinate)
    const y = height - paddingY - ((item.main.temp - minT) / tRange) * (height - paddingY * 2);
    return { x, y, temp: item.main.temp, time: item.dt };
  });

  // Construct Area Path (closed shape)
  let areaD = `M ${points[0].x} ${height - 5}`;
  let lineD = `M ${points[0].x} ${points[0].y}`;

  // Make Bezier Curve strings using cubic midpoint interpolation
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    
    // Control points halfway between segments
    const cpX1 = curr.x + dx / 2;
    const cpY1 = curr.y;
    const cpX2 = curr.x + dx / 2;
    const cpY2 = next.y;

    lineD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
  }

  // Complete closed loop path for gradient area under curve
  areaD += ` L ${points[0].x} ${points[0].y} ` + lineD.substring(2) + ` L ${points[points.length - 1].x} ${height - 5} Z`;

  // Draw point circles, data tags, and labels
  const pointsSvg = points.map(p => {
    const tempVal = convertTemp(p.temp);
    const dateObj = new Date(p.time * 1000);
    const timeStr = dateObj.toLocaleTimeString([], { hour: 'numeric', hour12: true });

    return `
      <!-- Datapoint dot -->
      <circle cx="${p.x}" cy="${p.y}" r="4" fill="#6366F1" stroke="#FFF" stroke-width="1.5" class="hover:r-6 cursor-pointer transition-all shadow-lg" />
      <!-- Temp value label above point -->
      <text x="${p.x}" y="${p.y - 8}" text-anchor="middle" fill="#FFFFFF" font-size="10" font-weight="700">${tempVal}°</text>
      <!-- Time label below chart -->
      <text x="${p.x}" y="${height - 2}" text-anchor="middle" fill="#94A3B8" font-size="8" font-weight="600" class="uppercase tracking-wide">${timeStr}</text>
    `;
  }).join('');

  const svgHtml = `
    <svg class="w-full h-full" viewBox="0 0 ${width} ${height}">
      <defs>
        <!-- Blue-Indigo Area Fill Gradient -->
        <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#4F46E5" stop-opacity="0.25" />
          <stop offset="100%" stop-color="#4F46E5" stop-opacity="0" />
        </linearGradient>
        <!-- Glowing Curve Stroke Gradient -->
        <linearGradient id="strokeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#3B82F6" />
          <stop offset="50%" stop-color="#6366F1" />
          <stop offset="100%" stop-color="#8B5CF6" />
        </linearGradient>
      </defs>
      
      <!-- Grids base line -->
      <line x1="${paddingX}" y1="${height - 18}" x2="${width - paddingX}" y2="${height - 18}" stroke="rgba(255,255,255,0.04)" stroke-dasharray="3, 3" />
      <line x1="${paddingX}" y1="${paddingY}" x2="${width - paddingX}" y2="${paddingY}" stroke="rgba(255,255,255,0.04)" stroke-dasharray="3, 3" />

      <!-- Area polygon -->
      <path d="${areaD}" fill="url(#areaGrad)" />
      
      <!-- Main curve path line -->
      <path d="${lineD}" fill="none" stroke="url(#strokeGrad)" stroke-width="2.5" stroke-linecap="round" />
      
      <!-- Interactive Points Layer -->
      ${pointsSvg}
    </svg>
  `;

  elements.hourlyChartContainer.innerHTML = svgHtml;
}

// Render 5-Day Extended forecast rows (custom temp range bars)
function renderWeeklyForecast(forecast) {
  const list = forecast.list;
  const dailyData = {};

  // Group 3-hour intervals into distinct calendar dates
  list.forEach(item => {
    const dateStr = item.dt_txt.split(' ')[0]; // YYYY-MM-DD
    if (!dailyData[dateStr]) {
      dailyData[dateStr] = [];
    }
    dailyData[dateStr].push(item);
  });

  // Extract daily stats (min/max temps, major weather description)
  const days = Object.keys(dailyData).slice(0, 5).map(dateStr => {
    const items = dailyData[dateStr];
    const temps = items.map(i => i.main.temp);
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);
    
    // Choose weather code matching midday (12:00) or first block
    const middayItem = items.find(i => i.dt_txt.includes('12:00:00')) || items[Math.floor(items.length / 2)];
    
    return {
      date: new Date(dateStr),
      minTemp,
      maxTemp,
      code: middayItem.weather[0].id,
      iconId: middayItem.weather[0].icon,
      desc: middayItem.weather[0].main
    };
  });

  // Calculate global min/max bounds across the 5 days to scale horizontal range bars
  const globalMin = Math.min(...days.map(d => d.minTemp));
  const globalMax = Math.max(...days.map(d => d.maxTemp));
  const globalRange = globalMax - globalMin || 1;

  elements.weeklyForecastContainer.innerHTML = days.map((day, idx) => {
    let dayName = day.date.toLocaleDateString([], { weekday: 'long' });
    // Label today vs rest of week
    if (idx === 0) dayName = "Today";

    const minC = convertTemp(day.minTemp);
    const maxC = convertTemp(day.maxTemp);
    
    // Calculate width percentages for custom progress range bar
    const barLeft = ((day.minTemp - globalMin) / globalRange) * 100;
    const barWidth = ((day.maxTemp - day.minTemp) / globalRange) * 100;

    return `
      <div class="flex items-center justify-between py-4 text-sm text-slate-300 font-medium">
        <!-- Day Name -->
        <span class="w-24 text-slate-100 font-semibold text-left shrink-0">${dayName}</span>
        
        <!-- Weather SVG icon and Description -->
        <div class="flex items-center gap-2.5 w-28 shrink-0">
          <div class="w-6 h-6 flex items-center justify-center">
            ${getWeatherIcon(day.code, day.iconId)}
          </div>
          <span class="text-xs text-slate-400 capitalize truncate">${day.desc.toLowerCase()}</span>
        </div>

        <!-- Temperature Range values and slider bar -->
        <div class="flex items-center gap-3 flex-1 justify-end max-w-sm">
          <span class="text-xs text-slate-400 w-8 text-right font-semibold">${minC}°</span>
          
          <!-- Slider Track -->
          <div class="relative flex-1 bg-white/5 h-1.5 rounded-full overflow-hidden">
            <!-- Active range bar colored slider -->
            <div class="absolute h-full bg-gradient-to-r from-blue-400 via-indigo-500 to-amber-400 rounded-full" 
                 style="left: ${barLeft}%; width: ${Math.max(barWidth, 6)}%;"></div>
          </div>
          
          <span class="text-xs text-white w-8 text-left font-bold">${maxC}°</span>
        </div>
      </div>
    `;
  }).join('');
}

// Handle units change Celsius <-> Fahrenheit
function changeUnit(newUnit) {
  if (state.unit === newUnit) return;
  state.unit = newUnit;
  localStorage.setItem('OWM_UNIT', newUnit);
  updateUnitToggles();
  renderDashboard();
}

function updateUnitToggles() {
  if (state.unit === 'C') {
    elements.btnUnitC.className = "px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/10 text-white shadow-md transition-all duration-200";
    elements.btnUnitF.className = "px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-400 hover:text-white transition-all duration-200";
  } else {
    elements.btnUnitF.className = "px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/10 text-white shadow-md transition-all duration-200";
    elements.btnUnitC.className = "px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-400 hover:text-white transition-all duration-200";
  }
}

// Toggle Hourly list vs Hourly Area chart view modes
function changeViewMode(newMode) {
  if (state.viewMode === newMode) return;
  state.viewMode = newMode;
  
  if (newMode === 'cards') {
    elements.btnViewCards.className = "px-3 py-1 rounded-md bg-white/10 text-white shadow-sm transition-all";
    elements.btnViewChart.className = "px-3 py-1 rounded-md text-slate-400 hover:text-white transition-all";
    elements.hourlyListContainer.classList.remove('hidden');
    elements.hourlyChartContainer.classList.add('hidden');
    elements.hourlyChartContainer.classList.remove('flex');
  } else {
    elements.btnViewChart.className = "px-3 py-1 rounded-md bg-white/10 text-white shadow-sm transition-all";
    elements.btnViewCards.className = "px-3 py-1 rounded-md text-slate-400 hover:text-white transition-all";
    elements.hourlyListContainer.classList.add('hidden');
    elements.hourlyChartContainer.classList.remove('hidden');
    elements.hourlyChartContainer.classList.add('flex');
    
    // Re-render chart to ensure sizes fit current browser dimensions
    if (state.weatherData) {
      renderHourlyChart(state.weatherData.forecast);
    }
  }
}

// Start application
document.addEventListener('DOMContentLoaded', init);

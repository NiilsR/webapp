// ==== DOM Elements ====
// These get references to HTML elements
const locationInput = document.getElementById('locationInput');      // Text input for city name
const searchForm = document.getElementById('searchForm');            // Form that triggers search
const locationElement = document.getElementById('location');        // Displays the city name
const descriptionEl = document.getElementById('description');       // Displays weather description (e.g. cloudy)
const tempValueEl = document.getElementById('temp-value');          // Displays temperature value
const emojiEl = document.querySelector('.weather-emoji');           // Displays emoji for weather type
const timeEl = document.getElementById('local-time');               // Displays the local time of the city
const historyListEl = document.getElementById('historyList');       // Displays recent search history
const themeToggleBtn = document.getElementById('themeToggle');      // Button to toggle dark/light theme

// ==== Cache Constants and State ====
const CACHE_KEY = 'weatherApiCache';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes in milliseconds
let weatherCache = {}; // { [cityLower]: { timestamp: ms, data: {...} } }

// ==== Constants and State ====
// Constant values and global state variables
const API_KEY   = 'dd195862e3080374f4b778029e11cd27';                  // Your OpenWeatherMap API key
const API_URL   = 'https://api.openweathermap.org/data/2.5/weather';   // Base URL for weather API
const HISTORY_KEY = 'weatherSearchHistory';                            // Key for saving history in localStorage

// Object that maps weather conditions to emojis
const weatherEmoji = {
  Clear: "☀️", Clouds: "☁️", Rain: "🌧️", Drizzle: "🌦️",
  Thunderstorm: "⛈️", Snow: "❄️", Mist: "🌫️", Smoke: "💨",
  Haze: "💨", Dust: "🌪️", Fog: "🌫️", Sand: "🌪️",
  Ash: "🌋", Squall: "🌬️", Tornado: "🌪️"
};

// This will hold the search history
let history = [];

// ==== Event Listeners ====

// When the form is submitted, prevent page reload, get the city name, and fetch weather
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();                       // Stops the form from refreshing the page
  const city = locationInput.value.trim(); // Clean up whitespace
  if (city) fetchWeather(city);            // Call the fetch function if input is not empty
});

// When the user clicks the theme toggle button, switch theme and store the preference
themeToggleBtn.addEventListener('click', () => {
  const isDark = document.body.classList.toggle('dark');               // Toggle dark class
  localStorage.setItem('theme', isDark ? 'dark' : 'light');            // Save preference
  themeToggleBtn.textContent = isDark ? '☀️' : '🌙';                  // Update button emoji
});

// ==== Helper Functions ====

/**
 * Updates the weather display with information from the API response
 * @param {Object} data - Weather data returned from the API
 */
function updateWeatherUI(data) {
  const weather = data.weather[0];                                     // Get main weather object
  locationElement.textContent = data.name;                             // Set city name
  descriptionEl.textContent = weather.description;                     // Set weather description
  tempValueEl.textContent = `${Math.round(data.main.temp)}°C`;         // Set temperature
  emojiEl.textContent = weatherEmoji[weather.main] || "❓";             // Set weather emoji
}

/**
 * Converts timezone offset to local time and updates the display
 * @param {number} offset - Timezone offset in seconds from UTC
 */
function updateLocalTime(offset) {
  const utc = new Date().getTime() + (new Date().getTimezoneOffset() * 60000); // UTC in ms
  const local = new Date(utc + offset * 1000);                      // Add offset to get local time
  const time = `${local.getHours().toString().padStart(2, '0')}:${local.getMinutes().toString().padStart(2, '0')}`;
  timeEl.textContent = `Local Time: ${time}`;                       // Display formatted time
}

/**
 * Saves the current history array to localStorage
 */
function saveHistory() {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

/**
 * Adds a city to the search history
 * Keeps the list to a max of 4 unique cities
 * @param {string} city - Name of the city to add
 */
function addToHistory(city) {
  history = history.filter(item => item.toLowerCase() !== city.toLowerCase()); // Remove if already exists (case-insensitive)
  history.unshift(city);                         // Add to beginning
  if (history.length > 4) history.pop();         // Keep history to max 4 entries
  saveHistory();                                 // Save to localStorage
  renderHistory();                               // Update DOM list
}

/**
 * Renders the search history list in the DOM
 */
function renderHistory() {
  historyListEl.innerHTML = '';                  // Clear old items
  history.forEach(city => {
    const li = document.createElement('li');     // Create new list item
    li.textContent = city;
    li.addEventListener('click', () => {
      locationInput.value = city;                // When clicked, put name in input
      fetchWeather(city);                        // and trigger weather fetch
    });
    historyListEl.appendChild(li);               // Add to list
  });
}

// ==== Cache Helpers ====

/**
 * Load the cache object from localStorage (or start empty)
 */
function localCache() {
  const stored = localStorage.getItem(CACHE_KEY);
  weatherCache = stored ? JSON.parse(stored) : {};
}

/**
 * Persist the in-memory cache back into localStorage
 */
function saveCache() {
  localStorage.setItem(CACHE_KEY, JSON.stringify(weatherCache));
}

/**
 * Return cached data if it exists AND is still within TTL
 * Otherwise return null
 * @param {string} cityLower City name is lowercase
 */
function getCachedWeather(cityLower) {
  const entry = weatherCache[cityLower];
  if (!entry) return null;

  const age = Date.now() -entry.timestamp;
  if (age > CACHE_TTL) {
    // Too old remove from cache
    delete weatherCache[cityLower];
    saveCache();
    return null;
  }
  return entry.data;
}

/**
 * Store API response in cache under cityLower key
 * @param {string} cityLower
 * @param {Object} data
 */
function setCacheWeather(cityLower, data) {
  weatherCache[cityLower] = {
    timestamp: Date.now(),
    data
  };
  saveCache();
}

// ==== Main App Logic ====

/**
 * Fetches weather data for a given city from the API
 * then updates the UI and history if successful
 * @param {string} city - The city name to search for
 */
function fetchWeather(city) {
  const url = `${API_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

  fetch(url)
    .then(res => res.json())                     // Convert response to JSON
    .then(data => {
      if (data.cod !== 200) {                    // If city not found
        console.error('City not found:', data.message);
        return;
      }
      updateWeatherUI(data);                     // Update city, temp, emoji, etc
      updateLocalTime(data.timezone);            // Update local time
      addToHistory(data.name);                   // Save to history
    })
    .catch(err => console.error('Weather fetch error:', err)); // Handle errors
}


/**
 * Initializes the theme based on saved preference or system setting
 */
function initTheme() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem('theme');
  const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
  document.body.classList.toggle('dark', isDark);                  // Apply dark theme if needed
  themeToggleBtn.textContent = isDark ? '☀️' : '🌙';                // Update toggle button icon
}


/**
 * Loads the search history from localStorage and renders it
 */
function loadHistory() {
  const stored = localStorage.getItem(HISTORY_KEY);                // Get saved history
  history = stored ? JSON.parse(stored) : [];                      // Parse or initialize
  renderHistory();                                                 // Render to DOM
}


// ==== Init ====
// Runs on page load
initTheme();   // Set up theme (dark/light)
loadHistory(); // Load and display previous search history
loadCache();

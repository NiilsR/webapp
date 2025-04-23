const apiKey = 'dd195862e3080374f4b778029e11cd27';
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather';

const locationInput = document.getElementById('locationInput');
const searchForm = document.getElementById('searchForm');
const locationElement = document.getElementById('location');
const temperatureElement = document.getElementById('temperature');
const descriptionElement = document.getElementById('description');

const historyKey = 'weatherSearchHistory';
let history = [];

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
    const location = locationInput.value;
    if (location) {
        fetchWeather(location);
    }
});

function fetchWeather(location) {
    const url = `${apiUrl}?q=${location}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            locationElement.textContent = data.name;
            temperatureElement.textContent = `${Math.round(data.main.temp)}°C`;
            descriptionElement.textContent = data.weather[0].description;
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
        });
}

// Define a map from weather condition to emoji
const weatherEmoji = {
    Clear:    "☀️",
    Clouds:   "☁️",
    Rain:     "🌧️",
    Drizzle:  "🌦️",
    Thunderstorm: "⛈️",
    Snow:     "❄️",
    Mist:     "🌫️",
    Smoke:    "💨",
    Haze:     "💨",
    Dust:     "🌪️",
    Fog:      "🌫️",
    Sand:     "🌪️",
    Ash:      "🌋",
    Squall:   "🌬️",
    Tornado:  "🌪️"
  };
  
  // In your fetchWeather callback, grab the `main` and look up the emoji
  function fetchWeather(location) {
    const url = `${apiUrl}?q=${location}&appid=${apiKey}&units=metric`;
  
    fetch(url)
      .then(res => res.json())
      .then(data => {
        const { main, description } = data.weather[0];
        const temp = Math.round(data.main.temp);
        const emoji = weatherEmoji[main] || "❓";
  
        locationElement.textContent    = data.name;
        descriptionElement.textContent = description;
  
        document.querySelector(".weather-emoji").textContent = emoji;
        document.getElementById("temp-value").textContent = `${temp}°C`;
      })
      .catch(console.error);
  }

  const toggleBtn = document.getElementById('themeToggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  const currentTheme = localStorage.getItem('theme');
  
  // On load, apply stored theme or OS preference
  if (currentTheme === 'dark' || (!currentTheme && prefersDark.matches)) {
    document.body.classList.add('dark');
    toggleBtn.textContent = '☀️';
  }
  
  // When user clicks the button…
  toggleBtn.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark');
    toggleBtn.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });


  // Load history from localStorage on init
function loadHistory() {
  const stored = localStorage.getItem(historyKey);
  history = stored ? JSON.parse(stored) : [];
  renderHistory();
}

// Save history to localStorage
function saveHistory() {
  localStorage.setItem(historyKey, JSON.stringify(history));
}

// Add a city to history (ensuring uniqueness & max 4)
function addToHistory(city) {
  // remove if already there
  history = history.filter(item => item.toLowerCase() !== city.toLowerCase());
  // add to front
  history.unshift(city);
  // cap to 4
  if (history.length > 4) history.pop();
  saveHistory();
  renderHistory();
}

// Render the list into the DOM
function renderHistory() {
  const ul = document.getElementById('historyList');
  ul.innerHTML = '';          // clear old items
  history.forEach(city => {
    const li = document.createElement('li');
    li.textContent = city;
    li.addEventListener('click', () => {
      // on click, fill input and fetch
      locationInput.value = city;
      fetchWeather(city);
    });
    ul.appendChild(li);
  });
}

// —————————————————————————————————————————————————————
// Now hook into your existing flow:

// 1) On page load
loadHistory();

// 2) Whenever you do a successful search in fetchWeather:
function fetchWeather(location) {
  const url = `${apiUrl}?q=${location}&appid=${apiKey}&units=metric`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      // Emoji
      document.querySelector('.weather-emoji').textContent =
        weatherEmoji[data.weather[0].main] || '❓';

      // Weather data
      document.getElementById('temp-value').textContent =
        `${Math.round(data.main.temp)}°C`;
      locationElement.textContent = data.name;
      descriptionElement.textContent = data.weather[0].description;

      // Local time logic starts here:
      const timezoneOffset = data.timezone; // in seconds
      const utc = new Date().getTime() + (new Date().getTimezoneOffset() * 60000);
      const localTime = new Date(utc + (timezoneOffset * 1000));

      const hours = localTime.getHours().toString().padStart(2, '0');
      const minutes = localTime.getMinutes().toString().padStart(2, '0');
      const formattedTime = `${hours}:${minutes}`;

      document.getElementById('local-time').textContent = `Local Time: ${formattedTime}`;

      // Save to history
      addToHistory(data.name);
    })
    .catch(console.error);
}

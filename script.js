const apiKey = 'dd195862e3080374f4b778029e11cd27';
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather';

const locationInput = document.getElementById('locationInput');
const searchButton = document.getElementById('searchButton');
const locationElement = document.getElementById('location');
const temperatureElement = document.getElementById('temperature');
const descriptionElement = document.getElementById('description');

searchButton.addEventListener('click', () => {
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
  
  // 1) On load, apply stored theme or OS preference
  if (currentTheme === 'dark' || (!currentTheme && prefersDark.matches)) {
    document.body.classList.add('dark');
    toggleBtn.textContent = '☀️';
  }
  
  // 2) When user clicks the button…
  toggleBtn.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark');
    toggleBtn.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
  
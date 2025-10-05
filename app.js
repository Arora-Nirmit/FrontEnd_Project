
  

const API_KEY = "fcc8de7015bbb202209bbf0261babf4c"; 
const BASE_URL = "https://api.openweathermap.org/data/2.5/";


const body = document.body; 
const themeToggle = document.getElementById("theme-toggle"); 
const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const locationName = document.getElementById("location-name");
const temperature = document.getElementById("temperature");
const condition = document.getElementById("condition");
const weatherIcon = document.getElementById("weather-icon");
const feelsLike = document.getElementById("feels-like");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("wind-speed");
const forecastContainer = document.getElementById("forecast-container");



/**
 * Converts a string to title case (e.g., "broken clouds" -> "Broken Clouds").
 */
const toTitleCase = (str) => {
    return str.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Displays an error message on the dashboard.
 */
const displayError = (message) => {
    locationName.textContent = "Error";
    temperature.textContent = "--°C";
    condition.textContent = message;
    feelsLike.textContent = "--°C";
    humidity.textContent = "--%";
    windSpeed.textContent = "-- km/h";
    weatherIcon.style.display = 'none';

    forecastContainer.innerHTML = `<p class="error-message">${message}</p>`;
};

/**
 * Fetches data from the OpenWeatherMap API.
 */
const fetchWeatherData = async (endpoint, query) => {
    const url = `${BASE_URL}${endpoint}?q=${query}&units=metric&appid=${API_KEY}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("City not found. Please check the spelling.");
            }
            throw new Error(`Weather data failed to load: ${response.statusText}`);
        }
        return response.json();
    } catch (error) {
        console.error("API Fetch Error:", error);
        throw error;
    }
};




/**
 * Updates the current weather section of the dashboard.
 */
const displayCurrentWeather = (data) => {
    const cityName = data.name;
    const country = data.sys.country;
    const temp = Math.round(data.main.temp);
    const feels = Math.round(data.main.feels_like);
    const weather = data.weather[0].description;
    const iconCode = data.weather[0].icon;
    const hum = data.main.humidity;
    const wind = (data.wind.speed * 3.6).toFixed(1); // Convert m/s to km/h

    locationName.textContent = `${cityName}, ${country}`;
    temperature.textContent = `${temp}°C`;
    condition.textContent = toTitleCase(weather);
    feelsLike.textContent = `${feels}°C`;
    humidity.textContent = `${hum}%`;
    windSpeed.textContent = `${wind} km/h`;
    
    // Set the weather icon
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    weatherIcon.alt = weather;
    weatherIcon.style.display = 'block';
};

/**
 * Updates the 5-day forecast section of the dashboard.
 */
const displayForecast = (data) => {
    forecastContainer.innerHTML = ''; // Clear previous forecast

    // Filter the list to get one entry per day (ideally around noon, '12:00:00')
    const dailyForecasts = data.list.filter(item => item.dt_txt.includes("12:00:00"));

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    dailyForecasts.slice(0, 5).forEach(item => { // Limit to 5 days
        const date = new Date(item.dt * 1000); // Convert Unix timestamp to milliseconds
        const dayName = days[date.getDay()];
        const temp = Math.round(item.main.temp);
        const iconCode = item.weather[0].icon;
        const weather = item.weather[0].description;

        const card = document.createElement('div');
        card.classList.add('forecast-card');
        card.innerHTML = `
            <p class="day">${dayName}</p>
            <img src="https://openweathermap.org/img/wn/${iconCode}.png" alt="${weather}">
            <p>${temp}°C</p>
            <p>${toTitleCase(weather)}</p>
        `;
        forecastContainer.appendChild(card);
    });
};




/**
 * Handles the weather search logic.
 */
const getWeather = async (city) => {
    if (!city) {
        displayError("Please enter a city name.");
        return;
    }

    // Set a temporary loading state
    locationName.textContent = "Loading...";
    forecastContainer.innerHTML = '<p id="forecast-placeholder">Fetching data...</p>';

    try {
        // 1. Fetch Current Weather
        const currentData = await fetchWeatherData('weather', city);
        displayCurrentWeather(currentData);

        // 2. Fetch 5-Day Forecast
        const forecastData = await fetchWeatherData('forecast', city);
        displayForecast(forecastData);

    } catch (error) {
        // Handle API key error (often a 401 Unauthorized)
        if (error.message.includes('401')) {
            displayError("Invalid API Key. Please check the 'script.js' file and replace 'YOUR_API_KEY_HERE' with your valid OpenWeatherMap API key.");
        } else {
            // Display other errors (e.g., city not found)
            displayError(error.message);
        }
    }
};




/**
 * Applies the stored theme preference or defaults to light mode.
 */
const initializeTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        themeToggle.textContent = '🌙'; // Set button to moon icon
    } else {
        // Default is light
        themeToggle.textContent = '☀️'; // Set button to sun icon
    }
}

/**
 * Toggles the dark-mode class and saves the preference to localStorage.
 */
const toggleTheme = () => {
    body.classList.toggle('dark-mode');
    
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
        themeToggle.textContent = '🌙';
    } else {
        localStorage.setItem('theme', 'light');
        themeToggle.textContent = '☀️';
    }
}




// Search button click
searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    getWeather(city);
});

// Enter key press in the input field
cityInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
        searchBtn.click();
    }
});

// Theme toggle button click
themeToggle.addEventListener('click', toggleTheme);


// Initialize the dashboard on load
initializeTheme();
displayError("Welcome! Enter a city name to get the current weather and a 5-day forecast.");
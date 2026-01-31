/*
Enhanced Weather Widget for Suprapa High School
Updates:
1. UI: Uses Bootstrap 3 compatible structures + inline flex for alignment.
2. Icons: Enhanced weather emojis.
3. IP: Uses 'https://ipwho.is/' which is CORS-friendly and free.
4. Visibility: Removed hardcoded white text so it adapts to Light/Dark mode.
5. Cache: Properly uses cached timestamp for "Updated X ago".
6. Reload: Removed manual reload button as requested.
*/

const weatherApiUrl = 'https://api.open-meteo.com/v1/forecast';
const ipApiUrl = 'https://ipwho.is/';

const schoolLocation = {
    latitude: 26.325,
    longitude: 89.45,
    name: 'Suprapa High School'
};

const CACHE_KEY_USER = 'weatherDataUser_v3';
const CACHE_KEY_SCHOOL = 'weatherDataSchool_v3';
const CACHE_DURATION_MS = 3 * 60 * 60 * 1000; // 3 hours

/**
 * Get User Location via IPWho.is
 */
async function getUserLocation() {
    try {
        const response = await fetch(ipApiUrl);
        if (!response.ok) throw new Error('IP API failed');
        const data = await response.json();
        if (!data.success) throw new Error(data.message || 'IP Geolocation failed');

        return {
            latitude: data.latitude,
            longitude: data.longitude,
            city: data.city || 'Your Location'
        };
    } catch (error) {
        console.warn("Could not fetch user location.", error);
        return null;
    }
}

/**
 * Fetch weather from Open-Meteo
 */
async function fetchWeather(lat, lon) {
    const params = new URLSearchParams({
        latitude: lat,
        longitude: lon,
        current: 'temperature_2m,weather_code,is_day',
        timezone: 'auto'
    });
    const response = await fetch(`${weatherApiUrl}?${params}`);
    if (!response.ok) throw new Error('Weather API failed');
    return await response.json();
}

/**
 * Get weather data (Cache First Strategy)
 * Returns { data: Object, timestamp: Number }
 */
async function getWeatherDataForLocation(lat, lon, cacheKey) {
    const now = Date.now();

    try {
        const cachedItem = localStorage.getItem(cacheKey);
        if (cachedItem) {
            const parsed = JSON.parse(cachedItem);
            if (parsed.timestamp + CACHE_DURATION_MS > now) {
                // Return cached data with its ORIGINAL timestamp
                return { data: parsed.data, timestamp: parsed.timestamp };
            }
        }
    } catch (e) { console.error('Cache read error', e); }

    // Fetch New
    const data = await fetchWeather(lat, lon);
    const timestamp = Date.now();
    localStorage.setItem(cacheKey, JSON.stringify({ timestamp: timestamp, data: data }));
    return { data: data, timestamp: timestamp };
}

function getWeatherIconText(code, isDay) {
    switch (code) {
        case 0: return isDay ? '☀️' : '🌙';
        case 1: case 2: case 3: return isDay ? '⛅' : '☁️';
        case 45: case 48: return '🌫️';
        case 51: case 53: case 55: return '🌦️';
        case 61: case 63: case 65: return '🌧️';
        case 71: case 73: case 75: return '❄️';
        case 80: case 81: case 82: return '🌦️';
        case 95: case 96: case 99: return '⛈️';
        default: return '🌡️';
    }
}

function getTimeAgo(timestamp) {
    const now = Date.now();
    const diffSeconds = Math.floor((now - timestamp) / 1000);

    if (diffSeconds < 60) return 'Updated just now';
    if (diffSeconds < 3600) return `Updated ${Math.floor(diffSeconds / 60)} min ago`;
    return `Updated ${Math.floor(diffSeconds / 3600)} hr ago`;
}

/**
 * Main Render Function
 */
async function initWeatherWidget() {
    const weatherContainer = document.querySelector('.footer-weather');
    if (!weatherContainer) return;

    if (!weatherContainer.querySelector('.weather-content-wrapper')) {
        weatherContainer.innerHTML = '<div style="text-align:center; padding:10px; font-size:0.85em;">Loading...</div>';
    }

    try {
        // 1. Get School Weather
        const schoolResult = await getWeatherDataForLocation(schoolLocation.latitude, schoolLocation.longitude, CACHE_KEY_SCHOOL);

        // 2. Get User Location & Weather (Parallel-ish)
        let userResult = null;
        let userLoc = null;

        try {
            userLoc = await getUserLocation();
            if (userLoc) {
                userResult = await getWeatherDataForLocation(userLoc.latitude, userLoc.longitude, CACHE_KEY_USER);
            }
        } catch (e) {
            console.warn("User location workflow failed", e);
        }

        // Use the timestamp from the User fetch if available, else School fetch
        const displayTimestamp = userResult ? userResult.timestamp : (schoolResult ? schoolResult.timestamp : Date.now());

        // Render UI
        weatherContainer.innerHTML = '';
        weatherContainer.className = 'footer-weather weather-widget-container';

        // Wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'weather-content-wrapper';
        wrapper.style.display = 'flex';
        wrapper.style.flexDirection = 'column';
        wrapper.style.gap = '8px';
        wrapper.style.color = 'inherit'; // Adapt to parent color (Light/Dark mode)

        // Helper to create Flex Row
        const createRow = (labelHTML, valueHTML, isError = false) => {
            const row = document.createElement('div');
            // Flexbox for alignment
            row.style.display = 'flex';
            row.style.justifyContent = 'space-between';
            row.style.alignItems = 'center';
            row.style.width = '100%';

            const left = document.createElement('div');
            left.style.fontWeight = '600';
            left.style.fontSize = '0.9em';
            left.style.color = 'inherit'; // Removed hardcoded white
            left.innerHTML = labelHTML;

            const right = document.createElement('div');
            right.style.textAlign = 'right';
            right.style.fontSize = '0.9em';
            right.style.color = 'inherit'; // Removed hardcoded white
            right.innerHTML = valueHTML;
            if (isError) right.style.color = '#ff6b6b';

            row.appendChild(left);
            row.appendChild(right);
            return row;
        };

        // 1. School Row
        if (schoolResult && schoolResult.data) {
            const data = schoolResult.data;
            const temp = Math.round(data.current.temperature_2m);
            const icon = getWeatherIconText(data.current.weather_code, data.current.is_day);
            wrapper.appendChild(createRow(
                `🏫 Suprapa High`,
                `${temp}°C ${icon}`
            ));
        }

        // 2. User Row
        if (userResult && userResult.data && userLoc) {
            const data = userResult.data;
            const temp = Math.round(data.current.temperature_2m);
            const icon = getWeatherIconText(data.current.weather_code, data.current.is_day);
            let cityDisplay = userLoc.city;
            // Truncate long city names
            if (cityDisplay.length > 12) cityDisplay = cityDisplay.substring(0, 10) + '...';

            wrapper.appendChild(createRow(
                `📍 You (${cityDisplay})`,
                `${temp}°C ${icon}`
            ));
        } else {
            // Error State
            wrapper.appendChild(createRow(
                `📍 Your Location`,
                `<span style="opacity:0.7; font-size:0.85em;">Unavailable</span>`,
                true
            ));
        }

        // 3. Footer (Time Only - No Reload)
        const footerRow = document.createElement('div');
        footerRow.style.display = 'flex';
        footerRow.style.justifyContent = 'flex-start'; // Left align
        footerRow.style.alignItems = 'center';
        footerRow.style.marginTop = '5px';
        footerRow.style.borderTop = '1px solid rgba(0,0,0,0.1)'; // Subtle separator
        footerRow.style.paddingTop = '5px';

        // Adjust border for dark mode if possible (via class)
        // Since we can't easily detect CSS class here without heavy DOM checks, we use a translucent border which works on both.

        const timeDiv = document.createElement('div');
        timeDiv.className = 'weather-time';
        timeDiv.style.fontSize = '0.75em';
        timeDiv.style.opacity = '0.8';
        timeDiv.textContent = getTimeAgo(displayTimestamp);

        footerRow.appendChild(timeDiv);
        wrapper.appendChild(footerRow);

        weatherContainer.appendChild(wrapper);

        // Update timer
        if (window.weatherTimer) clearInterval(window.weatherTimer);
        window.weatherTimer = setInterval(() => {
            const timeEl = weatherContainer.querySelector('.weather-time');
            if (timeEl) timeEl.textContent = getTimeAgo(displayTimestamp);
        }, 60000);

    } catch (error) {
        console.error("Weather widget error:", error);
        weatherContainer.innerHTML = '<div style="font-size:0.85em; opacity:0.7;">Weather Unavailable</div>';
    }
}

// Expose globally
window.initWeatherWidget = initWeatherWidget;

// Auto-init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initWeatherWidget());
} else {
    initWeatherWidget();
}

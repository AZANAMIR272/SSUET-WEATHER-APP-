// --- Global Variables and Constants ---
// OpenWeatherMap API Key (for frontend direct calls)
const weatherApi = {
    key: '5174a4c980abc22f0dc589db984742cf', // YOUR OpenWeatherMap API KEY - Please replace with your actual key if deploying!
    baseUrl: 'https://api.openweathermap.org/data/2.5/weather',
};

// UI Element References
const mainContentArea = document.getElementById('main-content-area');
const contentSections = document.querySelectorAll('.content-section');
const navLinks = document.querySelectorAll('.nav-links a');
const adminLoginToggle = document.getElementById('admin-login-toggle');

// Admin Login Modal Elements
const adminLoginModal = document.getElementById('admin-login-modal');
const adminLoginForm = document.getElementById('admin-login-form');
const adminUsernameInput = document.getElementById('admin-username');
const adminPasswordInput = document.getElementById('admin-password');
const loginStatus = document.getElementById('login-status');
const loginCancelBtn = document.getElementById('login-cancel-btn');

// Weather App Elements (within home-section)
const weatherResultContainer = document.getElementById('weather-result');
const airConditionsResult = document.getElementById('air-conditions-result');
const cityButtonsContainer = document.querySelector('.city-buttons-container');

// Admin Dashboard Elements (within dashboard-section)
const adminDashboardSection = document.getElementById('dashboard-section');
const recordIdInput = document.getElementById('record-id');
const cityAdminSelect = document.getElementById('city'); // Changed from input to select
const countryAdminInput = document.getElementById('country');
const tempAdminInput = document.getElementById('temp');
const humidityAdminInput = document.getElementById('humidity');
const recordedAtAdminInput = document.getElementById('recorded_at');
const weatherForm = document.getElementById('weather-form');
const resetFormBtn = document.getElementById('reset-btn');
const loadingIndicator = document.getElementById('loading-indicator');
const recordsTableBody = document.querySelector('#records-table tbody');
const themeToggle = document.getElementById('theme-toggle');

// Dynamic Aggregate Stats Elements
const cityStatsSelect = document.getElementById('city-stats-select');
const cityAggregateStatsDisplay = document.getElementById('city-aggregate-stats-display');

// Generate Data Elements
const generateDataBtn = document.getElementById('generate-data-btn');
const generationStatus = document.getElementById('generation-status');
const CITIES_FOR_GENERATION = ["Karachi", "Lahore", "Islamabad", "Peshawar", "Quetta"];

// Delete All Records Element
const deleteAllRecordsBtn = document.getElementById('delete-all-records-btn');

// Chart Elements
const graphCitySelect = document.getElementById('graph-city-select');
let temperatureLineChartInstance = null;

// Filter Elements
const filterCityInput = document.getElementById('filter-city');
const filterFromDateInput = document.getElementById('filter-from-date');
const filterToDateInput = document.getElementById('filter-to-date');
const applyFilterBtn = document.getElementById('apply-filter-btn');
const clearFilterBtn = document.getElementById('clear-filter-btn');

// Add Admin Form Elements
const addAdminForm = document.getElementById('add-admin-form');
const newAdminUsernameInput = document.getElementById('new-admin-username');
const newAdminPasswordInput = document.getElementById('new-admin-password');
const confirmAdminPasswordInput = document.getElementById('confirm-admin-password');
const addAdminStatus = document.getElementById('add-admin-status');


// Map Elements
const mapContainer = document.getElementById('map-container');
let map;
let marker;

// Newsletter Elements
const newsletterForm = document.getElementById('newsletter-form');
const newsletterEmailInput = document.getElementById('newsletter-email');
const newsletterStatus = document.getElementById('newsletter-status');

// Admin State
let isAdmin = false;

// --- Custom Modal Functions ---
const customModal = document.getElementById('custom-modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalConfirmBtn = document.getElementById('modal-confirm-btn');
const modalCancelBtn = document.getElementById('modal-cancel-btn');

/**
 * Displays a custom modal message.
 * @param {string} title - The title of the modal.
 * @param {string} message - The message content.
 * @param {boolean} isConfirm - If true, shows a "Cancel" button and returns a Promise.
 * @returns {Promise<boolean>|void} - Promise resolves to true if confirmed, false if cancelled. Returns void for simple alerts.
 */
function showCustomModal(title, message, isConfirm = false) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    customModal.classList.add('visible');

    if (isConfirm) {
        modalCancelBtn.style.display = 'inline-block';
        return new Promise((resolve) => {
            const confirmHandler = () => {
                customModal.classList.remove('visible');
                modalConfirmBtn.removeEventListener('click', confirmHandler);
                modalCancelBtn.removeEventListener('click', cancelHandler);
                resolve(true);
            };
            const cancelHandler = () => {
                customModal.classList.remove('visible');
                modalConfirmBtn.removeEventListener('click', confirmHandler);
                modalCancelBtn.removeEventListener('click', cancelHandler);
                resolve(false);
            };
            modalConfirmBtn.addEventListener('click', confirmHandler);
            modalCancelBtn.addEventListener('click', cancelHandler);
        });
    } else {
        modalCancelBtn.style.display = 'none';
        modalConfirmBtn.onclick = () => customModal.classList.remove('visible');
    }
}

// --- Navigation and View Management ---
function showSection(sectionId) {
    contentSections.forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === sectionId) {
            link.classList.add('active');
        }
    });

    // Specific actions for sections
    if (sectionId === 'dashboard-section') {
        fetchRecords(); // Reload admin data when dashboard is shown
        fetchAndDisplayCityStats(cityStatsSelect.value || ''); // Reload stats
        updateDashboardView(); // Apply admin/client view classes
    }
}

/**
 * Toggles the visibility of admin-only elements based on the isAdmin state.
 * This function is crucial for showing/hiding the "Generate Records" button and admin forms/table columns.
 */
function updateDashboardView() {
    // Select all elements that have the class 'admin-only' initially
    const adminOnlyElements = document.querySelectorAll('.admin-only');

    // Find the 'Actions' header and all action cells in the records table
    const actionsHeader = document.querySelector('#records-table th[data-label="Actions"], #records-table th:last-child');
    const actionsCells = document.querySelectorAll('#records-table tbody td:last-child');

    // Explicitly target admin-only containers and forms
    const adminGenerateButtonsContainer = document.querySelector('.admin-generate-buttons-container');
    const addUpdateWeatherForm = document.getElementById('weather-form');
    const addAdminUserForm = document.getElementById('add-admin-form');
    const addUpdateWeatherFormHeading = document.querySelector('#dashboard-section h3.admin-only:nth-of-type(1)'); // H3 for weather form
    const addAdminUserFormHeading = document.querySelector('#dashboard-section h3.admin-only:nth-of-type(2)'); // H3 for add admin form


    if (isAdmin) {
        // If in admin mode, ensure admin-only elements are visible
        adminDashboardSection.classList.remove('client-view'); // Remove class that hides admin elements

        // Show all .admin-only elements
        adminOnlyElements.forEach(el => el.style.display = ''); // Reset display to default (block, flex, etc.)

        // Explicitly set display for specific elements if needed
        if (adminGenerateButtonsContainer) adminGenerateButtonsContainer.style.display = 'flex';
        if (addUpdateWeatherForm) addUpdateWeatherForm.style.display = 'flex'; // Forms are flex
        if (addAdminUserForm) addAdminUserForm.style.display = 'flex'; // Forms are flex
        if (addUpdateWeatherFormHeading) addUpdateWeatherFormHeading.style.display = 'block'; // Headings are block
        if (addAdminUserFormHeading) addAdminUserFormHeading.style.display = 'block'; // Headings are block


        if (actionsHeader) actionsHeader.style.display = ''; // Show Actions header
        actionsCells.forEach(cell => cell.style.display = ''); // Show Actions buttons in table

    } else {
        // If in client mode, hide admin-only elements
        adminDashboardSection.classList.add('client-view'); // Add class to hide admin elements

        // Hide all .admin-only elements
        adminOnlyElements.forEach(el => el.style.display = 'none');

        // Explicitly set display for specific elements if needed
        if (adminGenerateButtonsContainer) adminGenerateButtonsContainer.style.display = 'none';
        if (addUpdateWeatherForm) addUpdateWeatherForm.style.display = 'none';
        if (addAdminUserForm) addAdminUserForm.style.display = 'none';
        if (addUpdateWeatherFormHeading) addUpdateWeatherFormHeading.style.display = 'none';
        if (addAdminUserFormHeading) addAdminUserFormHeading.style.display = 'none';


        if (actionsHeader) actionsHeader.style.display = 'none'; // Hide Actions header
        actionsCells.forEach(cell => cell.style.display = 'none'); // Hide Actions buttons in table
    }
}

async function handleAdminLogin() {
    const username = adminUsernameInput.value.trim();
    const password = adminPasswordInput.value.trim();
    loginStatus.textContent = ''; // Clear previous messages

    if (!username || !password) {
        loginStatus.textContent = 'Please enter both username and password.';
        return;
    }

    try {
        const res = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        if (res.ok) {
            isAdmin = true;
            adminLoginModal.classList.remove('visible');
            showCustomModal('Login Successful', `Welcome, ${username}! You are now in admin mode.`, false);
            adminLoginToggle.textContent = 'Admin Logout';
            adminUsernameInput.value = ''; // Clear form
            adminPasswordInput.value = '';
            loginStatus.textContent = ''; // Clear any residual status
            showSection('dashboard-section'); // Navigate to dashboard
        } else {
            loginStatus.textContent = data.message || 'Login failed. Please check your credentials.';
            isAdmin = false;
        }
    } catch (error) {
        console.error('Login error:', error);
        loginStatus.textContent = 'An error occurred during login. Please try again later.';
        isAdmin = false;
    } finally {
        updateDashboardView(); // Ensure view updates after login attempt
    }
}

function toggleAdminView() {
    if (isAdmin) {
        // If currently admin, log out
        const confirmed = showCustomModal('Confirm Logout', 'Are you sure you want to log out of admin mode?', true);
        confirmed.then((result) => {
            if (result) {
                isAdmin = false;
                adminLoginToggle.textContent = 'Admin Login';
                showCustomModal('Logged Out', 'You have successfully logged out of admin mode.', false);
                showSection('home-section'); // Go back to home page on logout
                updateDashboardView();
            }
        });
    } else {
        // If not admin, show login modal
        adminLoginModal.classList.add('visible');
        adminUsernameInput.value = ''; // Clear any previous input
        adminPasswordInput.value = '';
        loginStatus.textContent = ''; // Clear any previous status
    }
}


// --- Weather App Functions ---
async function fetchWeather(city) {
    if (!city) {
        showCustomModal('Input Required', 'Please select a city to see weather.');
        return;
    }

    weatherResultContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Fetching weather data...</p>';
    airConditionsResult.innerHTML = '<p style="text-align: center; color: var(--text-secondary); grid-column: 1 / -1;">Loading conditions...</p>';
    weatherResultContainer.classList.add('visible');
    mapContainer.style.display = 'none';

    try {
        // Use OpenWeatherMap for live weather conditions
        const url = `${weatherApi.baseUrl}?q=${encodeURIComponent(city)}&appid=${weatherApi.key}&units=metric`;
        const res = await fetch(url);

        if (!res.ok) {
            if (res.status === 404) {
                throw new Error('City not found. Please check the spelling or try another city.');
            } else {
                const errorData = await res.json();
                throw new Error(`Error fetching weather: ${errorData.message || res.statusText}`);
            }
        }

        const data = await res.json();
        displayWeather(data);
        if (data.coord) {
            showCityOnMap(data.coord.lat, data.coord.lon, data.name);
        } else {
            mapContainer.style.display = 'none';
        }
    } catch (e) {
        console.error('Weather fetch error:', e);
        weatherResultContainer.innerHTML = `<p style="text-align: center; color: ${getComputedStyle(document.documentElement).getPropertyValue('--error-color')};">Error: ${e.message}</p>`;
        airConditionsResult.innerHTML = `<p style="text-align: center; color: ${getComputedStyle(document.documentElement).getPropertyValue('--error-color')}; grid-column: 1 / -1;">Could not load conditions.</p>`;
        showCustomModal('Weather Error', `Failed to fetch weather: ${e.message}`);
        mapContainer.style.display = 'none';
    }
}

function getWeatherIconClass(weatherMain) {
    switch (weatherMain.toLowerCase()) {
        case 'clear': return 'fas fa-sun';
        case 'clouds': return 'fas fa-cloud';
        case 'rain': return 'fas fa-cloud-showers-heavy';
        case 'drizzle': return 'fas fa-cloud-rain';
        case 'thunderstorm': return 'fas fa-bolt';
        case 'snow': return 'fas fa-snowflake';
        case 'mist': case 'smoke': case 'haze': case 'dust': case 'fog': case 'sand': case 'ash': case 'squall': case 'tornado': return 'fas fa-smog';
        default: return 'fas fa-cloud';
    }
}

function displayWeather(data) {
    const weatherIconClass = getWeatherIconClass(data.weather[0].main);

    weatherResultContainer.innerHTML = `
        <div class="weather-main-info">
            <div class="city-temp-info">
                <div class="city-name">${data.name}, ${data.sys.country}</div>
                <div class="weather-description">${data.weather[0].description}</div>
                <div class="current-temp">${Math.round(data.main.temp)}°</div>
            </div>
            <div class="weather-icon-large"><i class="${weatherIconClass}"></i></div>
        </div>
    `;

    airConditionsResult.innerHTML = `
        <div class="condition-item">
            <i class="fas fa-thermometer-half icon"></i>
            <div class="label">Feels like</div>
            <div class="value">${Math.round(data.main.feels_like)}°C</div>
        </div>
        <div class="condition-item">
            <i class="fas fa-wind icon"></i>
            <div class="label">Wind speed</div>
            <div class="value">${data.wind.speed.toFixed(1)} km/h</div>
        </div>
        <div class="condition-item">
            <i class="fas fa-tint icon"></i>
            <div class="label">Humidity</div>
            <div class="value">${data.main.humidity}%</div>
        </div>
        <div class="condition-item">
            <i class="fas fa-tachometer-alt icon"></i>
            <div class="label">Pressure</div>
            <div class="value">${data.main.pressure} hPa</div>
        </div>
        <div class="condition-item">
            <i class="fas fa-arrow-down icon"></i>
            <div class="label">Min Temp</div>
            <div class="value">${Math.round(data.main.temp_min)}°C</div>
        </div>
        <div class="condition-item">
            <i class="fas fa-arrow-up icon"></i>
            <div class="label">Max Temp</div>
            <div class="value">${Math.round(data.main.temp_max)}°C</div>
        </div>
    `;
    weatherResultContainer.classList.add('visible');
}


// --- Admin Dashboard Functions ---

/**
 * Populates the city dropdown for adding/editing weather records.
 * Uses the same CITIES_FOR_GENERATION list for consistency.
 */
function populateAdminCityDropdown() {
    cityAdminSelect.innerHTML = '<option value="">Select City</option>'; // Clear existing options
    CITIES_FOR_GENERATION.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        cityAdminSelect.appendChild(option);
    });
}

/**
 * Populates the city buttons on the home page from the CITIES_FOR_GENERATION list.
 */
function populateCityButtonsForHomePage() {
    cityButtonsContainer.innerHTML = ''; // Clear existing buttons
    CITIES_FOR_GENERATION.forEach(city => {
        const button = document.createElement('button');
        button.classList.add('city-button');
        button.dataset.city = city;
        button.textContent = city;
        cityButtonsContainer.appendChild(button);
    });
}


function resetForm() {
    recordIdInput.value = '';
    weatherForm.reset();
    cityAdminSelect.value = ''; // Ensure dropdown is reset
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    recordedAtAdminInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
}

function setupResponsiveTableHeaders() {
    const headers = Array.from(document.querySelectorAll('#records-table th'));
    document.querySelectorAll('#records-table td').forEach((cell, index) => {
        const headerIndex = index % headers.length;
        if (headers[headerIndex]) {
            cell.setAttribute('data-label', headers[headerIndex].textContent);
        }
    });
    updateDashboardView(); // Re-apply visibility after populating table
}

async function fetchRecords(filters = {}) {
    loadingIndicator.style.display = 'block';
    try {
        const queryParams = new URLSearchParams(filters).toString();
        const url = `/api/weather${queryParams ? `?${queryParams}` : ''}`;

        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status} - ${res.statusText}`);
        }
        const data = await res.json();
        recordsTableBody.innerHTML = '';

        if (data.length === 0) {
            recordsTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-secondary);">No weather records found for the selected filters.</td></tr>';
        } else {
            data.sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at));

            data.forEach(record => {
                const tr = document.createElement('tr');
                const recordedAtDisplay = record.recorded_at ? new Date(record.recorded_at).toLocaleString() : 'N/A';
                tr.innerHTML = `
                    <td data-label="ID">${record.id}</td>
                    <td data-label="City">${record.city}</td>
                    <td data-label="Country">${record.country}</td>
                    <td data-label="Temp">${record.temp !== null ? record.temp.toFixed(1) + '°C' : 'N/A'}</td>
                    <td data-label="Humidity">${record.humidity !== null ? record.humidity + '%' : 'N/A'}</td>
                    <td data-label="Recorded At">${recordedAtDisplay}</td>
                    <td data-label="Actions"> <!-- Removed admin-only class here as it's handled by JS updateDashboardView -->
                        <button onclick="editRecord(${record.id})">Edit</button>
                        <button onclick="deleteRecord(${record.id})">Delete</button>
                    </td>
                `;
                recordsTableBody.appendChild(tr);
            });
            setupResponsiveTableHeaders();
        }

        const selectedGraphCity = graphCitySelect.value;
        // Fetch all records for the graph, regardless of table filters
        const allRecordsRes = await fetch('/api/weather');
        const allRecords = await allRecordsRes.json();
        drawLineTempChart(selectedGraphCity, allRecords);
    }
     catch (error) {
        console.error('Error fetching records:', error);
        showCustomModal('Error', 'Failed to load weather records. Please check the server connection and ensure the database is running.');
        recordsTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: ${getComputedStyle(document.documentElement).getPropertyValue('--error-color')};">Failed to load records.</td></tr>`;
    }
     finally {
        loadingIndicator.style.display = 'none';
    }
}

async function fetchAndDisplayCityStats(city) {
    cityAggregateStatsDisplay.innerHTML = `<p style="text-align: center; color: var(--text-secondary); grid-column: 1 / -1;">Fetching statistics for ${city}...</p>`;
    if (!city) {
        cityAggregateStatsDisplay.innerHTML = `<p style="text-align: center; color: var(--text-secondary); grid-column: 1 / -1;">Select a city to see statistics.</p>`;
        return;
    }

    try {
        const res = await fetch(`/api/weather/city-summary/${encodeURIComponent(city)}`);
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status} - ${res.statusText}`);
        }
        const stats = await res.json();

        if (!stats || (stats.avg_temp === null && stats.avg_humidity === null)) {
             cityAggregateStatsDisplay.innerHTML = `<p style="text-align: center; color: var(--text-secondary); grid-column: 1 / -1;">No records found for ${city}.</p>`;
             return;
        }

        const avgTempValue = stats.avg_temp !== null ? stats.avg_temp.toFixed(1) : 'N/A';
        const maxTempValue = stats.max_temp !== null ? stats.max_temp.toFixed(1) : 'N/A';
        const minTempValue = stats.min_temp !== null ? stats.min_temp.toFixed(1) : 'N/A';
        const avgHumidityValue = stats.avg_humidity !== null ? stats.avg_humidity.toFixed(1) : 'N/A';
        const maxHumidityValue = stats.max_humidity !== null ? stats.max_humidity.toFixed(1) : 'N/A';
        const minHumidityValue = stats.min_humidity !== null ? stats.min_humidity.toFixed(1) : 'N/A';

        cityAggregateStatsDisplay.innerHTML = `
            <div class="dynamic-stats-item">
                <div class="label">Avg. Temp</div>
                <div class="value">${avgTempValue}°C</div>
            </div>
            <div class="dynamic-stats-item">
                <div class="label">Max Temp</div>
                <div class="value">${maxTempValue}°C</div>
            </div>
            <div class="dynamic-stats-item">
                <div class="label">Min Temp</div>
                <div class="value">${minTempValue}°C</div>
            </div>
            <div class="dynamic-stats-item">
                <div class="label">Avg. Humidity</div>
                <div class="value">${avgHumidityValue}%</div>
            </div>
            <div class="dynamic-stats-item">
                <div class="label">Max Humidity</div>
                <div class="value">${maxHumidityValue}%</div>
            </div>
            <div class="dynamic-stats-item">
                <div class="label">Min Humidity</div>
                <div class="value">${minHumidityValue}%</div>
            </div>
        `;
    } catch (error) {
        console.error('Error fetching city summary stats:', error);
        cityAggregateStatsDisplay.innerHTML = `<p style="text-align: center; color: ${getComputedStyle(document.documentElement).getPropertyValue('--error-color')}; grid-column: 1 / -1;">Failed to load statistics for ${city}.</p>`;
    }
}

weatherForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!isAdmin) {
        showCustomModal('Access Denied', 'You must be logged in as an admin to save records.', false);
        return;
    }
    const id = recordIdInput.value;

    const record = {
        city: cityAdminSelect.value.trim(), // Use value from select
        country: countryAdminInput.value.trim() || 'Pakistan', // Default to Pakistan
        temp: parseFloat(tempAdminInput.value) || null,
        humidity: parseInt(humidityAdminInput.value) || null,
        recorded_at: recordedAtAdminInput.value
    };

    if (!record.city || record.temp === null || !record.recorded_at) {
        showCustomModal('Input Error', 'Please fill in required fields: City, Temperature, and Recorded At.');
        return;
    }

    const url = id ? `/api/weather/${id}` : '/api/weather';
    const method = id ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(record)
        });
        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`HTTP error! status: ${res.status} - ${res.statusText}. Details: ${errorText}`);
        }
        showCustomModal('Success', `Record ${id ? 'updated' : 'added'} successfully!`);
        resetForm();
        fetchRecords();
        if (cityStatsSelect.value) {
            fetchAndDisplayCityStats(cityStatsSelect.value);
        }
    } catch (error) {
        console.error('Error saving record:', error);
        showCustomModal('Error', `Failed to ${id ? 'update' : 'add'} weather record. Check console for details.`);
    }
});

// Make editRecord and deleteRecord globally accessible for table buttons
window.editRecord = async (id) => {
    if (!isAdmin) {
        showCustomModal('Access Denied', 'You must be logged in as an admin to edit records.', false);
        return;
    }
    try {
        const res = await fetch(`/api/weather/${id}`);
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status} - ${res.statusText}`);
        }
        const record = await res.json();
        recordIdInput.value = record.id;
        cityAdminSelect.value = record.city; // Use value from select
        countryAdminInput.value = record.country || '';
        tempAdminInput.value = record.temp || '';
        humidityAdminInput.value = record.humidity || '';

        if (record.recorded_at) {
            const date = new Date(record.recorded_at);
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            recordedAtAdminInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
        } else {
            recordedAtAdminInput.value = '';
        }
    } catch (error) {
        console.error('Error fetching record for edit:', error);
        showCustomModal('Error', 'Failed to retrieve record for editing.');
    }
};

window.deleteRecord = async (id) => {
    if (!isAdmin) {
        showCustomModal('Access Denied', 'You must be logged in as an admin to delete records.', false);
        return;
    }
    const confirmed = await showCustomModal('Confirm Deletion', 'Are you sure you want to delete this record? This action cannot be undone.', true);
    if (!confirmed) return;

    try {
        const res = await fetch(`/api/weather/${id}`, { method: 'DELETE' });
        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`HTTP error! status: ${res.status} - ${res.statusText}. Details: ${errorText}`);
        }
        showCustomModal('Success', 'Record deleted successfully!');
        fetchRecords();
        if (cityStatsSelect.value) {
            fetchAndDisplayCityStats(cityStatsSelect.value);
        }
    } catch (error) {
        console.error('Error deleting record:', error);
        showCustomModal('Error', 'Failed to delete weather record. Check console for details.');
    }
};

// --- Charting Functions ---
function drawLineTempChart(selectedCity, allRecords) {
    const ctx = document.getElementById('temperatureLineChart').getContext('2d');

    if (temperatureLineChartInstance) {
        temperatureLineChartInstance.destroy();
    }

    let filteredRecords = allRecords;
    if (selectedCity) {
        filteredRecords = allRecords.filter(record => record.city && record.city.toLowerCase() === selectedCity.toLowerCase());
    }

    filteredRecords.sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at));

    const labels = filteredRecords.map(r => r.recorded_at ? new Date(r.recorded_at).toLocaleDateString() + ' ' + new Date(r.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A');
    const temperatures = filteredRecords.map(r => r.temp !== null ? r.temp : null);

    const chartData = {
        labels: labels,
        datasets: [{
            label: `Temperature Trend for ${selectedCity || 'All Cities'} (°C)`,
            borderColor: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'), /* White for dark mode */
            backgroundColor: 'rgba(255, 255, 255, 0.1)', /* Transparent white for dark mode */
            data: temperatures,
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
            pointBorderColor: 'rgba(255, 255, 255, 0.5)',
            pointHoverBackgroundColor: 'rgba(255, 255, 255, 0.8)',
            pointHoverBorderColor: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
            pointRadius: 5,
            pointHoverRadius: 8,
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: false,
                title: {
                    display: true,
                    text: 'Temperature (°C)',
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                    font: { size: 16, family: 'Inter' }
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                    drawBorder: false
                },
                ticks: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary'),
                    font: { family: 'Inter' }
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Date and Time',
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                    font: { size: 16, family: 'Inter' }
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                    drawBorder: false
                },
                ticks: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary'),
                    font: { family: 'Inter' }
                }
            }
        },
        plugins: {
            legend: {
                labels: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                    font: { size: 14, family: 'Inter' }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                titleColor: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                bodyColor: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary'),
                borderColor: 'rgba(255, 255, 255, 0.3)',
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: false,
                bodyFont: { family: 'Inter' },
                titleFont: { family: 'Orbitron' }
            }
        }
    };
    // Apply light mode colors to chart options
    if (document.body.classList.contains('light-mode')) {
        chartData.datasets[0].borderColor = getComputedStyle(document.documentElement).getPropertyValue('--light-text-primary');
        chartData.datasets[0].backgroundColor = 'rgba(0, 0, 0, 0.1)';
        chartData.datasets[0].pointBackgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--light-text-primary');
        chartData.datasets[0].pointHoverBorderColor = getComputedStyle(document.documentElement).getPropertyValue('--light-text-primary');

        chartOptions.scales.y.title.color = getComputedStyle(document.documentElement).getPropertyValue('--light-text-primary');
        chartOptions.scales.y.grid.color = 'rgba(0, 0, 0, 0.1)';
        chartOptions.scales.y.ticks.color = getComputedStyle(document.documentElement).getPropertyValue('--light-text-secondary');
        chartOptions.scales.x.title.color = getComputedStyle(document.documentElement).getPropertyValue('--light-text-primary');
        chartOptions.scales.x.grid.color = 'rgba(0, 0, 0, 0.05)';
        chartOptions.scales.x.ticks.color = getComputedStyle(document.documentElement).getPropertyValue('--light-text-secondary');
        chartOptions.plugins.legend.labels.color = getComputedStyle(document.documentElement).getPropertyValue('--light-text-primary');
        chartOptions.plugins.tooltip.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        chartOptions.plugins.tooltip.titleColor = getComputedStyle(document.documentElement).getPropertyValue('--light-text-primary');
        chartOptions.plugins.tooltip.bodyColor = getComputedStyle(document.documentElement).getPropertyValue('--light-text-secondary');
        chartOptions.plugins.tooltip.borderColor = 'rgba(0, 0, 0, 0.3)';
    }


    temperatureLineChartInstance = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: chartOptions
    });
}

// --- Data Generation Function ---
async function generatePastWeatherData() {
    if (!isAdmin) {
        showCustomModal('Access Denied', 'You must be logged in as an admin to generate records.', false);
        return;
    }
    generationStatus.textContent = 'Generating 500 records... This may take a moment.';
    generateDataBtn.disabled = true;
    deleteAllRecordsBtn.disabled = true;
    let successCount = 0;
    let errorCount = 0;

    const cities = CITIES_FOR_GENERATION;
    const country = 'Pakistan';

    for (let i = 0; i < 500; i++) {
        const city = cities[Math.floor(Math.random() * cities.length)];
        const temp = (Math.random() * (45 - 15) + 15).toFixed(1);
        const humidity = Math.floor(Math.random() * (90 - 30) + 30);

        const now = new Date();
        const pastDate = new Date(now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000);
        const recorded_at = pastDate.toISOString().slice(0, 19).replace('T', ' '); // Format for SQLite DATETIME

        const record = { city, country, temp: parseFloat(temp), humidity, recorded_at };

        try {
            const res = await fetch('/api/weather', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(record)
            });
            if (res.ok) {
                successCount++;
            } else {
                errorCount++;
                console.error(`Failed to add record ${i + 1}:`, await res.text());
            }
        } catch (error) {
            errorCount++;
            console.error(`Error adding record ${i + 1}:`, error);
        }
        generationStatus.textContent = `Generated ${successCount} records, ${errorCount} failed...`;
    }

    generationStatus.textContent = `Data generation complete! ${successCount} records added, ${errorCount} failed.`;
    generateDataBtn.disabled = false;
    deleteAllRecordsBtn.disabled = false;
    fetchRecords();
    if (cityStatsSelect.value) {
        fetchAndDisplayCityStats(cityStatsSelect.value);
    }
}

async function deleteAllRecords() {
    if (!isAdmin) {
        showCustomModal('Access Denied', 'You must be logged in as an admin to delete records.', false);
        return;
    }
    const confirmed = await showCustomModal(
        'Confirm Deletion',
        'Are you absolutely sure you want to delete ALL weather records? This action cannot be undone.',
        true
    );

    if (!confirmed) {
        return;
    }

    generationStatus.textContent = 'Deleting all records...';
    generateDataBtn.disabled = true;
    deleteAllRecordsBtn.disabled = true;

    try {
        const res = await fetch('/api/weather/all', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`HTTP error! status: ${res.status} - ${res.statusText}. Details: ${errorText}`);
        }

        const result = await res.json();
        showCustomModal('Success', result.message || 'All records deleted successfully!');
        generationStatus.textContent = '';
        fetchRecords();
        cityAggregateStatsDisplay.innerHTML = `<p style="text-align: center; color: var(--text-secondary); grid-column: 1 / -1;">Select a city to see statistics.</p>`;
        cityStatsSelect.value = "";
    } catch (error) {
        console.error('Error deleting all records:', error);
        showCustomModal('Error', `Failed to delete all records. Check console for details.`);
        generationStatus.textContent = `Error deleting all records.`;
    } finally {
        generateDataBtn.disabled = false;
        deleteAllRecordsBtn.disabled = false;
    }
}

// --- Leaflet Map Functions ---
function initMap() {
    // Initialize map with a default center (e.g., Pakistan)
    const defaultLocation = [30.3753, 69.3451]; // Latitude, Longitude for Pakistan
    map = L.map('map').setView(defaultLocation, 5); // Set initial view and zoom level

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Initial marker (optional, can be removed if you only want markers on city click)
    marker = L.marker(defaultLocation).addTo(map)
        .bindPopup('Pakistan')
        .openPopup();

    // Hide map by default
    mapContainer.style.display = 'none';
}

// Function to show a city on the map with a marker
function showCityOnMap(lat, lng, cityName) {
    const cityLocation = [lat, lng];

    // Ensure map is initialized
    if (!map) {
        initMap();
    }

    // Set map center and zoom
    map.setView(cityLocation, 10); // Zoom in closer to the city

    // Remove existing marker if any
    if (marker) {
        map.removeLayer(marker);
    }

    // Add new marker
    marker = L.marker(cityLocation).addTo(map)
        .bindPopup(`<strong>${cityName}</strong>`)
        .openPopup();

    mapContainer.style.display = 'block'; // Show the map container
    map.invalidateSize(); // Invalidate map size after container becomes visible
}

// --- Newsletter Subscription Function ---
newsletterForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = newsletterEmailInput.value.trim();
    newsletterStatus.textContent = 'Subscribing...';
    newsletterStatus.style.color = 'var(--text-secondary)';

    if (!email) {
        newsletterStatus.textContent = 'Please enter a valid email address.';
        newsletterStatus.style.color = 'var(--error-color)';
        return;
    }

    try {
        const res = await fetch('/api/newsletter/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await res.json();
        if (res.ok) {
            newsletterStatus.textContent = data.message;
            newsletterStatus.style.color = 'var(--text-primary)'; // Changed to white on success
            newsletterEmailInput.value = ''; // Clear input on success
        } else {
            newsletterStatus.textContent = data.message || 'Subscription failed. Please try again.';
            newsletterStatus.style.color = 'var(--error-color)';
        }
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        newsletterStatus.textContent = 'An error occurred. Please try again later.';
        newsletterStatus.style.color = 'var(--error-color)';
    }
});

// --- Add New Admin Function ---
addAdminForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    addAdminStatus.textContent = ''; // Clear previous messages

    if (!isAdmin) {
        addAdminStatus.textContent = 'Error: You must be logged in as an admin to add new admins.';
        addAdminStatus.style.color = 'var(--error-color)';
        return;
    }

    const username = newAdminUsernameInput.value.trim();
    const password = newAdminPasswordInput.value.trim();
    const confirmPassword = confirmAdminPasswordInput.value.trim();

    if (!username || !password || !confirmPassword) {
        addAdminStatus.textContent = 'Please fill in all fields.';
        addAdminStatus.style.color = 'var(--error-color)';
        return;
    }

    if (password !== confirmPassword) {
        addAdminStatus.textContent = 'Passwords do not match.';
        addAdminStatus.style.color = 'var(--error-color)';
        return;
    }
    if (password.length < 6) {
        addAdminStatus.textContent = 'Password must be at least 6 characters long.';
        addAdminStatus.style.color = 'var(--error-color)';
        return;
    }


    try {
        const res = await fetch('/api/admin/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        if (res.ok) {
            showCustomModal('Admin Added', data.message);
            newAdminUsernameInput.value = '';
            newAdminPasswordInput.value = '';
            confirmAdminPasswordInput.value = '';
            addAdminStatus.textContent = ''; // Clear status on success
        } else {
            addAdminStatus.textContent = data.message || 'Failed to add admin. Try again.';
            addAdminStatus.style.color = 'var(--error-color)';
        }
    } catch (error) {
        console.error('Add admin error:', error);
        addAdminStatus.textContent = 'An error occurred while adding admin.';
        addAdminStatus.style.color = 'var(--error-color)';
    }
});


// --- Event Listeners ---
// Dynamically populate city buttons on the home page and attach event listeners
cityButtonsContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('city-button')) {
        const city = event.target.dataset.city;
        fetchWeather(city);
    }
});

resetFormBtn.addEventListener('click', resetForm);
generateDataBtn.addEventListener('click', generatePastWeatherData);
deleteAllRecordsBtn.addEventListener('click', deleteAllRecords);

themeToggle.addEventListener('change', () => {
    if (themeToggle.value === 'light') {
        document.body.classList.add('light-mode');
        localStorage.setItem('theme', 'light');
    } else {
        document.body.classList.remove('light-mode');
        localStorage.setItem('theme', 'dark');
    }
    const selectedGraphCity = graphCitySelect.value;
    fetch('/api/weather').then(res => res.json()).then(data => {
        drawLineTempChart(selectedGraphCity, data);
    }).catch(e => console.error("Error fetching data for chart redraw:", e));
});

graphCitySelect.addEventListener('change', async () => {
    const selectedCity = graphCitySelect.value;
    const allRecordsRes = await fetch('/api/weather');
    const allRecords = await allRecordsRes.json();
    drawLineTempChart(selectedCity, allRecords);
});

cityStatsSelect.addEventListener('change', () => {
    const selectedCity = cityStatsSelect.value;
    fetchAndDisplayCityStats(selectedCity);
});

applyFilterBtn.addEventListener('click', () => {
    if (!isAdmin) {
        showCustomModal('Access Denied', 'You must be logged in as an admin to apply filters to the table.', false);
        return;
    }
    const filters = {
        city: filterCityInput.value.trim(),
        fromDate: filterFromDateInput.value,
        toDate: filterToDateInput.value
    };
    fetchRecords(filters);
});

clearFilterBtn.addEventListener('click', () => {
    if (!isAdmin) {
        showCustomModal('Access Denied', 'You must be logged in as an admin to clear filters.', false);
        return;
    }
    filterCityInput.value = '';
    filterFromDateInput.value = '';
    filterToDateInput.value = '';
    fetchRecords({});
});

// Navigation links event listener
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = e.target.dataset.section;
        showSection(sectionId);
    });
});

// Admin login toggle
adminLoginToggle.addEventListener('click', toggleAdminView);
adminLoginForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent default form submission
    handleAdminLogin();
});
loginCancelBtn.addEventListener('click', () => {
    adminLoginModal.classList.remove('visible'); // Hide the modal
    loginStatus.textContent = ''; // Clear status message
});


// --- Initial Load ---
window.addEventListener('load', () => {
    // Apply saved theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.classList.toggle('light-mode', savedTheme === 'light');
    themeToggle.value = savedTheme;

    // Set default date for record form
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    recordedAtAdminInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
    recordedAtAdminInput.setAttribute('placeholder', 'Recorded At (YYYY-MM-DD HH:MM)');

    // Populate the admin city dropdown and home page city buttons
    populateAdminCityDropdown();
    populateCityButtonsForHomePage();


    // Initialize map (hidden by default)
    initMap();

    // Set initial view and apply client/admin visibility
    showSection('home-section');
    updateDashboardView(); // Apply visibility classes on load based on initial isAdmin (false)

    // Initial data fetch for dashboard, will load view-only for clients
    fetchRecords();
    fetchAndDisplayCityStats(cityStatsSelect.value || '');
});

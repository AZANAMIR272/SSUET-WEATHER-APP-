# 🌤️ SSUET Weather App 
[🌤️ Live SSUET Weather App](https://azanamir272.github.io/SSUET-WEATHER-APP-/)

> A responsive full-stack weather web app with map integration, dashboard, blog, events, and newsletter system.
> Built using **HTML, CSS, JavaScript, Node.js (Express), and SQL Server**.
<img width="1236" height="632" alt="Screenshot 2025-06-16 011920" src="https://github.com/user-attachments/assets/94b314d9-85d6-414b-8311-6b65f9e5ac63" />
<img width="1209" height="620" alt="Screenshot 2025-06-16 011629" src="https://github.com/user-attachments/assets/bfbee23c-42ff-4126-8c52-2a02c31e6a80" />
<img width="1210" height="633" alt="Screenshot 2025-06-16 011120" src="https://github.com/user-attachments/assets/5c46eb82-eff3-48ea-b0ea-d4744a325628" />



## 🧭 Table of Contents

* [🌦️ Overview](#️-overview)
* [🚀 Features](#-features)
* [🛠️ Tech Stack](#️-tech-stack)
* [⚙️ Setup Guide](#️-setup-guide)
* [🗺️ Map Integration](#️-map-integration)
* [📊 Dashboard & Database](#-dashboard--database)
* [📰 Blog & Events](#-blog--events)
* [📩 Newsletter Subscription](#-newsletter-subscription)
* [📱 Responsive Design](#-responsive-design)
* [💡 Future Improvements](#-future-improvements)
* [📜 License](#-license)

---

## 🌦️ Overview

**Weather Dashboard Pro** provides real-time weather information with a sleek interface, integrated world map, and content-driven features.
It combines **data, design, and interactivity** to create a complete platform for weather insights, user engagement, and content updates.

---

## 🚀 Features

### 🌍 Core Modules

✅ **Real-Time Weather:** Fetches data from OpenWeatherMap API.
✅ **Caching System:** Reduces redundant API calls via SQL Server.
✅ **Dynamic UI:** Displays live temperature, wind, humidity, and conditions.

### 🗺️ Map Integration

✅ Interactive **Leaflet.js map** with city weather markers.
✅ Click any location to instantly view current weather.
✅ Pan and zoom support with real-time updates.

### 📊 Admin Dashboard

✅ Displays most-searched cities and recent activity.
✅ Logs weather requests and API usage metrics.
✅ (Optional) User roles & JWT authentication.

### 📰 Blog & Events

✅ Blog posts about climate awareness and technology.
✅ Event scheduler for weather-related conferences or updates.
✅ Both managed through SQL Server with CRUD APIs.

### 📩 Newsletter Subscription

✅ Users can subscribe to weather alerts via email.
✅ Stored securely in SQL Server.
✅ Integrated with **Nodemailer** or **SendGrid**.

### 📱 Responsive UI

✅ Works seamlessly on **desktop, tablet, and mobile**.
✅ Clean, minimal, and modern CSS design.
✅ Uses **Flexbox + Grid** layout.

---

## 🛠️ Tech Stack

| Layer          | Technology                                          |
| -------------- | --------------------------------------------------- |
| **Frontend**   | HTML5, CSS3, Vanilla JS                             |
| **Backend**    | Node.js, Express                                    |
| **Database**   | Microsoft SQL Server                                |
| **APIs**       | OpenWeatherMap, Leaflet.js                          |
| **Libraries**  | axios, mssql, cors, dotenv, nodemailer              |
| **Deployment** | GitHub Pages (frontend) + Render / Vercel (backend) |



## ⚙️ Setup Guide

### 🧩 Prerequisites

* Node.js (v16 or higher)
* Microsoft SQL Server
* API key from [OpenWeatherMap](https://openweathermap.org/api)

### 🧰 Installation

```bash
# Clone repository
git clone https://github.com/your-username/weather-dashboard-pro.git
cd weather-dashboard-pro/server

# Install dependencies
npm install

# Configure environment
cp .env.example .env
```

### 🧾 Example `.env` file

```
PORT=4000
WEATHER_API_KEY=your_openweather_api_key
DB_USER=sa
DB_PASSWORD=YourPassword
DB_SERVER=localhost
DB_DATABASE=WeatherPro
DB_PORT=1433
MAIL_USER=your_email@example.com
MAIL_PASS=your_app_password
```

### ▶️ Run Application

```bash
# Run backend
npm run dev

# Access in browser
http://localhost:4000
```

---

## 🗺️ Map Integration

* Uses **Leaflet.js** for open-source map visualization.
* Dynamically adds markers showing temperature and weather icons.
* Clicking a marker displays detailed data for that location.

Example snippet (client/js/map.js):

```js
const map = L.map('map').setView([24.8607, 67.0011], 6);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);
```

---

## 📊 Dashboard & Database

* Backend logs every search request in SQL Server.
* Cached weather results are stored in `CityWeather` table.
* `Subscribers`, `BlogPosts`, and `Events` tables handle user and content data.

---

## 📰 Blog & Events

* Admin can add new blog posts and upcoming weather events via the dashboard.
* Blog posts are dynamically fetched from the backend API.
* Events display with date, location, and description.

---

## 📩 Newsletter Subscription

* Email subscription form with validation.
* Backend endpoint:

  ```
  POST /api/subscribe
  { "email": "user@example.com" }
  ```
* Data stored in `Subscribers` table and confirmation emails sent using Nodemailer.

---

## 📱 Responsive Design

* Optimized for all devices.
* Built using modern **CSS Grid and Flexbox**.
* Includes smooth animations, shadows, and transitions.

---

## 💡 Future Improvements

* Add 7-day forecast view.
* Add user authentication and profile system.
* Integrate **Chart.js** for temperature trend visualization.
* Add dark/light mode toggle.

---

## 📜 License

This project is licensed under the **MIT License** — you are free to modify and use it.

---

## 🌟 Author

**Syed Muhammad Azan**



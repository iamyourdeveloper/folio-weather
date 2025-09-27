# Text Editing Guide - FolioWeather (Weather App)

This guide provides specific file locations and line numbers where you can edit text content throughout the Weather App.

## 🏷️ App Name/Brand

The app name is controlled by the `VITE_APP_NAME` environment variable with "Weather App" as fallback.

### Locations to Edit:

**Homepage Title:**
```jsx
// File: frontend/src/pages/HomePage.jsx (Lines 282-284)
<h1 className="home-hero__title">
  Welcome to {import.meta.env.VITE_APP_NAME || "Weather App"}
</h1>

// <h1 className="home-hero__title">
  // Welcome to {import.meta.env.VITE_APP_NAME || "FolioWeather"}
// </h1>
```

**Header Brand:**
```jsx
// File: frontend/src/components/layout/Header.jsx (Lines 507-509)
<span className="header__brand-text">
  {import.meta.env.VITE_APP_NAME || "Weather App"}
</span>
```

**Footer Brand:**
```jsx
// File: frontend/src/components/layout/Footer.jsx (Lines 27-29)
<h4 className="footer__section-title">
  {import.meta.env.VITE_APP_NAME || "Weather App"}
</h4>
```

**Document Title:**
```jsx
// File: frontend/src/main.jsx (Lines 7-8)
const appName = import.meta.env.VITE_APP_NAME || 'Weather App';
document.title = appName;
```

## 🏠 Homepage Content

**File:** `frontend/src/pages/HomePage.jsx`

### Hero Section Subtitle:
```jsx
// Lines 285-288
<p className="home-hero__subtitle">
  Get real-time weather information, forecasts, and manage your
  favorite locations
</p>
```

### Action Buttons:
```jsx
// Lines 292-295 (Search Button)
<Link to="/search" className="btn btn--primary">
  <Search size={20} />
  Search Weather
</Link>

// Lines 297-300 (Favorites Button)
<Link to="/favorites" className="btn btn--secondary">
  <Heart size={20} />
  View Favorites
</Link>
```

## 🧭 Navigation Menu

**File:** `frontend/src/components/layout/Header.jsx`

### Navigation Labels:
```jsx
// Lines 51-57
const navItems = [
  { path: "/", label: "Home", icon: Cloud },
  { path: "/search", label: "Search", icon: Search },
  { path: "/favorites", label: "Favorites", icon: Heart },
  { path: "/settings", label: "Settings", icon: Settings },
  { path: "/test", label: "API Test", icon: TestTube },
];
```

## 🔍 Search Elements

**File:** `frontend/src/components/layout/Header.jsx`

### Search Placeholders:
```jsx
// Line 636 (Desktop Search)
placeholder="Enter city name (e.g., London, New York, Tokyo)"

// Line 799 (Mobile Search)
placeholder="Enter city name (e.g., London, New York, Tokyo)"
```

### Search Button Text:
```jsx
// Line 648 (Desktop Search Button)
{isSearching ? "Searching..." : "Search"}

// Line 811 (Mobile Search Button)
{isSearching ? "Searching..." : "Search"}
```

## 🦶 Footer Content

**File:** `frontend/src/components/layout/Footer.jsx`

### App Description:
```jsx
// Lines 30-34
<p className="footer__description">
  A modern weather application built with React 19 and the MERN
  stack. Get real-time weather data, forecasts, and manage your
  favorite locations.
</p>
```

### Quick Links Section:
```jsx
// Lines 40-67
<h4 className="footer__section-title">Quick Links</h4>
<ul className="footer__links">
  <li>
    <Link to="/" className="footer__link" onClick={scrollToTop}>
      Home
    </Link>
  </li>
  <li>
    <Link to="/search" className="footer__link" onClick={scrollToTop}>
      Search Weather
    </Link>
  </li>
  <li>
    <Link to="/favorites" className="footer__link" onClick={scrollToTop}>
      Favorites
    </Link>
  </li>
  <li>
    <Link to="/settings" className="footer__link" onClick={scrollToTop}>
      Settings
    </Link>
  </li>
  <li>
    <Link to="/test" className="footer__link" onClick={scrollToTop}>
      API Test
    </Link>
  </li>
</ul>
```

### Weather Data Section:
```jsx
// Lines 72-87
<h4 className="footer__section-title">Weather Data</h4>
<p className="footer__text">
  Weather data provided by{" "}
  <a
    href="https://openweathermap.org/"
    target="_blank"
    rel="noopener noreferrer"
    className="footer__external-link"
  >
    OpenWeatherMap
    <ExternalLink size={14} />
  </a>
</p>
<p className="footer__text">
  Location services powered by the browser's Geolocation API.
</p>
```

### About Section:
```jsx
// Lines 92-96
<h4 className="footer__section-title">About</h4>
<p className="footer__text">
  Built as a learning project to demonstrate modern web development
  practices with React 19, Node.js, Express, and MongoDB.
</p>
```

### Copyright:
```jsx
// Lines 114-118
<p className="footer__copyright">
  © {currentYear} FolioWeather. Made with{" "}
  <Heart size={16} className="footer__heart" /> for learning and
  demonstration purposes.
</p>
```

### Bottom Disclaimer:
```jsx
// Lines 121-123
<span className="footer__text footer__text--small">
  This is a demo application for educational purposes.
</span>
```

## ⚙️ Settings Page

**File:** `frontend/src/pages/SettingsPage.jsx`

### Page Header:
```jsx
// Lines 104-110
<h1 className="settings-header__title">
  <Settings size={28} />
  Settings
</h1>
<p className="settings-header__subtitle">
  Customize your weather app experience
</p>
```

## 📱 Page Titles and Meta

### Document Title:
- **File:** `frontend/src/main.jsx` (Lines 7-8)
- **Environment Variable:** Set `VITE_APP_NAME` in your `.env` file

### Page-Specific Titles:
Each page component may have its own title structure. Check individual page files in `frontend/src/pages/` for page-specific headings and titles.

## 🎨 CSS Classes for Text Styling

If you want to change text styling, these are the main CSS classes:

- `.home-hero__title` - Homepage main title
- `.home-hero__subtitle` - Homepage subtitle
- `.header__brand-text` - Header brand text
- `.nav__link-text` - Navigation link text
- `.footer__section-title` - Footer section headings
- `.footer__description` - Footer description text
- `.footer__text` - General footer text
- `.footer__copyright` - Copyright text

## 🔧 Quick Edit Checklist

### To Change App Name Everywhere:
1. Set `VITE_APP_NAME` in your `.env` file, OR
2. Replace `"Weather App"` fallback text in:
   - `frontend/src/main.jsx` (line 7)
   - `frontend/src/pages/HomePage.jsx` (line 283)
   - `frontend/src/components/layout/Header.jsx` (line 508)
   - `frontend/src/components/layout/Footer.jsx` (line 28)

### To Change Navigation:
1. Edit the `navItems` array in `frontend/src/components/layout/Header.jsx` (lines 51-57)
2. Update corresponding footer links in `frontend/src/components/layout/Footer.jsx` (lines 42-66)

### To Change Homepage Content:
1. Edit hero subtitle in `frontend/src/pages/HomePage.jsx` (lines 285-288)
2. Edit button texts in `frontend/src/pages/HomePage.jsx` (lines 294, 299)

### To Change Footer:
1. Edit app description (lines 30-34)
2. Edit about section (lines 92-96)
3. Edit copyright (lines 114-118)

---

**Note:** Always test your changes in development mode before deploying. Use `npm run dev` in the frontend directory to see your changes live.

import { Heart, Github, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Footer component with app information and links
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();
  const appVersion = import.meta.env.VITE_APP_VERSION || "1.0.0";

  // Ensure viewport scrolls to top when navigating via footer links
  const scrollToTop = () => {
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      // fallback for older browsers
      window.scrollTo(0, 0);
    }
  };

  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__content">
          {/* App Info */}
          <div className="footer__section">
            <h4 className="footer__section-title">
              {import.meta.env.VITE_APP_NAME || "Weather App"}
            </h4>
            <p className="footer__description">
              A modern weather application built with React 19 and the MERN
              stack. Get real-time weather data, forecasts, and manage your
              favorite locations.
            </p>
            <p className="footer__version">Version {appVersion}</p>
          </div>

          {/* Quick Links */}
          <div className="footer__section">
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
          </div>

          {/* Weather Data Source */}
          <div className="footer__section">
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
          </div>

          {/* Developer Info */}
          <div className="footer__section">
            <h4 className="footer__section-title">About</h4>
            <p className="footer__text">
              Built as a learning project to demonstrate modern web development
              practices with React 19, Node.js, Express, and MongoDB.
            </p>
            <div className="footer__social">
              <a
                href="https://github.com/iamyourdeveloper/folio-weather"
                target="_blank"
                rel="noopener noreferrer"
                className="footer__social-link"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer__bottom">
          <div className="footer__bottom-content">
            <p className="footer__copyright">
              © {currentYear} FolioWeather. Made with{" "}
              <Heart size={16} className="footer__heart" /> for learning and
              demonstration purposes.
            </p>

            <div className="footer__bottom-links">
              <span className="footer__text footer__text--small">
                This is a demo application for educational purposes.
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

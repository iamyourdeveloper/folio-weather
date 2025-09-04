import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryProvider } from "@context/QueryProvider";
import WeatherProvider from "@context/WeatherContext";
import Header from "@components/layout/Header";
import Footer from "@components/layout/Footer";
import TopBarProgress from "@components/ui/TopBarProgress";
import ConnectionStatus from "@components/ui/ConnectionStatus";
import HomePage from "@pages/HomePage";
import SearchPage from "@pages/SearchPage";
import FavoritesPage from "@pages/FavoritesPage";
import SettingsPage from "@pages/SettingsPage";
import TestPage from "@pages/TestPage";
import ErrorBoundary from "@components/common/ErrorBoundary";
import "@styles/App.css";

function App() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <WeatherProvider>
          <Router>
            <div className="app">
              <TopBarProgress />
              <ConnectionStatus />
              <Header />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/favorites" element={<FavoritesPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/test" element={<TestPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </WeatherProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}

export default App;

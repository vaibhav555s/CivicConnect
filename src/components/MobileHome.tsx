import React, { useState, useEffect } from "react";
import {
  Plus,
  TrendingUp,
  MapPin,
  Camera,
  Cloud,
  Sun,
  CloudRain,
} from "lucide-react";

interface WeatherData {
  city: string;
  state: string;
  temperature: number;
  condition: string;
  icon: string;
}

interface MobileHomeProps {
  onNavigate: (tab: string) => void;
}

const MobileHome: React.FC<MobileHomeProps> = ({ onNavigate }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  // Dynamic greeting based on time
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) return "Good Morning! ☀️";
    if (hour >= 12 && hour < 17) return "Good Afternoon! 🌤️";
    if (hour >= 17 && hour < 21) return "Good Evening! 🌅";
    return "Good Night! 🌙";
  };

  // Get weather icon based on condition
  const getWeatherIcon = (condition: string) => {
    if (condition.includes("rain")) return "🌧️";
    if (condition.includes("cloud")) return "☁️";
    if (condition.includes("clear")) return "☀️";
    if (condition.includes("thunder")) return "⛈️";
    return "🌤️";
  };

  // Contextual message based on weather
  const getWeatherContextMessage = (condition: string) => {
    if (condition.includes("rain"))
      return "Perfect time to report drainage issues!";
    if (condition.includes("hot"))
      return "Great weather to spot infrastructure problems!";
    return "Ready to make your city better?";
  };

  // Fetch location and weather
  useEffect(() => {
    const fetchLocationAndWeather = async () => {
      try {
        // Get user location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;

              // For demo purposes, you can use mock data or integrate with weather API
              // Here's mock data for Mumbai
              const mockWeatherData: WeatherData = {
                city: "Mumbai",
                state: "Maharashtra",
                temperature: 28,
                condition: "partly cloudy",
                icon: "🌤️",
              };

              setWeather(mockWeatherData);
              setLoading(false);

              // Real implementation would call weather API here:
              // const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`);
            },
            (error) => {
              // Fallback to default location
              setWeather({
                city: "Mumbai",
                state: "Maharashtra",
                temperature: 28,
                condition: "partly cloudy",
                icon: "🌤️",
              });
              setLoading(false);
            }
          );
        }
      } catch (error) {
        setLoading(false);
      }
    };

    fetchLocationAndWeather();
  }, []);

  return (
    <section className="px-4 pt-8 pb-12 bg-gradient-to-b from-subtle to-surface">
      <div className="max-w-lg mx-auto">
        {/* Enhanced Personal Greeting */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-accent mb-2">
            {getTimeBasedGreeting()}
          </h1>

          {/* Location & Weather Context */}
          {!loading && weather && (
            <div className="flex items-center flex-wrap gap-4 text-text-secondary mb-3">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span className="font-medium">
                  {weather.city}, {weather.state}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span>{weather.icon}</span>
                <span>
                  {weather.temperature}°C • {weather.condition}
                </span>
              </div>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="flex items-center space-x-2 text-text-secondary mb-3">
              <div className="w-4 h-4 animate-pulse bg-gray-300 rounded"></div>
              <span className="text-sm">Getting your location...</span>
            </div>
          )}

          {/* Contextual Message */}
          <p className="text-text-secondary">
            {weather
              ? getWeatherContextMessage(weather.condition)
              : "Ready to make your city better?"}
          </p>
        </div>

        {/* Weather-Based Alert (conditional) */}
        {weather && weather.condition.includes("rain") && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <span className="text-xl mr-3">🌧️</span>
              <div>
                <div className="font-medium text-blue-900 text-sm">
                  Monsoon Alert
                </div>
                <div className="text-xs text-blue-700">
                  Perfect time to report waterlogging and pothole issues!
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-surface border border-borders rounded-2xl p-6 text-center card-hover">
            <div className="text-2xl font-semibold text-accent mb-1">12</div>
            <div className="text-sm text-text-secondary">Your Reports</div>
          </div>
          <div className="bg-surface border border-borders rounded-2xl p-6 text-center card-hover">
            <div className="text-2xl font-semibold text-emerald-600 mb-1">
              8
            </div>
            <div className="text-sm text-text-secondary">Resolved</div>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={() => onNavigate("report")}
          className="w-full btn-primary py-4 rounded-2xl text-lg mb-8 flex items-center justify-center space-x-2"
        >
          <Camera className="w-5 h-5" />
          <span>Report New Issue</span>
        </button>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigate("reports")}
            className="bg-surface border border-borders rounded-xl p-4 text-center card-hover"
          >
            <div className="text-xl mb-2">📊</div>
            <div className="text-sm font-medium text-text-secondary">
              My Reports
            </div>
          </button>
          <button
            onClick={() => onNavigate("feed")}
            className="bg-surface border border-borders rounded-xl p-4 text-center card-hover"
          >
            <div className="text-xl mb-2">📍</div>
            <div className="text-sm font-medium text-text-secondary">
              Nearby Issues
            </div>
          </button>
        </div>
      </div>
    </section>
  );
};

export default MobileHome;

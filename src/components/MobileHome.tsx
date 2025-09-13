import React, { useState, useEffect } from "react";
import {
  Camera,
  MapPin,
  BarChart3,
  ArrowUpRight,
  TrendingUp,
  Users,
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

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning! ☀️";
    if (hour >= 12 && hour < 17) return "Good Afternoon! 🌤️";
    if (hour >= 17 && hour < 21) return "Good Evening! 🌅";
    return "Good Night! 🌙";
  };

  const fetchLocationAndWeather = async () => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const mockWeatherData: WeatherData = {
        city: "Mumbai",
        state: "Maharashtra",
        temperature: 28,
        condition: "partly cloudy",
        icon: "🌤️",
      };

      setWeather(mockWeatherData);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocationAndWeather();
  }, []);

  return (
    <section className="px-4 pt-12 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-sm mx-auto">
        {/* Header with subtle animation */}
        <div className="mb-16 animate-fade-in">
          <h1 className="text-4xl font-bold text-black mb-3 tracking-tight leading-tight">
            {getTimeBasedGreeting()}
          </h1>

          {/* Location Card - Clean but present */}
          {!loading && weather && (
            <div className="inline-flex items-center space-x-3 bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-100 animate-slide-up">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {weather.city} • {weather.temperature}°C {weather.icon}
              </span>
            </div>
          )}

          {loading && (
            <div className="inline-flex items-center space-x-3 bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-100">
              <div className="w-4 h-4 bg-gray-300 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-500">Getting location...</span>
            </div>
          )}

          <p className="text-gray-600 text-lg mt-4">
            Ready to make your city better?
          </p>
        </div>

        {/* Hero Button with micro-interaction */}
        <div className="mb-14 animate-fade-in-delay">
          <button
            onClick={() => onNavigate("report")}
            className="group w-full bg-black text-white py-5 rounded-2xl text-xl font-semibold hover:bg-gray-900 transition-all duration-300 active:scale-95 shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center justify-center space-x-3">
              <Camera className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
              <span>Report New Issue</span>
            </div>
          </button>

          {/* Subtle hint */}
          <p className="text-center text-xs text-gray-500 mt-3 opacity-75">
            One tap to make a difference
          </p>
        </div>

        {/* Enhanced Stats with better visual weight */}
        <div className="grid grid-cols-2 gap-4 mb-12 animate-fade-in-delay-2">
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
            <div className="text-4xl font-black text-black mb-2 hover:scale-110 transition-transform duration-300 cursor-default">
              12
            </div>
            <div className="text-sm text-gray-600 font-medium">
              Your Reports
            </div>
            <div className="text-xs text-emerald-600 font-semibold mt-1">
              +2 this week
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
            <div className="text-4xl font-black text-emerald-600 mb-2 hover:scale-110 transition-transform duration-300 cursor-default">
              8
            </div>
            <div className="text-sm text-gray-600 font-medium">Resolved</div>
            <div className="text-xs text-emerald-600 font-semibold mt-1">
              67% success
            </div>
          </div>
        </div>

        {/* Community Insight - Adds visual interest */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 mb-8 border border-blue-100 animate-fade-in-delay-3">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Community Activity</h3>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                24 issues reported nearby
              </span>
            </div>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
              +15% this week
            </span>
          </div>
        </div>

        {/* Action Cards - Better visual hierarchy */}
        <div className="space-y-3 animate-fade-in-delay-4">
          <button
            onClick={() => onNavigate("feed")}
            className="w-full bg-white border border-gray-200 rounded-2xl p-5 hover:border-black hover:shadow-lg transition-all duration-300 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-300">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="text-lg font-semibold text-black">
                    Nearby Issues
                  </div>
                  <div className="text-sm text-gray-500">
                    Explore your community
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                  24
                </span>
                <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
              </div>
            </div>
          </button>

          <button
            onClick={() => onNavigate("reports")}
            className="w-full bg-white border border-gray-200 rounded-2xl p-5 hover:border-black hover:shadow-lg transition-all duration-300 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors duration-300">
                  <BarChart3 className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="text-left">
                  <div className="text-lg font-semibold text-black">
                    My Reports
                  </div>
                  <div className="text-sm text-gray-500">
                    Track your progress
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
                  67%
                </span>
                <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-fade-in-delay {
          animation: fade-in 0.6s ease-out 0.1s both;
        }

        .animate-fade-in-delay-2 {
          animation: fade-in 0.6s ease-out 0.2s both;
        }

        .animate-fade-in-delay-3 {
          animation: fade-in 0.6s ease-out 0.3s both;
        }

        .animate-fade-in-delay-4 {
          animation: fade-in 0.6s ease-out 0.4s both;
        }

        .animate-slide-up {
          animation: slide-up 0.4s ease-out 0.2s both;
        }
      `}</style>
    </section>
  );
};

export default MobileHome;

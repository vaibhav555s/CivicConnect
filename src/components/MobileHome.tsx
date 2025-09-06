import React, { useState, useEffect } from "react";
import {
  Plus,
  TrendingUp,
  MapPin,
  Camera,
  Cloud,
  Sun,
  CloudRain,
  BarChart3,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Bell,
  Award,
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

  // Mock recent activity data
  const recentActivity = [
    {
      id: 1,
      type: "resolved",
      title: "Pothole on MG Road",
      time: "2h ago",
      category: "🛣️",
    },
    {
      id: 2,
      type: "new",
      title: "Street light issue",
      time: "5h ago",
      category: "💡",
    },
    {
      id: 3,
      type: "progress",
      title: "Water leakage fixed",
      time: "1d ago",
      category: "💧",
    },
  ];

  // Mock trending issues
  const trendingIssues = [
    { issue: "Potholes", count: 24, trend: "+12%" },
    { issue: "Lighting", count: 18, trend: "+8%" },
    { issue: "Drainage", count: 15, trend: "+5%" },
  ];

  const fetchLocationAndWeather = async () => {
    try {
      setLoading(true);
      // Simulate realistic loading time
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
    <section className="px-4 pt-6 pb-12 bg-gradient-to-b from-subtle to-surface min-h-screen">
      <div className="max-w-lg mx-auto">
        {/* Header with Notification */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-accent">
              {getTimeBasedGreeting()}
            </h1>
          </div>
          <button className="p-2 hover:bg-surface rounded-xl transition-colors relative">
            <Bell className="w-5 h-5 text-text-secondary" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          </button>
        </div>

        {/* Location & Weather Context */}
        {!loading && weather && (
          <div className="bg-surface border border-borders rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-text-secondary" />
                <div>
                  <div className="font-medium text-accent text-sm">
                    {weather.city}, {weather.state}
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-text-secondary">
                    <span>{weather.icon}</span>
                    <span>
                      {weather.temperature}°C • {weather.condition}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-text-secondary">Air Quality</div>
                <div className="text-sm font-medium text-emerald-600">
                  Good 🟢
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="bg-surface border border-borders rounded-2xl p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 animate-pulse bg-gray-300 rounded"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3"></div>
              </div>
            </div>
          </div>
        )}

        {/* Impact Stats - Enhanced */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-surface border border-borders rounded-xl p-4 text-center card-hover">
            <div className="text-xl font-semibold text-accent mb-1">12</div>
            <div className="text-xs text-text-secondary">Your Reports</div>
            <div className="text-xs text-emerald-600 font-medium mt-1">
              +2 this week
            </div>
          </div>
          <div className="bg-surface border border-borders rounded-xl p-4 text-center card-hover">
            <div className="text-xl font-semibold text-emerald-600 mb-1">8</div>
            <div className="text-xs text-text-secondary">Resolved</div>
            <div className="text-xs text-emerald-600 font-medium mt-1">
              67% success
            </div>
          </div>
          <div className="bg-surface border border-borders rounded-xl p-4 text-center card-hover">
            <div className="text-xl font-semibold text-amber-600 mb-1">156</div>
            <div className="text-xs text-text-secondary">Community</div>
            <div className="text-xs text-blue-600 font-medium mt-1">
              Impact Points
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={() => onNavigate("report")}
          className="w-full btn-primary py-4 rounded-2xl text-lg mb-6 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-shadow"
        >
          <Camera className="w-5 h-5" />
          <span>Report New Issue</span>
        </button>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => onNavigate("reports")}
            className="bg-surface border border-borders rounded-xl p-4 card-hover flex items-center space-x-3"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <div className="text-sm font-medium text-accent">My Reports</div>
              <div className="text-xs text-text-secondary">Track progress</div>
            </div>
          </button>
          <button
            onClick={() => onNavigate("feed")}
            className="bg-surface border border-borders rounded-xl p-4 card-hover flex items-center space-x-3"
          >
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-left">
              <div className="text-sm font-medium text-accent">
                Nearby Issues
              </div>
              <div className="text-xs text-text-secondary">24 active</div>
            </div>
          </button>
        </div>

        {/* Community Impact Section */}
        <div className="bg-surface border border-borders rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-accent">
              Community Impact
            </h3>
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-accent">
                    Issues Resolved
                  </div>
                  <div className="text-xs text-text-secondary">This month</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-accent">47</div>
                <div className="text-xs text-emerald-600">+23%</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-accent">
                    Active Citizens
                  </div>
                  <div className="text-xs text-text-secondary">
                    In your area
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-accent">234</div>
                <div className="text-xs text-blue-600">+12%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-surface border border-borders rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-accent">
              Recent Activity
            </h3>
            <button
              onClick={() => onNavigate("feed")}
              className="text-sm text-blue-600 font-medium flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3">
                <div className="text-lg">{activity.category}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-accent">
                    {activity.title}
                  </div>
                  <div className="text-xs text-text-secondary flex items-center space-x-2">
                    <Clock className="w-3 h-3" />
                    <span>{activity.time}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        activity.type === "resolved"
                          ? "bg-emerald-100 text-emerald-600"
                          : activity.type === "new"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-amber-100 text-amber-600"
                      }`}
                    >
                      {activity.type === "resolved"
                        ? "✅ Resolved"
                        : activity.type === "new"
                        ? "🆕 New"
                        : "🔄 In Progress"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Issues Insight */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-5">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">
              Trending Issues
            </h3>
          </div>
          <div className="space-y-2">
            {trendingIssues.map((issue, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="text-sm font-medium text-blue-800">
                  {issue.issue}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-blue-700">{issue.count}</span>
                  <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                    {issue.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MobileHome;

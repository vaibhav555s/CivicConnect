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
  onAuthRequired: () => void;
}

const MobileHome: React.FC<MobileHomeProps> = ({ onNavigate, onAuthRequired }) => {
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
    <section className="px-4 pt-12 pb-24 min-h-screen">
      <div className="max-w-sm mx-auto">
        {/* Header with subtle animation */}
        <div className="mb-10 animate-fade-in">
          <h1 className="text-[2.6rem] font-black text-zinc-950 mb-3 leading-[1.05]" style={{ letterSpacing: '-0.04em' }}>
            {getTimeBasedGreeting()}
          </h1>

          {/* Location Card - Clean but present */}
          {!loading && weather && (
            <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-md rounded-full px-4 py-2 border border-zinc-200/50 shadow-sm animate-slide-up">
              <MapPin className="w-4 h-4 text-zinc-500" />
              <span className="text-sm font-medium text-zinc-700 tracking-tight">
                {weather.city} • {weather.temperature}°C {weather.icon}
              </span>
            </div>
          )}

          {loading && (
            <div className="inline-flex items-center space-x-3 bg-white/60 backdrop-blur-md rounded-full px-4 py-2 border border-zinc-200/50 shadow-sm">
              <div className="w-3.5 h-3.5 bg-zinc-300 rounded-full animate-pulse"></div>
              <span className="text-sm text-zinc-500 font-medium">Locating...</span>
            </div>
          )}

          <p className="text-zinc-500 text-[15px] mt-4 font-medium" style={{ letterSpacing: '-0.01em' }}>
            Help build a better city — one report at a time.
          </p>
        </div>

        {/* Hero Button with micro-interaction */}
        <div className="mb-12 animate-fade-in-delay">
          <button
            onClick={() => onAuthRequired()}
            className="group w-full bg-zinc-950 text-white py-4 px-6 rounded-full text-[17px] font-semibold hover:bg-zinc-800 transition-all duration-200 active:scale-[0.98] shadow-md flex items-center justify-center space-x-2.5"
            style={{ letterSpacing: '-0.01em' }}
          >
            <Camera className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
            <span>Report an Issue</span>
          </button>

          <p className="text-center text-[11px] font-semibold text-zinc-400 mt-2.5 tracking-widest uppercase">
            One tap · Make a difference
          </p>
        </div>

        {/* Stats row — 3 columns, accent on resolved */}
        <div className="grid grid-cols-3 gap-3 mb-8 animate-fade-in-delay-2">
          <div className="card-premium p-4 text-center cursor-default">
            <div className="text-[2rem] font-black text-zinc-900 mb-0.5" style={{ letterSpacing: '-0.04em' }}>12</div>
            <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">Reports</div>
          </div>
          <div className="card-premium p-4 text-center cursor-default" style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)' }}>
            <div className="text-[2rem] font-black text-indigo-700 mb-0.5" style={{ letterSpacing: '-0.04em' }}>8</div>
            <div className="text-[11px] font-semibold text-indigo-500 uppercase tracking-widest">Resolved</div>
          </div>
          <div className="card-premium p-4 text-center cursor-default">
            <div className="text-[2rem] font-black text-amber-600 mb-0.5" style={{ letterSpacing: '-0.04em' }}>4</div>
            <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">Pending</div>
          </div>
        </div>

        {/* Community Insight — indigo accent card */}
        <div className="rounded-2xl p-5 mb-8 animate-fade-in-delay-3" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6d28d9 100%)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-white/60">This Week</p>
                <h3 className="font-bold text-white text-[15px]" style={{ letterSpacing: '-0.02em' }}>Community Activity</h3>
              </div>
            </div>
            <span className="bg-white/20 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">↑ 15%</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-white/70" />
            <span className="text-[13px] text-white/80 font-medium">24 issues reported nearby</span>
          </div>
        </div>

        {/* Action Cards */}
        <div className="space-y-3 animate-fade-in-delay-4">
          <button
            onClick={() => onNavigate("feed")}
            className="w-full card-premium p-4 group flex items-center justify-between"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 bg-indigo-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-100 transition-colors duration-200">
                <MapPin className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-left">
                <div className="text-[15px] font-semibold text-zinc-900" style={{ letterSpacing: '-0.02em' }}>Nearby Issues</div>
                <div className="text-[12px] text-zinc-500 mt-0.5">Browse your area</div>
              </div>
            </div>
            <ArrowUpRight className="w-4.5 h-4.5 text-zinc-300 group-hover:text-indigo-500 transition-colors duration-200" />
          </button>

          <button
            onClick={() => onNavigate("reports")}
            className="w-full card-premium p-4 group flex items-center justify-between"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 bg-emerald-50 rounded-2xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors duration-200">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-left">
                <div className="text-[15px] font-semibold text-zinc-900" style={{ letterSpacing: '-0.02em' }}>My Reports</div>
                <div className="text-[12px] text-zinc-500 mt-0.5">Track your submissions</div>
              </div>
            </div>
            <ArrowUpRight className="w-4.5 h-4.5 text-zinc-300 group-hover:text-emerald-500 transition-colors duration-200" />
          </button>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in { animation: fade-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-in-delay { animation: fade-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both; }
        .animate-fade-in-delay-2 { animation: fade-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both; }
        .animate-fade-in-delay-3 { animation: fade-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both; }
        .animate-fade-in-delay-4 { animation: fade-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.25s both; }
        .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both; }
      `}</style>
    </section>
  );
};

export default MobileHome;

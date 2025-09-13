import React, { useState } from "react";
import {
  Camera,
  MapPin,
  ArrowLeft,
  Construction,
  Droplets,
  Lightbulb,
  Trash2,
  Trees,
  Shield,
  Upload,
  Send,
  CheckCircle,
  Plus,
  X,
} from "lucide-react";

interface MobileReportSectionProps {
  onBack: () => void;
}

const MobileReportSection: React.FC<MobileReportSectionProps> = ({
  onBack,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [location, setLocation] = useState<any>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<
    "idle" | "requesting" | "granted" | "denied"
  >("idle");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const categories = [
    {
      id: "roads",
      title: "Roads & Transportation",
      department: "Public Works Department",
      icon: Construction,
      color: "bg-blue-100 text-blue-600",
      examples: "Potholes, damaged roads, traffic signals",
    },
    {
      id: "utilities",
      title: "Water & Utilities",
      department: "Water Department",
      icon: Droplets,
      color: "bg-cyan-100 text-cyan-600",
      examples: "Water leaks, drainage issues, sewer problems",
    },
    {
      id: "lighting",
      title: "Street Lighting",
      department: "Electrical Department",
      icon: Lightbulb,
      color: "bg-yellow-100 text-yellow-600",
      examples: "Broken street lights, dark areas",
    },
    {
      id: "waste",
      title: "Waste Management",
      department: "Sanitation Department",
      icon: Trash2,
      color: "bg-green-100 text-green-600",
      examples: "Garbage collection, overflowing bins",
    },
    {
      id: "parks",
      title: "Parks & Recreation",
      department: "Parks Department",
      icon: Trees,
      color: "bg-emerald-100 text-emerald-600",
      examples: "Damaged benches, playground equipment",
    },
    {
      id: "safety",
      title: "Public Safety",
      department: "Municipal Corporation",
      icon: Shield,
      color: "bg-red-100 text-red-600",
      examples: "Unsafe structures, security concerns",
    },
  ];

  // Handle multiple image selection
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      const newImages = [...selectedImages];
      const newPreviews = [...imagePreviews];

      files.forEach((file) => {
        if (newImages.length < 5) {
          // Maximum 5 photos
          newImages.push(file);
          const reader = new FileReader();
          reader.onload = (e) => {
            newPreviews.push(e.target?.result as string);
            setImagePreviews([...newPreviews]);
          };
          reader.readAsDataURL(file);
        }
      });

      setSelectedImages(newImages);
    }
  };

  // Remove specific image
  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

  // Get detailed location with address
  const getCurrentLocation = async () => {
    setLocationPermissionStatus("requesting");
    setLocationLoading(true);

    if (!navigator.geolocation) {
      setLocationPermissionStatus("denied");
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setLocationPermissionStatus("granted");
        const { latitude, longitude } = position.coords;

        try {
          // Reverse geocoding to get detailed address
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();

          const detailedLocation = {
            lat: latitude,
            lng: longitude,
            address:
              data.locality ||
              data.city ||
              `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            fullAddress: `${data.locality ? data.locality + ", " : ""}${
              data.city || ""
            }, ${data.principalSubdivision || ""}`.replace(/^,\s*|,\s*$/g, ""),
            street: data.street || "",
            area: data.locality || "",
          };

          setLocation(detailedLocation);
        } catch (error) {
          // Fallback if geocoding fails
          setLocation({
            lat: latitude,
            lng: longitude,
            address: `Location: ${latitude.toFixed(4)}, ${longitude.toFixed(
              4
            )}`,
            fullAddress: "Location captured successfully",
          });
        }

        setLocationLoading(false);
      },
      (error) => {
        console.error("Location error:", error);
        setLocationPermissionStatus("denied");
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000,
      }
    );
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !selectedCategory) return;

    setSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setSuccess(true);

    // Reset form after success
    setTimeout(() => {
      setSuccess(false);
      setTitle("");
      setDescription("");
      setSelectedCategory("");
      setSelectedImages([]);
      setImagePreviews([]);
      setLocation(null);
      setLocationPermissionStatus("idle");
      onBack();
    }, 2500);

    setSubmitting(false);
  };

  // Success screen
  if (success) {
    return (
      <section className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-accent mb-2">
            Issue Reported Successfully!
          </h1>
          <p className="text-text-secondary mb-4">
            Your report has been submitted to the relevant department
          </p>
          <div className="text-sm text-text-secondary">
            Redirecting to home...
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-surface">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-borders">
          <button
            onClick={onBack}
            className="p-2 hover:bg-subtle rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-text-secondary" />
          </button>
          <h1 className="text-lg font-semibold text-accent">Report Issue</h1>
          <div className="w-9"></div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-10">
          {/* Modern Issue Title - No Border Style */}
          <div>
            <label className="block text-caption mb-6">What's the issue?</label>
            <div className="relative">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter issue title"
                className="w-full text-2xl font-bold text-accent bg-transparent border-none outline-none placeholder-text-secondary/50 pb-3 border-b-2 border-borders focus:border-accent transition-colors"
                required
              />
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-caption mb-4">Select Category</label>
            <div className="grid grid-cols-1 gap-3">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`p-4 border rounded-xl transition-all duration-200 text-left ${
                      selectedCategory === category.id
                        ? "border-accent bg-subtle shadow-sm"
                        : "border-borders hover:border-accent hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${category.color}`}
                      >
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-accent">
                          {category.title}
                        </div>
                        <div className="text-xs text-text-secondary mt-1">
                          {category.department}
                        </div>
                        <div className="text-xs text-text-secondary mt-1">
                          {category.examples}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-caption mb-4">
              Detailed Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-32 p-4 input-field rounded-xl resize-none"
              placeholder="Provide more details about the issue..."
            />
          </div>

          {/* Multiple Photo Upload */}
          <div>
            <label className="block text-caption mb-4">
              Add Photos ({selectedImages.length}/5)
            </label>

            {/* Photo Grid */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {imagePreviews.map((preview, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-xl overflow-hidden border border-borders"
                >
                  <img
                    src={preview}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 w-6 h-6 bg-black/70 text-white rounded-full flex items-center justify-center hover:bg-black/90 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {/* Add Photo Button */}
              {selectedImages.length < 5 && (
                <label className="aspect-square border-2 border-dashed border-borders rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-accent hover:bg-subtle/30 transition-colors">
                  <Plus className="w-6 h-6 text-text-secondary mb-1" />
                  <span className="text-xs text-text-secondary">Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Photo Upload Instructions */}
            <p className="text-xs text-text-secondary">
              Upload up to 5 photos to help authorities understand the issue
              better
            </p>
          </div>

          {/* Enhanced Location */}
          <div>
            <label className="block text-caption mb-4">Location</label>

            {/* Location Permission States */}
            {locationPermissionStatus === "requesting" && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="text-center">
                  <div className="text-sm font-medium text-blue-900 mb-2">
                    Requesting Location Permission
                  </div>
                  <div className="text-xs text-blue-700">
                    Please allow location access in your browser
                  </div>
                </div>
              </div>
            )}

            {locationPermissionStatus === "denied" && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="text-center">
                  <div className="text-sm font-medium text-red-900 mb-2">
                    Location Permission Denied
                  </div>
                  <div className="text-xs text-red-700 mb-3">
                    Please enable location in your browser settings and try
                    again
                  </div>
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {!location &&
              locationPermissionStatus !== "requesting" &&
              locationPermissionStatus !== "denied" && (
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                  className="w-full p-4 border border-borders rounded-xl hover:border-accent transition-colors text-left"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-accent">
                        {locationLoading
                          ? "Getting location..."
                          : "Use Current Location"}
                      </div>
                      <div className="text-sm text-text-secondary">
                        {locationLoading
                          ? "Please wait..."
                          : "Tap to capture your exact location"}
                      </div>
                    </div>
                  </div>
                </button>
              )}

            {location && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mt-1">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <div className="font-medium text-emerald-900">
                        Location Captured
                      </div>
                      {location.street && (
                        <div className="text-sm text-emerald-700">
                          {location.street}
                        </div>
                      )}
                      <div className="text-sm text-emerald-700">
                        {location.fullAddress}
                      </div>
                      <div className="text-xs text-emerald-600 mt-1">
                        {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setLocation(null);
                      setLocationPermissionStatus("idle");
                    }}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Change
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || !title || !selectedCategory}
            className="w-full btn-primary py-4 rounded-xl text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Submitting Report...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Submit Report</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Custom animations */}
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

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </section>
  );
};

export default MobileReportSection;

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
import ProtectedRoute from './auth/ProtectedRoute';
import { db } from '../../lib/firebase'; // Adjust path as needed
import { useAuth } from '../contexts/AuthContext';
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";

interface MobileReportSectionProps {
  onBack: () => void;
  onAuthRequired: () => void;
}

const MobileReportSection: React.FC<MobileReportSectionProps> = ({
  onBack,
  onAuthRequired,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [location, setLocation] = useState<any>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<
    "idle" | "requesting" | "granted" | "denied"
  >("idle");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();
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
  // Replace the getCurrentLocation function with this enhanced version:

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
          // Using multiple geocoding APIs for better address details

          // Primary: OpenStreetMap Nominatim (Free, detailed)
          const nominatimResponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=18`
          );
          const nominatimData = await nominatimResponse.json();

          // Backup: BigDataCloud (Free, good fallback)
          const bigDataResponse = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const bigDataData = await bigDataResponse.json();

          // Extract detailed address components
          const address = nominatimData.address || {};

          const detailedLocation = {
            lat: latitude,
            lng: longitude,
            // Street level details
            houseNumber: address.house_number || "",
            street: address.road || address.street || bigDataData.street || "",

            // Area details
            neighbourhood:
              address.neighbourhood ||
              address.suburb ||
              bigDataData.locality ||
              "",
            area: address.suburb || address.village || address.town || "",

            // City details
            city:
              address.city ||
              address.town ||
              address.village ||
              bigDataData.city ||
              "",
            district:
              address.state_district || bigDataData.principalSubdivision || "",
            state: address.state || bigDataData.principalSubdivision || "",

            // Postal code
            postcode: address.postcode || bigDataData.postcode || "",

            // Country
            country: address.country || bigDataData.countryName || "India",

            // Formatted addresses
            shortAddress: "",
            fullAddress: "",
            displayAddress: "",
          };

          // Create formatted addresses
          const addressParts = [];

          // Build street address
          if (detailedLocation.houseNumber) {
            addressParts.push(detailedLocation.houseNumber);
          }
          if (detailedLocation.street) {
            addressParts.push(detailedLocation.street);
          }

          // Add area/neighbourhood
          if (
            detailedLocation.neighbourhood &&
            detailedLocation.neighbourhood !== detailedLocation.area
          ) {
            addressParts.push(detailedLocation.neighbourhood);
          } else if (detailedLocation.area) {
            addressParts.push(detailedLocation.area);
          }

          // Add city
          if (detailedLocation.city) {
            addressParts.push(detailedLocation.city);
          }

          // Add state if not already included
          if (
            detailedLocation.state &&
            detailedLocation.state !== detailedLocation.city
          ) {
            addressParts.push(detailedLocation.state);
          }

          // Add postcode
          if (detailedLocation.postcode) {
            addressParts.push(detailedLocation.postcode);
          }

          // Format different address versions
          detailedLocation.shortAddress = [
            detailedLocation.street,
            detailedLocation.area || detailedLocation.city,
          ]
            .filter(Boolean)
            .join(", ");

          detailedLocation.fullAddress = addressParts.join(", ");

          detailedLocation.displayAddress =
            detailedLocation.fullAddress ||
            detailedLocation.shortAddress ||
            `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

          console.log("Detailed location:", detailedLocation); // For debugging
          setLocation(detailedLocation);
        } catch (error) {
          console.error("Geocoding error:", error);

          // Enhanced fallback with basic location info
          const fallbackLocation = {
            lat: latitude,
            lng: longitude,
            street: "",
            area: "",
            city: "Current Location",
            state: "",
            postcode: "",
            shortAddress: `Location: ${latitude.toFixed(
              4
            )}, ${longitude.toFixed(4)}`,
            fullAddress: `Coordinates: ${latitude.toFixed(
              6
            )}, ${longitude.toFixed(6)}`,
            displayAddress: `Current Location (${latitude.toFixed(
              4
            )}, ${longitude.toFixed(4)})`,
          };

          setLocation(fallbackLocation);
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
        timeout: 20000, // Increased timeout for better accuracy
        maximumAge: 60000, // Cache location for 1 minute
      }
    );
  };

  // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!title || !selectedCategory || !user) return;

      setSubmitting(true);

      try {
        // Upload images to Firebase Storage (optional - you can skip this for demo)
        const imageUrls: string[] = [];
        // For demo, we'll just store image file names
        const imageFileNames = selectedImages.map((file) => file.name);

        // Create report data object
        const reportData = {
          // User Association
          userId: user.uid,
          userEmail: user.email,
          userDisplayName: user.displayName || "Anonymous",

          // Report Details
          title: title.trim(),
          description: description.trim(),
          category: selectedCategory,

          // Location Data
          location: location
            ? {
                lat: location.lat,
                lng: location.lng,
                address: location.displayAddress || location.fullAddress,
                fullLocation: location,
              }
            : null,

          // Media
          imageFileNames: imageFileNames,
          imageUrls: imageUrls, // Will be populated after upload

          // Status & Timestamps
          status: "pending",
          priority: "medium",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),

          // Department Assignment
          assignedDepartment:
            categories.find((cat) => cat.id === selectedCategory)?.department ||
            "General",

          // Analytics
          reportId: null, // Will be set after document creation
        };

        console.log("Saving report:", reportData);

        // Save to Firestore
        const docRef = await addDoc(collection(db, "reports"), reportData);

        console.log("Report saved with ID:", docRef.id);

        // Update user stats (optional)
        await updateUserStats(user.uid);

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
      } catch (error) {
        console.error("Error saving report:", error);
        alert("Failed to submit report. Please try again.");
      } finally {
        setSubmitting(false);
      }
    };

  // Firebase submission


  // **Function to update user statistics**
  const updateUserStats = async (userId: string) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        "stats.reportsSubmitted": increment(1),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating user stats:", error);
    }
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
    <ProtectedRoute
      onAuthRequired={onAuthRequired}
      message="Sign in to report issues"
    >
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
              <label className="block text-caption mb-6">
                What's the issue?
              </label>
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
              {imagePreviews.length > 0 && (
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
                </div>
              )}

              {/* Add Photo Button */}
              {selectedImages.length < 5 && (
                <button
                  type="button"
                  onClick={() => setShowPhotoOptions(true)}
                  className="w-full p-4 border-2 border-dashed border-borders rounded-xl hover:border-accent hover:bg-subtle/30 transition-colors flex items-center justify-center space-x-3"
                >
                  <Camera className="w-6 h-6 text-text-secondary" />
                  <div>
                    <div className="font-medium text-accent">Add Photos</div>
                    <div className="text-sm text-text-secondary">
                      Camera or Gallery
                    </div>
                  </div>
                </button>
              )}

              {/* Mobile Photo Options Modal */}
              {showPhotoOptions && (
                <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
                  <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 space-y-3">
                    <div className="text-center mb-4">
                      <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
                      <h3 className="font-semibold text-accent">Add Photo</h3>
                      <p className="text-sm text-text-secondary">
                        Choose how to add your photo
                      </p>
                    </div>

                    {/* Camera Option */}
                    <label className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 cursor-pointer">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Camera className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-accent">
                          Take Photo
                        </div>
                        <div className="text-sm text-text-secondary">
                          Use camera to capture
                        </div>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => {
                          handleImageSelect(e);
                          setShowPhotoOptions(false);
                        }}
                        className="hidden"
                      />
                    </label>

                    {/* Gallery Option */}
                    <label className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 cursor-pointer">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <Upload className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-accent">
                          Choose from Gallery
                        </div>
                        <div className="text-sm text-text-secondary">
                          Select existing photos
                        </div>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          handleImageSelect(e);
                          setShowPhotoOptions(false);
                        }}
                        className="hidden"
                      />
                    </label>

                    {/* Cancel */}
                    <button
                      type="button"
                      onClick={() => setShowPhotoOptions(false)}
                      className="w-full p-4 text-center text-text-secondary hover:text-accent transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Photo Instructions */}
              <p className="text-xs text-text-secondary mt-3">
                📸 Upload up to 5 photos • Clear images help authorities resolve
                issues faster
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
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mt-1">
                        <MapPin className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-emerald-900 mb-2">
                          📍 Location Captured
                        </div>

                        {/* Street Address */}
                        {(location.houseNumber || location.street) && (
                          <div className="mb-1">
                            <span className="text-sm font-medium text-emerald-800">
                              {[location.houseNumber, location.street]
                                .filter(Boolean)
                                .join(" ")}
                            </span>
                          </div>
                        )}

                        {/* Area/Neighbourhood */}
                        {location.neighbourhood && (
                          <div className="text-sm text-emerald-700 mb-1">
                            🏠 {location.neighbourhood}
                          </div>
                        )}

                        {/* City, State, Postcode */}
                        <div className="text-sm text-emerald-700 mb-1">
                          🏙️{" "}
                          {[location.city, location.state, location.postcode]
                            .filter(Boolean)
                            .join(", ")}
                        </div>

                        {/* Full Address */}
                        {location.fullAddress && (
                          <div className="text-xs text-emerald-600 bg-emerald-100 rounded-lg px-2 py-1 mt-2">
                            <strong>Complete Address:</strong>
                            <br />
                            {location.fullAddress}
                          </div>
                        )}

                        {/* Coordinates */}
                        <div className="text-xs text-emerald-500 mt-2">
                          📐 {location.lat.toFixed(6)},{" "}
                          {location.lng.toFixed(6)}
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
    </ProtectedRoute>
  );
};

export default MobileReportSection;

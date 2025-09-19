// components/MobileReportSection.tsx
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

import { uploadImageToCloudinary, createSignatureGenerator } from "../lib/cloudinary";

const CLOUDINARY_CLOUD_NAME = "civicconnect";
const CLOUDINARY_API_KEY = "415284245642869";
const CLOUDINARY_API_SECRET = "SQJRqJ9KaexFBGQcULP3o7HFwU8"; // ⚠ unsafe in frontend

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

  // ✅ UPDATED CATEGORIES - Now matches department authentication exactly
  const categories = [
    {
      id: "roads",
      title: "Roads & Transportation",
      department: "Public Works Department", // ✅ Matches authentication context
      icon: Construction,
      color: "bg-blue-100 text-blue-600",
      examples: "Potholes, damaged roads, traffic signals",
    },
    {
      id: "water",
      title: "Water & Utilities",
      department: "Water & Utilities Department", // ✅ Matches authentication context
      icon: Droplets,
      color: "bg-cyan-100 text-cyan-600",
      examples: "Water leaks, drainage issues, sewer problems",
    },
    {
      id: "lighting",
      title: "Street Lighting",
      department: "Street Lighting Department", // ✅ Matches authentication context
      icon: Lightbulb,
      color: "bg-yellow-100 text-yellow-600",
      examples: "Broken street lights, dark areas",
    },
    {
      id: "waste",
      title: "Waste Management",
      department: "Waste Management Department", // ✅ Matches authentication context
      icon: Trash2,
      color: "bg-green-100 text-green-600",
      examples: "Garbage collection, overflowing bins",
    },
    {
      id: "parks",
      title: "Parks & Recreation",
      department: "Parks & Recreation Department",
      icon: Trees,
      color: "bg-emerald-100 text-emerald-600",
      examples: "Damaged benches, playground equipment",
    },
    {
      id: "safety",
      title: "Public Safety",
      department: "Public Safety Department",
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

  // Enhanced location function
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
          const nominatimResponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=18`
          );
          const nominatimData = await nominatimResponse.json();

          const bigDataResponse = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const bigDataData = await bigDataResponse.json();

          const address = nominatimData.address || {};

          const detailedLocation = {
            lat: latitude,
            lng: longitude,
            houseNumber: address.house_number || "",
            street: address.road || address.street || bigDataData.street || "",
            neighbourhood: address.neighbourhood || address.suburb || bigDataData.locality || "",
            area: address.suburb || address.village || address.town || "",
            city: address.city || address.town || address.village || bigDataData.city || "",
            district: address.state_district || bigDataData.principalSubdivision || "",
            state: address.state || bigDataData.principalSubdivision || "",
            postcode: address.postcode || bigDataData.postcode || "",
            country: address.country || bigDataData.countryName || "India",
            shortAddress: "",
            fullAddress: "",
            displayAddress: "",
          };

          // Create formatted addresses
          const addressParts = [];

          if (detailedLocation.houseNumber) addressParts.push(detailedLocation.houseNumber);
          if (detailedLocation.street) addressParts.push(detailedLocation.street);
          if (detailedLocation.neighbourhood && detailedLocation.neighbourhood !== detailedLocation.area) {
            addressParts.push(detailedLocation.neighbourhood);
          } else if (detailedLocation.area) {
            addressParts.push(detailedLocation.area);
          }
          if (detailedLocation.city) addressParts.push(detailedLocation.city);
          if (detailedLocation.state && detailedLocation.state !== detailedLocation.city) {
            addressParts.push(detailedLocation.state);
          }
          if (detailedLocation.postcode) addressParts.push(detailedLocation.postcode);

          detailedLocation.shortAddress = [
            detailedLocation.street,
            detailedLocation.area || detailedLocation.city,
          ].filter(Boolean).join(", ");

          detailedLocation.fullAddress = addressParts.join(", ");
          detailedLocation.displayAddress = detailedLocation.fullAddress || detailedLocation.shortAddress || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

          setLocation(detailedLocation);
        } catch (error) {
          console.error("Geocoding error:", error);
          const fallbackLocation = {
            lat: latitude,
            lng: longitude,
            displayAddress: `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
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
        timeout: 20000,
        maximumAge: 60000,
      }
    );
  };

  // ✅ FIXED FORM SUBMISSION - Firebase timestamp error resolved
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !selectedCategory || !user) return;

    setSubmitting(true);

    try {
      // Upload images to Cloudinary
      const imageFileNames = selectedImages.map((file) => file.name);
      let imageUrls: string[] = [];
      let imagePublicIds: string[] = [];

      if (selectedImages.length > 0) {
        const generate = createSignatureGenerator(CLOUDINARY_API_SECRET);
        const folder = "civicconnect/reports";

        const results = await Promise.all(
          selectedImages.map((file) =>
            uploadImageToCloudinary(file, {
              cloudName: CLOUDINARY_CLOUD_NAME,
              apiKey: CLOUDINARY_API_KEY,
              folder,
              generateSignature: (params) => generate(params),
            })
          )
        );

        imageUrls = results.map((r) => r.url);
        imagePublicIds = results.map((r) => r.publicId);
      }

      // Get assigned department from selected category
      const selectedCategoryData = categories.find((cat) => cat.id === selectedCategory);
      const assignedDepartment = selectedCategoryData?.department || "General";

      console.log('🎯 Auto-assigning to department:', assignedDepartment);

      // ✅ FIXED REPORT DATA - No serverTimestamp() in arrays
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
        imageUrls: imageUrls,
        imagePublicIds: imagePublicIds,

        // Status & Timestamps
        status: "pending",
        priority: "medium",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),

        // ✅ ASSIGNMENT TRACKING - No arrays with serverTimestamp()
        assignedDepartment: assignedDepartment,
        assignedAt: serverTimestamp(),
        assignedBy: "system",

        // Department Communication (empty arrays are fine)
        departmentComments: [],
        beforeAfterImages: { before: [], after: [] },

        // 🔔 REAL-TIME NOTIFICATION FLAGS
        isNewAssignment: true,
        departmentNotified: false,
        notificationSent: false,

        // Analytics
        reportId: null, // Will be set after document creation
      };

      console.log('💾 Saving report data to Firebase...');

      // Save to Firestore
      const docRef = await addDoc(collection(db, "reports"), reportData);

      // ✅ ADD ASSIGNMENT HISTORY AFTER DOCUMENT CREATION (FIXED)
      await updateDoc(docRef, {
        reportId: docRef.id,
        assignmentHistory: [
          {
            department: assignedDepartment,
            assignedBy: "system",
            assignedAt: new Date(), // ✅ Use regular Date() instead of serverTimestamp()
            reason: "Auto-assigned based on category",
          },
        ],
      });

      console.log('✅ Report saved with ID:', docRef.id);
      console.log('📨 Auto-assigned to department:', assignedDepartment);
      console.log('🔔 Real-time notification will be sent to department dashboard');

      // Update user stats
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
      console.error("❌ Error saving report:", error);
      console.error("❌ Error details:", {
        code: error.code,
        message: error.message,
      });
      alert("Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Function to update user statistics
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
          <p className="text-text-secondary mb-2">
            Your report has been submitted to the relevant department
          </p>
          {selectedCategory && (
            <div className="text-sm text-blue-600 bg-blue-50 rounded-lg px-3 py-2 mb-4 inline-block">
              📨 Assigned to: {categories.find(c => c.id === selectedCategory)?.department}
            </div>
          )}
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
            {/* Issue Title */}
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

            {/* Category Selection with Department Preview */}
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
                          <div className="text-xs text-green-600 mt-1 font-medium">
                            📨 {category.department}
                          </div>
                          <div className="text-xs text-text-secondary mt-1">
                            {category.examples}
                          </div>
                          {selectedCategory === category.id && (
                            <div className="text-xs text-blue-600 mt-2 bg-blue-50 rounded px-2 py-1">
                              ✅ Will be assigned to this department automatically
                            </div>
                          )}
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
                        <div className="font-medium text-accent">Take Photo</div>
                        <div className="text-sm text-text-secondary">Use camera to capture</div>
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
                        <div className="font-medium text-accent">Choose from Gallery</div>
                        <div className="text-sm text-text-secondary">Select existing photos</div>
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
                📸 Upload up to 5 photos • Clear images help authorities resolve issues faster
              </p>
            </div>

            {/* Enhanced Location */}
            <div>
              <label className="block text-caption mb-4">Location</label>

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
                      Please enable location in your browser settings and try again
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
                          {locationLoading ? "Getting location..." : "Use Current Location"}
                        </div>
                        <div className="text-sm text-text-secondary">
                          {locationLoading ? "Please wait..." : "Tap to capture your exact location"}
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
                        <div className="font-semibold text-emerald-900 mb-2">📍 Location Captured</div>
                        <div className="text-sm text-emerald-700">
                          {location.displayAddress || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
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

            {/* Enhanced Submit Button */}
            <button
              type="submit"
              disabled={submitting || !title || !selectedCategory}
              className="w-full btn-primary py-4 rounded-xl text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Submitting to {selectedCategory ? categories.find(c => c.id === selectedCategory)?.department : 'Department'}...</span>
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
        <style>{`
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

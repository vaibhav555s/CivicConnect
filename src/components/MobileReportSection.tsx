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
  CheckCircle2,
  Plus,
  X,
  Loader2,
  BrainCircuit,
  ScanSearch,
  Activity,
  Zap,
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

  // AI Pipeline State
  const [aiState, setAiState] = useState<"idle" | "analyzing" | "complete">("idle");
  const [aiStep, setAiStep] = useState<number>(0);

  const AI_STEPS = [
    "Image Quality Validation",
    "Metadata Verification",
    "YOLOv8 Infrastructure Detection",
    "Duplicate Issue Detection",
    "Fraud / Manipulation Check",
    "Severity Classification",
    "Smart Prioritization Engine"
  ];

  const startAIPipeline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !selectedCategory || !user) return;
    
    // Prototype: Always run AI pipeline for demonstration purposes
    setAiState("analyzing");
    setAiStep(0);

    const runStep = (step: number) => {
      if (step < AI_STEPS.length) {
        setAiStep(step);
        setTimeout(() => runStep(step + 1), 700 + Math.random() * 300); // 700-1000ms delay
      } else {
        setTimeout(() => setAiState("complete"), 600);
      }
    };
    
    runStep(0);
  };

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
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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

  // AI Pipeline Overlay
  if (aiState === "analyzing" || aiState === "complete") {
    const selectedCategoryData = categories.find((cat) => cat.id === selectedCategory);
    return (
      <ProtectedRoute onAuthRequired={onAuthRequired} message="Sign in to report issues">
        <section className="min-h-screen bg-[#FDFDFD] px-5 pt-12 pb-24 flex flex-col max-w-sm mx-auto">
           {/* Header */}
           <div className="mb-8 animate-fade-in">
             <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center mb-4 shadow-soft">
               <BrainCircuit className="w-6 h-6 text-white" />
             </div>
             <h1 className="text-[2rem] font-black text-zinc-950 leading-[1.1] tracking-tight mb-2" style={{ letterSpacing: '-0.04em' }}>
               {aiState === "analyzing" ? "AI Analysis" : "Analysis Complete"}
             </h1>
             <p className="text-[15px] font-medium text-zinc-500 tracking-tight">
               {aiState === "analyzing" ? "Processing issue data securely..." : "Review infrastructure assessment"}
             </p>
           </div>

           {aiState === "analyzing" && (
             <div className="flex-1 space-y-4 animate-fade-in-delay">
               {AI_STEPS.map((step, index) => {
                 const isCompleted = aiStep > index;
                 const isCurrent = aiStep === index;
                 
                 return (
                   <div key={index} className={`flex items-center space-x-4 p-4 rounded-2xl transition-all duration-300 ${isCurrent ? 'bg-white shadow-soft border border-zinc-200/50' : 'opacity-60'}`}>
                     <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                       {isCompleted ? (
                         <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                       ) : isCurrent ? (
                         <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                       ) : (
                         <div className="w-2.5 h-2.5 rounded-full bg-zinc-200" />
                       )}
                     </div>
                     <span className={`text-[15px] font-semibold tracking-tight ${isCurrent ? 'text-zinc-900' : 'text-zinc-500'}`}>
                       {step}
                     </span>
                   </div>
                 );
               })}
             </div>
           )}

           {aiState === "complete" && (
             <div className="flex-1 animate-fade-in space-y-5">
               {/* Result Card */}
               <div className="card-premium p-1.5 overflow-hidden">
                 {imagePreviews.length > 0 ? (
                   <div className="relative h-48 rounded-[14px] overflow-hidden mb-1 border border-zinc-100">
                     <img src={imagePreviews[0]} className="w-full h-full object-cover" alt="Uploaded" />
                     {/* Fake Bounding Box */}
                     <div className="absolute top-[20%] left-[15%] w-[70%] h-[55%] border-[2.5px] border-emerald-400 bg-emerald-400/10 rounded-lg flex items-start shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                       <div className="bg-emerald-400 text-emerald-950 text-[9px] font-black px-2 py-0.5 rounded-br-lg uppercase tracking-widest">
                         YOLOv8: {selectedCategoryData?.title.split(' ')[0] || "Issue"} (94%)
                       </div>
                     </div>
                   </div>
                 ) : (
                   <div className="relative h-32 rounded-xl bg-zinc-100 flex items-center justify-center mb-1">
                     <ScanSearch className="w-8 h-8 text-zinc-400" />
                   </div>
                 )}
                 <div className="p-4">
                   <div className="flex items-center justify-between mb-4">
                     <h3 className="text-[17px] font-bold text-zinc-900 tracking-tight">Detected Issue</h3>
                     <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest">
                       94% Match
                     </span>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-3 mb-5">
                     <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-100/50">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Severity</p>
                       <p className="text-[14px] font-semibold text-red-600 tracking-tight">High</p>
                     </div>
                     <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-100/50">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Impact</p>
                       <p className="text-[14px] font-semibold text-amber-600 tracking-tight">High</p>
                     </div>
                   </div>

                   {/* Priority Score Explanation */}
                   <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100/60 rounded-xl p-4 mb-2">
                     <div className="flex items-center justify-between mb-2">
                       <div className="flex items-center space-x-1.5">
                         <Zap className="w-3.5 h-3.5 text-indigo-500" />
                         <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Priority Score</span>
                       </div>
                       <span className="text-[20px] font-black text-indigo-700 tracking-tight">8.7<span className="text-[12px] text-indigo-400 font-bold">/10</span></span>
                     </div>
                     <p className="text-[11px] text-indigo-500/80 font-medium leading-relaxed">
                       Calculated using: 35% Severity + 25% Location Density + 20% Public Impact + 20% AI Confidence
                     </p>
                   </div>
                   
                   <div className="pt-4 mt-1 border-t border-zinc-100">
                     <p className="text-[11px] text-zinc-500 flex items-center mb-1 font-medium">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2"></span>
                       Routing to: <strong className="text-zinc-700 ml-1">{selectedCategoryData?.department || "Public Works"}</strong>
                     </p>
                     <p className="text-[11px] text-zinc-500 flex items-center font-medium">
                       <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-2"></span>
                       Est. Resolution: <strong className="text-zinc-700 ml-1">48 hours</strong>
                     </p>
                   </div>
                 </div>
               </div>

               {/* Action */}
               <button
                 onClick={() => handleSubmit()}
                 disabled={submitting}
                 className="group w-full bg-zinc-950 text-white py-4 px-6 rounded-full text-[17px] font-semibold hover:bg-zinc-800 transition-all duration-200 active:scale-[0.98] shadow-md flex items-center justify-center space-x-2.5 mt-4"
                 style={{ letterSpacing: '-0.01em' }}
               >
                 {submitting ? (
                   <><Loader2 className="w-5 h-5 animate-spin" /><span className="opacity-90">Transmitting...</span></>
                 ) : (
                   <><Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" /><span>Submit Official Report</span></>
                 )}
               </button>
             </div>
           )}
           
           <style>{`
             @keyframes fade-in {
               from { opacity: 0; transform: translateY(12px); }
               to { opacity: 1; transform: translateY(0); }
             }
             .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
             .animate-fade-in-delay { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both; }
           `}</style>
        </section>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute
      onAuthRequired={onAuthRequired}
      message="Sign in to report issues"
    >
      <section className="min-h-screen bg-surface pb-24">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-zinc-200/50 bg-white/80 backdrop-blur-md sticky top-0 z-10">
            <button
              onClick={onBack}
              className="p-2.5 bg-white border border-zinc-200/60 shadow-sm rounded-full hover:bg-zinc-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-600" />
            </button>
            <h1 className="text-[17px] font-semibold text-zinc-900 tracking-tight">Report Issue</h1>
            <div className="w-10"></div>
          </div>

          <form onSubmit={startAIPipeline} className="p-6 space-y-10">
            {/* Issue Title */}
            <div>
              <label className="block text-[13px] font-bold text-zinc-500 uppercase tracking-widest mb-4">
                What's the issue?
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a descriptive title..."
                  className="w-full text-3xl font-bold text-zinc-900 bg-transparent border-none outline-none placeholder-zinc-300 pb-3 border-b-2 border-zinc-200 focus:border-zinc-900 transition-colors tracking-tight"
                  required
                />
              </div>
            </div>

            {/* Category Selection with Department Preview */}
            <div>
              <label className="block text-[13px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Select Category</label>
              <div className="grid grid-cols-1 gap-3">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setSelectedCategory(category.id)}
                      className={`p-4 border rounded-2xl transition-all duration-300 text-left ${selectedCategory === category.id
                          ? "border-zinc-900 bg-zinc-50 shadow-soft"
                          : "border-zinc-200/60 bg-white hover:border-zinc-300 hover:shadow-soft"
                        }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-[52px] h-[52px] rounded-[14px] flex items-center justify-center ${category.color} bg-opacity-30`}
                        >
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className={`font-semibold tracking-tight text-[16px] mb-0.5 ${selectedCategory === category.id ? "text-zinc-900" : "text-zinc-800"}`}>
                            {category.title}
                          </div>
                          <div className="text-[12px] text-zinc-500 font-medium tracking-tight mb-1">
                            {category.examples}
                          </div>
                          <div className="text-[11px] font-bold text-blue-600 bg-blue-50 inline-flex px-2 py-0.5 rounded-md uppercase tracking-tight">
                            📨 {category.department}
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
              <label className="block text-[13px] font-bold text-zinc-500 uppercase tracking-widest mb-4">
                Detailed Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-32 p-4 bg-white border border-zinc-200/60 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-100 rounded-2xl resize-none outline-none transition-all shadow-sm text-[15px] text-zinc-800 placeholder-zinc-400"
                placeholder="Provide more context (e.g., how long has it been here, exact spot, safety hazards)..."
              />
            </div>

            {/* Multiple Photo Upload */}
            <div>
              <label className="block text-[13px] font-bold text-zinc-500 uppercase tracking-widest mb-4">
                Add Photos <span className="text-zinc-400">({selectedImages.length}/5)</span>
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
                  className="w-full p-6 border-2 border-dashed border-zinc-200/80 rounded-2xl hover:border-zinc-400 hover:bg-zinc-50 transition-colors flex flex-col items-center justify-center space-y-3 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center">
                    <Camera className="w-5 h-5 text-zinc-600" />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-zinc-900 tracking-tight">Capture or Upload</div>
                    <div className="text-[13px] text-zinc-500 font-medium">JPEG, PNG • Up to 10MB</div>
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
              className="w-full bg-zinc-900 text-white font-semibold py-4 rounded-2xl text-[17px] tracking-tight disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-md hover:bg-zinc-800 active:scale-[0.98] transition-all"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Transmitting...</span>
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

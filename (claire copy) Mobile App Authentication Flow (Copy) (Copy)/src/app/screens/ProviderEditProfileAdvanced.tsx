import { useState, startTransition } from "react";
import { useNavigate } from "react-router";
import { StatusBar } from "../components/StatusBar";
import {
  X,
  Camera,
  Plus,
  Edit2,
  Trash2,
  Home,
  Calendar,
  MessageCircle,
  User,
  MoreHorizontal,
  Globe,
  Facebook,
  Instagram,
  ChevronRight,
} from "lucide-react";

interface License {
  id: number;
  type: string;
  number: string;
  expiry: string;
}

interface Certification {
  id: number;
  name: string;
  year: string;
}

export default function ProviderEditProfileAdvanced() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [charCount, setCharCount] = useState(0);

  // Form state
  const [businessName, setBusinessName] = useState("Juan's Home Services");
  const [bio, setBio] = useState(
    "Professional home service provider with extensive experience in repairs, maintenance, and improvements. Committed to quality workmanship and customer satisfaction."
  );
  const [yearsOfExperience, setYearsOfExperience] = useState("5");

  // Service categories
  const [selectedCategories, setSelectedCategories] = useState([
    "Plumbing",
    "Electrical",
    "Carpentry",
  ]);

  const [selectedAreas, setSelectedAreas] = useState([
    "Makati City",
    "Quezon City",
    "Pasig City",
  ]);

  const [selectedLanguages, setSelectedLanguages] = useState([
    "English",
    "Tagalog",
  ]);

  const [licenses, setLicenses] = useState<License[]>([
    {
      id: 1,
      type: "Electrical License",
      number: "EL-2021-12345",
      expiry: "2026-12-31",
    },
    {
      id: 2,
      type: "Plumbing License",
      number: "PL-2020-67890",
      expiry: "2025-08-15",
    },
  ]);

  const [certifications, setCertifications] = useState<Certification[]>([
    { id: 1, name: "HVAC Certification", year: "2022" },
    { id: 2, name: "Safety Training Certificate", year: "2023" },
  ]);

  // Social media
  const [facebookUrl, setFacebookUrl] = useState("facebook.com/juanservices");
  const [instagramUrl, setInstagramUrl] = useState("@juanservices");
  const [websiteUrl, setWebsiteUrl] = useState("www.juanservices.com");

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 500) {
      setBio(value);
      setCharCount(value.length);
    }
  };

  const handleSave = () => {
    alert("Profile updated successfully!");
    startTransition(() => {
      navigate("/provider/profile/view");
    });
  };

  const handleCancel = () => {
    startTransition(() => {
      navigate(-1);
    });
  };

  const removeLicense = (id: number) => {
    setLicenses(licenses.filter((l) => l.id !== id));
  };

  const removeCertification = (id: number) => {
    setCertifications(certifications.filter((c) => c.id !== id));
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);

    startTransition(() => {
      if (tab === "home") {
        navigate("/provider/home");
      } else if (tab === "bookings") {
        navigate("/provider/my-bookings");
      } else if (tab === "messages") {
        navigate("/provider/messages/all");
      } else if (tab === "more") {
        navigate("/provider/settings");
      }
    });
  };

  return (
    <div className="bg-[#F9FAFB] w-full h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-white flex-shrink-0">
        <StatusBar />
      </div>

      {/* Header */}
      <div className="bg-white px-[24px] py-[12px] border-b border-[#E5E7EB] flex items-center justify-between flex-shrink-0">
        <button
          onClick={handleCancel}
          className="text-[#6B7280] text-[16px] font-medium transition-all active:opacity-70"
        >
          Cancel
        </button>
        <h1 className="font-semibold text-[18px] text-[#111827]">
          Edit Profile
        </h1>
        <button
          onClick={handleSave}
          className="text-[#2E7D32] text-[16px] font-semibold transition-all active:opacity-70"
        >
          Save
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-[100px]">
        {/* Cover Photo & Profile Photo */}
        <div className="relative bg-white mb-[8px]">
          {/* Cover Photo */}
          <div className="relative h-[140px] bg-gradient-to-br from-[#2E7D32] to-[#1B5E20]">
            <button className="absolute top-[12px] right-[12px] bg-black/50 backdrop-blur-sm px-[12px] py-[8px] rounded-[8px] flex items-center gap-[6px] transition-all active:scale-95">
              <Camera className="w-[16px] h-[16px] text-white" />
              <span className="text-white text-[13px] font-medium">
                Change Cover
              </span>
            </button>
          </div>

          {/* Profile Photo - Overlapping */}
          <div className="absolute left-[24px] top-[80px]">
            <div className="relative">
              <div className="w-[100px] h-[100px] rounded-full bg-[#2E7D32] flex items-center justify-center border-4 border-white shadow-lg">
                <span className="text-white text-[36px] font-bold">JD</span>
              </div>
              <button className="absolute bottom-[2px] right-[2px] w-[32px] h-[32px] rounded-full bg-[#2E7D32] flex items-center justify-center shadow-[0_2px_8px_rgba(46,125,50,0.4)] border-2 border-white transition-all active:scale-90">
                <Camera className="w-[16px] h-[16px] text-white" />
              </button>
            </div>
          </div>

          {/* Spacer for overlapping profile photo */}
          <div className="h-[60px]" />
          <div className="px-[24px] pb-[16px]">
            <button className="text-[#2E7D32] text-[14px] font-semibold transition-all active:opacity-70">
              Change Profile Photo
            </button>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white px-[24px] py-[20px] mb-[8px]">
          <h2 className="text-[#111827] text-[16px] font-semibold mb-[16px]">
            Basic Information
          </h2>

          {/* Business Name */}
          <div className="mb-[16px]">
            <label className="block text-[#374151] text-[14px] font-medium mb-[8px]">
              Business Name <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-[16px] py-[12px] bg-white border border-[#E5E7EB] rounded-[10px] text-[16px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/10 transition-all"
              placeholder="Enter your business name"
            />
          </div>

          {/* Bio/Description */}
          <div className="mb-[16px]">
            <label className="block text-[#374151] text-[14px] font-medium mb-[8px]">
              Bio/Description
            </label>
            <textarea
              value={bio}
              onChange={handleBioChange}
              rows={4}
              className="w-full px-[16px] py-[12px] bg-white border border-[#E5E7EB] rounded-[10px] text-[16px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/10 transition-all resize-none"
              placeholder="Tell customers about your services and experience..."
            />
            <div className="flex justify-end mt-[6px]">
              <span className="text-[12px] text-[#9CA3AF]">
                {bio.length}/500
              </span>
            </div>
          </div>
        </div>

        {/* Skills & Location */}
        <div className="bg-white px-[24px] py-[20px] mb-[8px]">
          <h2 className="text-[#111827] text-[16px] font-semibold mb-[16px]">
            Skills & Location
          </h2>

          {/* Service Categories */}
          <div className="mb-[16px]">
            <label className="block text-[#374151] text-[14px] font-medium mb-[8px]">
              Service Categories
            </label>
            <div className="flex flex-wrap gap-[8px] mb-[8px]">
              {selectedCategories.map((category) => (
                <div
                  key={category}
                  className="bg-[#E8F5E9] text-[#2E7D32] px-[12px] py-[6px] rounded-[8px] text-[14px] font-medium flex items-center gap-[6px]"
                >
                  {category}
                  <button
                    onClick={() =>
                      setSelectedCategories(
                        selectedCategories.filter((c) => c !== category)
                      )
                    }
                  >
                    <X className="w-[14px] h-[14px]" />
                  </button>
                </div>
              ))}
            </div>
            <button className="text-[#2E7D32] text-[14px] font-semibold flex items-center gap-[4px] transition-all active:opacity-70">
              <Plus className="w-[16px] h-[16px]" />
              Add Category
            </button>
          </div>

          {/* Service Areas */}
          <div className="mb-[16px]">
            <label className="block text-[#374151] text-[14px] font-medium mb-[8px]">
              Service Areas
            </label>
            <div className="flex flex-wrap gap-[8px] mb-[8px]">
              {selectedAreas.map((area) => (
                <div
                  key={area}
                  className="bg-[#F3F4F6] text-[#374151] px-[12px] py-[6px] rounded-[8px] text-[14px] font-medium flex items-center gap-[6px]"
                >
                  {area}
                  <button
                    onClick={() =>
                      setSelectedAreas(selectedAreas.filter((a) => a !== area))
                    }
                  >
                    <X className="w-[14px] h-[14px]" />
                  </button>
                </div>
              ))}
            </div>
            <button className="text-[#2E7D32] text-[14px] font-semibold flex items-center gap-[4px] transition-all active:opacity-70">
              <Plus className="w-[16px] h-[16px]" />
              Add Service Area
            </button>
          </div>

          {/* Languages */}
          <div>
            <label className="block text-[#374151] text-[14px] font-medium mb-[8px]">
              Languages Spoken
            </label>
            <div className="flex flex-wrap gap-[8px] mb-[8px]">
              {selectedLanguages.map((language) => (
                <div
                  key={language}
                  className="bg-[#EFF6FF] text-[#1E40AF] px-[12px] py-[6px] rounded-[8px] text-[14px] font-medium flex items-center gap-[6px]"
                >
                  {language}
                  <button
                    onClick={() =>
                      setSelectedLanguages(
                        selectedLanguages.filter((l) => l !== language)
                      )
                    }
                  >
                    <X className="w-[14px] h-[14px]" />
                  </button>
                </div>
              ))}
            </div>
            <button className="text-[#2E7D32] text-[14px] font-semibold flex items-center gap-[4px] transition-all active:opacity-70">
              <Plus className="w-[16px] h-[16px]" />
              Add Language
            </button>
          </div>
        </div>

        {/* Professional Credentials */}
        <div className="bg-white px-[24px] py-[20px] mb-[8px]">
          <h2 className="text-[#111827] text-[16px] font-semibold mb-[16px]">
            Professional Credentials
          </h2>

          {/* Years of Experience */}
          <div className="mb-[20px]">
            <label className="block text-[#374151] text-[14px] font-medium mb-[8px]">
              Years of Experience
            </label>
            <select
              value={yearsOfExperience}
              onChange={(e) => setYearsOfExperience(e.target.value)}
              className="w-full px-[16px] py-[12px] bg-white border border-[#E5E7EB] rounded-[10px] text-[16px] text-[#111827] focus:outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/10 transition-all"
            >
              <option value="">Select years</option>
              <option value="1">Less than 1 year</option>
              <option value="2">1-2 years</option>
              <option value="3">3-5 years</option>
              <option value="5">5-10 years</option>
              <option value="10">10+ years</option>
            </select>
          </div>

          {/* Professional Licenses */}
          <div className="mb-[20px]">
            <div className="flex items-center justify-between mb-[12px]">
              <label className="text-[#374151] text-[14px] font-medium">
                Professional Licenses
              </label>
              <button className="text-[#2E7D32] text-[14px] font-semibold flex items-center gap-[4px] transition-all active:opacity-70">
                <Plus className="w-[16px] h-[16px]" />
                Add
              </button>
            </div>

            <div className="space-y-[12px]">
              {licenses.map((license) => (
                <div
                  key={license.id}
                  className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-[10px] p-[14px]"
                >
                  <div className="flex items-start justify-between mb-[8px]">
                    <div className="flex-1">
                      <p className="text-[#111827] text-[14px] font-semibold mb-[4px]">
                        {license.type}
                      </p>
                      <p className="text-[#6B7280] text-[13px] mb-[2px]">
                        License #: {license.number}
                      </p>
                      <p className="text-[#9CA3AF] text-[12px]">
                        Expires: {license.expiry}
                      </p>
                    </div>
                    <div className="flex gap-[8px]">
                      <button className="w-[32px] h-[32px] rounded-[8px] bg-white border border-[#E5E7EB] flex items-center justify-center transition-all active:scale-90">
                        <Edit2 className="w-[14px] h-[14px] text-[#6B7280]" />
                      </button>
                      <button
                        onClick={() => removeLicense(license.id)}
                        className="w-[32px] h-[32px] rounded-[8px] bg-white border border-[#E5E7EB] flex items-center justify-center transition-all active:scale-90"
                      >
                        <Trash2 className="w-[14px] h-[14px] text-[#EF4444]" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div>
            <div className="flex items-center justify-between mb-[12px]">
              <label className="text-[#374151] text-[14px] font-medium">
                Certifications
              </label>
              <button className="text-[#2E7D32] text-[14px] font-semibold flex items-center gap-[4px] transition-all active:opacity-70">
                <Plus className="w-[16px] h-[16px]" />
                Add
              </button>
            </div>

            <div className="space-y-[8px]">
              {certifications.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-[10px] p-[12px] flex items-center justify-between"
                >
                  <div>
                    <p className="text-[#111827] text-[14px] font-medium mb-[2px]">
                      {cert.name}
                    </p>
                    <p className="text-[#9CA3AF] text-[12px]">Year: {cert.year}</p>
                  </div>
                  <div className="flex gap-[8px]">
                    <button className="w-[32px] h-[32px] rounded-[8px] bg-white border border-[#E5E7EB] flex items-center justify-center transition-all active:scale-90">
                      <Edit2 className="w-[14px] h-[14px] text-[#6B7280]" />
                    </button>
                    <button
                      onClick={() => removeCertification(cert.id)}
                      className="w-[32px] h-[32px] rounded-[8px] bg-white border border-[#E5E7EB] flex items-center justify-center transition-all active:scale-90"
                    >
                      <Trash2 className="w-[14px] h-[14px] text-[#EF4444]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Social Media & Links */}
        <div className="bg-white px-[24px] py-[20px] mb-[8px]">
          <h2 className="text-[#111827] text-[16px] font-semibold mb-[16px]">
            Social Media & Links
          </h2>

          {/* Facebook */}
          <div className="mb-[16px]">
            <label className="block text-[#374151] text-[14px] font-medium mb-[8px] flex items-center gap-[6px]">
              <Facebook className="w-[16px] h-[16px] text-[#1877F2]" />
              Facebook
            </label>
            <input
              type="text"
              value={facebookUrl}
              onChange={(e) => setFacebookUrl(e.target.value)}
              className="w-full px-[16px] py-[12px] bg-white border border-[#E5E7EB] rounded-[10px] text-[16px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/10 transition-all"
              placeholder="facebook.com/yourpage"
            />
          </div>

          {/* Instagram */}
          <div className="mb-[16px]">
            <label className="block text-[#374151] text-[14px] font-medium mb-[8px] flex items-center gap-[6px]">
              <Instagram className="w-[16px] h-[16px] text-[#E4405F]" />
              Instagram
            </label>
            <input
              type="text"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              className="w-full px-[16px] py-[12px] bg-white border border-[#E5E7EB] rounded-[10px] text-[16px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/10 transition-all"
              placeholder="@yourusername"
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-[#374151] text-[14px] font-medium mb-[8px] flex items-center gap-[6px]">
              <Globe className="w-[16px] h-[16px] text-[#6B7280]" />
              Website
            </label>
            <input
              type="text"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="w-full px-[16px] py-[12px] bg-white border border-[#E5E7EB] rounded-[10px] text-[16px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/10 transition-all"
              placeholder="www.yourwebsite.com"
            />
          </div>
        </div>

        {/* Bottom Spacer */}
        <div className="h-[24px]" />
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] px-[20px] py-[8px] flex-shrink-0">
        <div className="flex items-center justify-between">
          {/* Home */}
          <button
            onClick={() => handleTabChange("home")}
            className="flex flex-col items-center gap-[4px] py-[4px] px-[12px] transition-all active:scale-90"
          >
            <Home
              className={`w-[24px] h-[24px] ${
                activeTab === "home" ? "text-[#2E7D32]" : "text-[#9CA3AF]"
              }`}
            />
            <span
              className={`text-[11px] ${
                activeTab === "home"
                  ? "text-[#2E7D32] font-semibold"
                  : "text-[#9CA3AF]"
              }`}
            >
              Home
            </span>
          </button>

          {/* Bookings */}
          <button
            onClick={() => handleTabChange("bookings")}
            className="flex flex-col items-center gap-[4px] py-[4px] px-[12px] transition-all active:scale-90"
          >
            <Calendar
              className={`w-[24px] h-[24px] ${
                activeTab === "bookings" ? "text-[#2E7D32]" : "text-[#9CA3AF]"
              }`}
            />
            <span
              className={`text-[11px] ${
                activeTab === "bookings"
                  ? "text-[#2E7D32] font-semibold"
                  : "text-[#9CA3AF]"
              }`}
            >
              Bookings
            </span>
          </button>

          {/* Messages */}
          <button
            onClick={() => handleTabChange("messages")}
            className="flex flex-col items-center gap-[4px] py-[4px] px-[12px] transition-all active:scale-90"
          >
            <MessageCircle
              className={`w-[24px] h-[24px] ${
                activeTab === "messages" ? "text-[#2E7D32]" : "text-[#9CA3AF]"
              }`}
            />
            <span
              className={`text-[11px] ${
                activeTab === "messages"
                  ? "text-[#2E7D32] font-semibold"
                  : "text-[#9CA3AF]"
              }`}
            >
              Messages
            </span>
          </button>

          {/* Profile */}
          <button
            onClick={() => handleTabChange("profile")}
            className="flex flex-col items-center gap-[4px] py-[4px] px-[12px] transition-all active:scale-90"
          >
            <User
              className={`w-[24px] h-[24px] ${
                activeTab === "profile" ? "text-[#2E7D32]" : "text-[#9CA3AF]"
              }`}
            />
            <span
              className={`text-[11px] ${
                activeTab === "profile"
                  ? "text-[#2E7D32] font-semibold"
                  : "text-[#9CA3AF]"
              }`}
            >
              Profile
            </span>
          </button>

          {/* More */}
          <button
            onClick={() => handleTabChange("more")}
            className="flex flex-col items-center gap-[4px] py-[4px] px-[12px] transition-all active:scale-90"
          >
            <MoreHorizontal
              className={`w-[24px] h-[24px] ${
                activeTab === "more" ? "text-[#2E7D32]" : "text-[#9CA3AF]"
              }`}
            />
            <span
              className={`text-[11px] ${
                activeTab === "more"
                  ? "text-[#2E7D32] font-semibold"
                  : "text-[#9CA3AF]"
              }`}
            >
              More
            </span>
          </button>
        </div>
      </div>

      {/* Home Indicator */}
      <div className="fixed bottom-0 left-0 right-0 h-[34px] bg-white flex-shrink-0 pointer-events-none">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>
    </div>
  );
}
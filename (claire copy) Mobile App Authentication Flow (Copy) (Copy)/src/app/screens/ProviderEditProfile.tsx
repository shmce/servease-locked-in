import { useState, startTransition } from "react";
import { useNavigate } from "react-router";
import { StatusBar } from "../components/StatusBar";
import { Camera, X, Plus } from "lucide-react";
import { BackButton } from "../components/BackButton";

interface License {
  id: number;
  type: string;
  number: string;
  expiry: string;
}

interface Certification {
  id: number;
  name: string;
}

export default function ProviderEditProfile() {
  const navigate = useNavigate();

  // Form state
  const [businessName, setBusinessName] = useState("Juan's Professional Cleaning");
  const [yearsOfExperience, setYearsOfExperience] = useState("8");
  const [bio, setBio] = useState(
    "With over 8 years of professional cleaning experience, I take pride in delivering exceptional service to every client."
  );
  const [serviceAreas, setServiceAreas] = useState("Metro Manila, Philippines");
  const [languages, setLanguages] = useState(["English", "Filipino"]);

  // Professional Licenses
  const [licenses, setLicenses] = useState<License[]>([
    {
      id: 1,
      type: "Professional Cleaning License",
      number: "PCL-2018-001234",
      expiry: "12/31/2026",
    },
  ]);

  // Certifications
  const [certifications, setCertifications] = useState<Certification[]>([
    { id: 1, name: "Professional Cleaning Certification - ISSA" },
    { id: 2, name: "Green Cleaning Specialist" },
  ]);

  // Social Media
  const [facebookUrl, setFacebookUrl] = useState("https://facebook.com/yourbusiness");
  const [instagramUrl, setInstagramUrl] = useState("https://instagram.com/yourbusiness");
  const [websiteUrl, setWebsiteUrl] = useState("https://yourbusiness.com");

  const handleSave = () => {
    startTransition(() => {
      navigate(-1);
    });
  };

  const removeLanguage = (language: string) => {
    setLanguages(languages.filter((l) => l !== language));
  };

  const removeLicense = (id: number) => {
    setLicenses(licenses.filter((l) => l.id !== id));
  };

  const addLicense = () => {
    const newId = licenses.length > 0 ? Math.max(...licenses.map(l => l.id)) + 1 : 1;
    setLicenses([
      ...licenses,
      {
        id: newId,
        type: "",
        number: "",
        expiry: "",
      },
    ]);
  };

  const updateLicense = (id: number, field: keyof License, value: string) => {
    setLicenses(
      licenses.map((l) =>
        l.id === id ? { ...l, [field]: value } : l
      )
    );
  };

  const removeCertification = (id: number) => {
    setCertifications(certifications.filter((c) => c.id !== id));
  };

  const addCertification = () => {
    const newId = certifications.length > 0 ? Math.max(...certifications.map(c => c.id)) + 1 : 1;
    setCertifications([
      ...certifications,
      {
        id: newId,
        name: "",
      },
    ]);
  };

  const updateCertification = (id: number, name: string) => {
    setCertifications(
      certifications.map((c) =>
        c.id === id ? { ...c, name } : c
      )
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* iOS Status Bar */}
      <StatusBar />

      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB]">
        <div className="flex items-center justify-between h-[56px] px-[24px]">
          <BackButton />
          <h1 className="font-semibold text-[18px] text-[#111827]">Edit Profile</h1>
          <button
            onClick={handleSave}
            className="font-medium text-[16px] text-[#56C490] transition-all active:opacity-70"
          >
            Save
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-[24px]">
        {/* Cover Photo Section */}
        <div className="relative h-[180px] bg-gradient-to-br from-[#667EEA] via-[#764BA2] to-[#48C6EF]">
          <button className="absolute top-[12px] right-[12px] bg-white/90 backdrop-blur-sm px-[16px] py-[8px] rounded-[8px] flex items-center gap-[8px] shadow-sm transition-all active:scale-95">
            <Camera className="w-[16px] h-[16px] text-[#6B7280]" />
            <span className="text-[#374151] text-[14px] font-medium">
              Change Cover Photo
            </span>
          </button>
        </div>

        {/* Profile Photo Section */}
        <div className="px-[24px] -mt-[50px] mb-[24px]">
          <div className="relative inline-block">
            <div className="w-[100px] h-[100px] rounded-full bg-[#E5E7EB] flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <button className="absolute bottom-0 right-0 w-[32px] h-[32px] rounded-full bg-[#56C490] flex items-center justify-center shadow-lg border-2 border-white transition-all active:scale-95">
              <Plus className="w-[16px] h-[16px] text-white" />
            </button>
          </div>
          <div className="mt-[12px]">
            <p className="text-[14px] text-[#6B7280]">
              Profile Photo
            </p>
            <p className="text-[12px] text-[#9CA3AF] mt-[2px]">
              Upload a professional photo. PNG or JPG, max 5MB.
            </p>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white px-[24px] py-[20px] border-t border-[#F3F4F6]">
          <h2 className="text-[18px] font-semibold text-[#111827] mb-[16px]">
            Basic Information
          </h2>

          <div className="grid grid-cols-2 gap-[16px]">
            {/* Business Name */}
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-[14px] font-medium text-[#374151] mb-[8px]">
                Business Name
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-[16px] py-[12px] rounded-[8px] border border-[#E5E7EB] text-[16px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/10 transition-all"
                placeholder="Enter business name"
              />
            </div>

            {/* Years of Experience */}
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-[14px] font-medium text-[#374151] mb-[8px]">
                Years of Experience
              </label>
              <input
                type="number"
                value={yearsOfExperience}
                onChange={(e) => setYearsOfExperience(e.target.value)}
                className="w-full px-[16px] py-[12px] rounded-[8px] border border-[#E5E7EB] text-[16px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/10 transition-all"
                placeholder="Years"
              />
            </div>
          </div>

          {/* Bio/Description */}
          <div className="mt-[16px]">
            <label className="block text-[14px] font-medium text-[#374151] mb-[8px]">
              Bio/Description <span className="text-[#9CA3AF]">(118/500)</span>
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              maxLength={500}
              className="w-full px-[16px] py-[12px] rounded-[8px] border border-[#E5E7EB] text-[16px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/10 transition-all resize-none"
              placeholder="Tell customers about yourself and your services..."
            />
          </div>

          {/* Service Areas */}
          <div className="mt-[16px]">
            <label className="block text-[14px] font-medium text-[#374151] mb-[8px]">
              Service Areas
            </label>
            <input
              type="text"
              value={serviceAreas}
              onChange={(e) => setServiceAreas(e.target.value)}
              className="w-full px-[16px] py-[12px] rounded-[8px] border border-[#E5E7EB] text-[16px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/10 transition-all"
              placeholder="e.g., Metro Manila, Philippines"
            />
          </div>

          {/* Languages Spoken */}
          <div className="mt-[16px]">
            <label className="block text-[14px] font-medium text-[#374151] mb-[8px]">
              Languages Spoken
            </label>
            <div className="flex flex-wrap gap-[8px]">
              {languages.map((language) => (
                <div
                  key={language}
                  className="inline-flex items-center gap-[8px] bg-[#D1FAE5] text-[#065F46] px-[12px] py-[6px] rounded-[6px] text-[14px] font-medium"
                >
                  {language}
                  <button
                    onClick={() => removeLanguage(language)}
                    className="transition-all active:scale-90"
                  >
                    <X className="w-[14px] h-[14px]" />
                  </button>
                </div>
              ))}
              <button className="inline-flex items-center gap-[6px] bg-[#F3F4F6] text-[#6B7280] px-[12px] py-[6px] rounded-[6px] text-[14px] font-medium transition-all active:scale-95">
                <Plus className="w-[14px] h-[14px]" />
                Add Language
              </button>
            </div>
          </div>
        </div>

        {/* Professional Licenses */}
        <div className="bg-white px-[24px] py-[20px] mt-[8px] border-t border-[#F3F4F6]">
          <div className="flex items-center justify-between mb-[16px]">
            <h2 className="text-[18px] font-semibold text-[#111827]">
              Professional Licenses
            </h2>
            <button
              onClick={addLicense}
              className="inline-flex items-center gap-[6px] text-[#56C490] text-[14px] font-semibold transition-all active:opacity-70"
            >
              <Plus className="w-[16px] h-[16px]" />
              Add License
            </button>
          </div>

          <div className="space-y-[16px]">
            {licenses.map((license) => (
              <div
                key={license.id}
                className="bg-white border border-[#E5E7EB] rounded-[12px] p-[16px]"
              >
                {/* License Row Labels */}
                <div className="grid grid-cols-[2fr_2fr_1.5fr_auto] gap-[12px] mb-[8px]">
                  <div className="text-[12px] font-medium text-[#6B7280]">License Type</div>
                  <div className="text-[12px] font-medium text-[#6B7280]">License Number</div>
                  <div className="text-[12px] font-medium text-[#6B7280]">Expiry Date</div>
                  <div className="w-[40px]"></div>
                </div>

                {/* License Row Inputs */}
                <div className="grid grid-cols-[2fr_2fr_1.5fr_auto] gap-[12px] items-center">
                  <input
                    type="text"
                    value={license.type}
                    onChange={(e) => updateLicense(license.id, "type", e.target.value)}
                    className="w-full px-[12px] py-[10px] rounded-[8px] bg-[#F9FAFB] border border-[#E5E7EB] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/10 transition-all"
                    placeholder="e.g., Professional Cleaning License"
                  />
                  <input
                    type="text"
                    value={license.number}
                    onChange={(e) => updateLicense(license.id, "number", e.target.value)}
                    className="w-full px-[12px] py-[10px] rounded-[8px] bg-[#F9FAFB] border border-[#E5E7EB] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/10 transition-all"
                    placeholder="e.g., PCL-2018-001234"
                  />
                  <input
                    type="text"
                    value={license.expiry}
                    onChange={(e) => updateLicense(license.id, "expiry", e.target.value)}
                    className="w-full px-[12px] py-[10px] rounded-[8px] bg-[#F9FAFB] border border-[#E5E7EB] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/10 transition-all"
                    placeholder="mm/dd/yyyy"
                  />
                  <button
                    onClick={() => removeLicense(license.id)}
                    className="w-[40px] h-[40px] rounded-[8px] bg-[#FEE2E2] flex items-center justify-center transition-all active:scale-90"
                  >
                    <X className="w-[18px] h-[18px] text-[#DC2626]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="bg-white px-[24px] py-[20px] mt-[8px] border-t border-[#F3F4F6]">
          <div className="flex items-center justify-between mb-[16px]">
            <h2 className="text-[18px] font-semibold text-[#111827]">
              Certifications
            </h2>
            <button
              onClick={addCertification}
              className="inline-flex items-center gap-[6px] text-[#56C490] text-[14px] font-semibold transition-all active:opacity-70"
            >
              <Plus className="w-[16px] h-[16px]" />
              Add Certification
            </button>
          </div>

          <div className="space-y-[12px]">
            {certifications.map((cert) => (
              <div
                key={cert.id}
                className="flex items-center gap-[12px] bg-white border border-[#E5E7EB] rounded-[8px] p-[16px]"
              >
                <input
                  type="text"
                  value={cert.name}
                  onChange={(e) => updateCertification(cert.id, e.target.value)}
                  className="flex-1 px-[12px] py-[10px] rounded-[8px] bg-[#F9FAFB] border border-[#E5E7EB] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/10 transition-all"
                  placeholder="e.g., Professional Cleaning Certification"
                />
                <button
                  onClick={() => removeCertification(cert.id)}
                  className="w-[40px] h-[40px] rounded-[8px] bg-[#FEE2E2] flex items-center justify-center transition-all active:scale-90"
                >
                  <X className="w-[18px] h-[18px] text-[#DC2626]" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Social Media Links */}
        <div className="bg-white px-[24px] py-[20px] mt-[8px] border-t border-[#F3F4F6]">
          <h2 className="text-[18px] font-semibold text-[#111827] mb-[8px]">
            Social Media Links
          </h2>
          <p className="text-[14px] text-[#6B7280] mb-[16px]">All fields are optional</p>

          {/* Facebook URL */}
          <div className="mb-[16px]">
            <label className="block text-[14px] font-medium text-[#374151] mb-[8px]">
              Facebook URL
            </label>
            <input
              type="text"
              value={facebookUrl}
              onChange={(e) => setFacebookUrl(e.target.value)}
              className="w-full px-[16px] py-[12px] rounded-[8px] border border-[#E5E7EB] text-[16px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/10 transition-all"
              placeholder="https://facebook.com/yourbusiness"
            />
          </div>

          {/* Instagram URL */}
          <div className="mb-[16px]">
            <label className="block text-[14px] font-medium text-[#374151] mb-[8px]">
              Instagram URL
            </label>
            <input
              type="text"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              className="w-full px-[16px] py-[12px] rounded-[8px] border border-[#E5E7EB] text-[16px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/10 transition-all"
              placeholder="https://instagram.com/yourbusiness"
            />
          </div>

          {/* Website URL */}
          <div>
            <label className="block text-[14px] font-medium text-[#374151] mb-[8px]">
              Website URL
            </label>
            <input
              type="text"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="w-full px-[16px] py-[12px] rounded-[8px] border border-[#E5E7EB] text-[16px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/10 transition-all"
              placeholder="https://yourbusiness.com"
            />
          </div>
        </div>

        {/* Services & Pricing */}
        <div className="bg-white px-[24px] py-[20px] mt-[8px] border-t border-[#F3F4F6]">
          <div className="flex items-center justify-between mb-[16px]">
            <div>
              <h2 className="text-[18px] font-semibold text-[#111827]">
                Services & Pricing
              </h2>
              <p className="text-[14px] text-[#6B7280] mt-[4px]">
                Manage your service offerings and rates
              </p>
            </div>
            <button
              onClick={() => startTransition(() => navigate("/provider/edit-services-and-pricing"))}
              className="bg-[#56C490] text-white px-[16px] py-[8px] rounded-[8px] text-[14px] font-semibold transition-all active:scale-95 whitespace-nowrap"
            >
              Edit Services & Pricing
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px]">
            {/* House Cleaning */}
            <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] p-[16px]">
              <h3 className="text-[16px] font-semibold text-[#111827] mb-[4px]">
                House Cleaning
              </h3>
              <p className="text-[13px] text-[#6B7280] mb-[8px]">
                Standard house cleaning service including all rooms
              </p>
              <p className="text-[18px] font-bold text-[#56C490]">₱500 per hour</p>
            </div>

            {/* Deep Cleaning */}
            <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] p-[16px]">
              <h3 className="text-[16px] font-semibold text-[#111827] mb-[4px]">
                Deep Cleaning
              </h3>
              <p className="text-[13px] text-[#6B7280] mb-[8px]">
                Thorough deep cleaning with sanitization
              </p>
              <p className="text-[18px] font-bold text-[#56C490]">₱800 per hour</p>
            </div>

            {/* Office Cleaning */}
            <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] p-[16px]">
              <h3 className="text-[16px] font-semibold text-[#111827] mb-[4px]">
                Office Cleaning
              </h3>
              <p className="text-[13px] text-[#6B7280] mb-[8px]">
                Professional office cleaning service
              </p>
              <p className="text-[18px] font-bold text-[#56C490]">₱1200 per hour</p>
            </div>
          </div>
        </div>

        {/* Portfolio */}
        <div className="bg-white px-[24px] py-[20px] mt-[8px] border-t border-[#F3F4F6]">
          <div className="flex items-center justify-between mb-[16px]">
            <div>
              <h2 className="text-[18px] font-semibold text-[#111827]">
                Portfolio
              </h2>
              <p className="text-[14px] text-[#6B7280] mt-[4px]">
                Showcase your best work
              </p>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                setTimeout(() => {
                  startTransition(() => {
                    navigate("/provider/portfolio");
                  });
                }, 0);
              }}
              className="bg-[#56C490] text-white px-[16px] py-[8px] rounded-[8px] text-[14px] font-semibold transition-all active:scale-95 whitespace-nowrap"
            >
              Manage Portfolio
            </button>
          </div>

          <div className="grid grid-cols-2 gap-[12px]">
            <div className="aspect-[4/3] rounded-[8px] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop"
                alt="Portfolio 1"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-[4/3] rounded-[8px] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=400&h=300&fit=crop"
                alt="Portfolio 2"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { Wrench, Sparkles, GraduationCap, Home, PawPrint, PartyPopper, MonitorSmartphone, CalendarCheck, ShieldCheck, Bell, Star, BadgeCheck } from "lucide-react";
import Link from "next/link";
import type { LandingCatalogData } from "../lib/catalog";
import imgPhone1 from "../../assets/bf35badb77a1d5cf956297b4b5a9f631dc8ee077.png";
import imgPhone2 from "../../assets/f0b30b58fb0c9c4325b8b19c4d9f7b0c7f45297b.png";
import imgPhone3 from "../../assets/37b645ad864eae53163ff3fc8bec437cba9acd5f.png";
import imgPattern from "../../assets/a79220d8871d1f9af80d841a247e73ebeca14b3f.png";
import imgHero from "../../assets/a4d966e5771b713b7efb636298efbe07c97c3719.png";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { GooglePlayBadge, AppStoreBadge } from "./StoreBadges";

const serviceCategories = [
  {
    icon: Wrench,
    title: "Home Maintenance & Repair",
    description: "Fix, install, or maintain your home with trusted electricians, plumbers, and technicians.",
    image: "https://images.unsplash.com/photo-1723847165390-f45ef02f6b86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwcmVwYWlyJTIwbWFpbnRlbmFuY2UlMjBwbHVtYmVyfGVufDF8fHx8MTc3MjczOTg1MHww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    icon: Sparkles,
    title: "Beauty, Wellness & Personal Care",
    description: "Book professionals for hair, nails, massage, skincare, and personal wellness services.",
    image: "https://images.unsplash.com/photo-1731514771613-991a02407132?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dHklMjBzYWxvbiUyMHdlbGxuZXNzJTIwc3BhfGVufDF8fHx8MTc3MjczOTg1MHww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    icon: GraduationCap,
    title: "Education & Professional Services",
    description: "Connect with tutors, trainers, and professionals who help you learn and grow.",
    image: "https://images.unsplash.com/photo-1565688420536-11a4ddfa246f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0dXRvcmluZyUyMGVkdWNhdGlvbiUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NzI3Mzk4NTJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    icon: Home,
    title: "Domestic & Cleaning Services",
    description: "Hire reliable cleaners and house helpers to keep your home comfortable and organized.",
    image: "https://images.unsplash.com/photo-1758272421751-963195322eaa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3VzZSUyMGNsZWFuaW5nJTIwZG9tZXN0aWMlMjBzZXJ2aWNlfGVufDF8fHx8MTc3MjczOTg1MXww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    icon: PawPrint,
    title: "Pet Services",
    description: "Find trusted pet groomers, walkers, trainers, and pet care specialists.",
    image: "https://images.unsplash.com/photo-1735597403677-2029485b4547?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXQlMjBncm9vbWluZyUyMGRvZyUyMGNhcmV8ZW58MXx8fHwxNzcyNzM5ODUyfDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    icon: PartyPopper,
    title: "Events & Entertainment",
    description: "Book photographers, hosts, performers, decorators, and event planners.",
    image: "https://images.unsplash.com/photo-1766719628920-854680a92c22?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldmVudCUyMHBsYW5uaW5nJTIwZW50ZXJ0YWlubWVudCUyMHBhcnR5fGVufDF8fHx8MTc3MjczOTg1Mnww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    icon: MonitorSmartphone,
    title: "Automotive & Tech Support",
    description: "Get help with car maintenance, device troubleshooting, installation, and technical support.",
    image: "https://images.unsplash.com/photo-1729843606560-e41b0be7fc7c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXRvbW90aXZlJTIwbWVjaGFuaWMlMjB0ZWNoJTIwc3VwcG9ydHxlbnwxfHx8fDE3NzI3Mzk4NTN8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
];

const featureCards = [
  {
    icon: CalendarCheck,
    title: "Easy Service Booking",
    description: "Browse services, compare providers, and book appointments in minutes.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Professionals",
    description: "All service providers on ServEase are verified to ensure quality and reliability.",
  },
  {
    icon: Bell,
    title: "Real-Time Updates",
    description: "Track your booking status and service updates directly in the app.",
  },
];

interface HomePageProps {
  catalog: LandingCatalogData;
}

export function HomePage({ catalog }: HomePageProps) {
  const liveCategoryCards = catalog.categories.length > 0
    ? catalog.categories.map((category, index) => {
        const fallback = serviceCategories[index % serviceCategories.length];
        return {
          icon: resolveCategoryIcon(category.icon, category.name),
          title: category.name,
          description: category.description ?? fallback.description,
          image: fallback.image,
          serviceCount: catalog.services.filter((service) => service.categoryId === category.id).length,
        };
      })
    : serviceCategories.map((category) => ({ ...category, serviceCount: 0 }));

  const serviceLookup = new Map(
    catalog.services.map((service) => [service.id, service]),
  );

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="bg-[#00BF63] relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none">
          <img src={imgPattern.src} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 md:px-16 pt-8 pb-16 md:pb-0">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left py-8">
              <h1 className="font-['Poppins',sans-serif] text-3xl md:text-5xl text-white leading-tight mb-6">
                Book Trusted Services Anytime, Anywhere
              </h1>
              <p className="font-['Poppins',sans-serif] text-base md:text-lg text-white/90 leading-relaxed mb-8 max-w-xl">
                ServEase connects you with verified professionals for everyday services. Easily book home repairs, beauty services, tutoring, cleaning, pet care, events support, and tech help in just a few taps.
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <GooglePlayBadge />
                <AppStoreBadge />
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="relative w-full max-w-lg mx-auto">
                <ImageWithFallback
                  src={imgHero.src}
                  alt="ServEase App"
                  className="w-full h-auto object-cover rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-white py-16 md:py-24 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-['Poppins',sans-serif] text-3xl md:text-4xl text-black text-center mb-4">
            Explore Our Service Categories
          </h2>
          <p className="font-['Poppins',sans-serif] text-base md:text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            A complete suite of services across multiple categories, all available at your fingertips
          </p>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {featureCards.map((card) => (
              <div
                key={card.title}
                className="bg-[#f1f1f1] rounded-2xl p-8 flex flex-col items-start"
              >
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mb-4">
                  <card.icon size={32} className="text-[#00BF63]" />
                </div>
                <h3 className="font-['Poppins',sans-serif] text-xl text-[#00BF63] mb-3">
                  {card.title}
                </h3>
                <p className="font-['Poppins',sans-serif] text-sm text-gray-700 leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </div>

          {/* Service Categories Scrollable */}
          <div className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory scrollbar-hide">
            {liveCategoryCards.map((cat) => (
              <div
                key={cat.title}
                className="min-w-[280px] md:min-w-[320px] bg-white rounded-2xl shadow-lg overflow-hidden snap-start flex-shrink-0"
              >
                <ImageWithFallback
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <cat.icon size={20} className="text-[#00BF63]" />
                    <h4 className="font-['Poppins',sans-serif] text-base text-gray-900">
                      {cat.title}
                    </h4>
                  </div>
                  <p className="font-['Poppins',sans-serif] text-sm text-gray-600 leading-relaxed">
                    {cat.description}
                  </p>
                  {cat.serviceCount > 0 && (
                    <p className="font-['Poppins',sans-serif] text-xs text-[#00BF63] mt-3">
                      {cat.serviceCount} live service{cat.serviceCount === 1 ? "" : "s"}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {catalog.services.length > 0 && (
            <div className="mt-12">
              <h3 className="font-['Poppins',sans-serif] text-2xl text-gray-900 mb-6">
                Services Available Now
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {catalog.services.slice(0, 4).map((service) => (
                  <div
                    key={service.id}
                    className="border border-gray-200 rounded-xl p-5 bg-white"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-['Poppins',sans-serif] text-base text-gray-900 mb-1">
                          {service.name}
                        </h4>
                        <p className="font-['Poppins',sans-serif] text-sm text-gray-600 leading-relaxed">
                          {service.description ?? "Available through verified ServEase providers."}
                        </p>
                      </div>
                      {service.price !== null && (
                        <p className="font-['Poppins',sans-serif] text-sm text-[#00BF63] whitespace-nowrap">
                          {formatPrice(service.price, service.pricingMode)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {catalog.unavailable && (
            <p className="font-['Poppins',sans-serif] text-sm text-gray-500 text-center mt-8">
              Live catalog is temporarily unavailable, so sample categories are shown.
            </p>
          )}
        </div>
      </section>

      {catalog.providers.length > 0 && (
        <section className="bg-[#f8faf9] py-16 md:py-24 px-6 md:px-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
              <div>
                <h2 className="font-['Poppins',sans-serif] text-3xl md:text-4xl text-black mb-3">
                  Featured Providers
                </h2>
                <p className="font-['Poppins',sans-serif] text-base md:text-lg text-gray-600 max-w-2xl">
                  Browse real provider listings from the ServEase catalog.
                </p>
              </div>
              <p className="font-['Poppins',sans-serif] text-sm text-[#00BF63]">
                {catalog.providers.length} live listing{catalog.providers.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {catalog.providers.slice(0, 4).map((provider) => {
                const service = provider.serviceId ? serviceLookup.get(provider.serviceId) : null;

                return (
                  <Link
                    key={provider.id}
                    href={`/providers/${provider.id}`}
                    className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-['Poppins',sans-serif] text-xl text-gray-900">
                            {provider.providerBusinessName ?? "Verified Provider"}
                          </h3>
                          {provider.verificationStatus === "approved" && (
                            <BadgeCheck size={20} className="text-[#00BF63]" />
                          )}
                        </div>
                        <p className="font-['Poppins',sans-serif] text-sm text-gray-500">
                          {service?.name ?? "ServEase service"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-[#00BF63]">
                        <Star size={18} fill="currentColor" />
                        <span className="font-['Poppins',sans-serif] text-sm">
                          {provider.averageRating.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <h4 className="font-['Poppins',sans-serif] text-base text-gray-900 mb-2">
                      {provider.title}
                    </h4>
                    <p className="font-['Poppins',sans-serif] text-sm text-gray-600 leading-relaxed mb-5">
                      {provider.description ?? "Service details are available in the ServEase app."}
                    </p>

                    <div className="flex items-center justify-between gap-4">
                      <p className="font-['Poppins',sans-serif] text-sm text-gray-500">
                        {provider.reviewCount} review{provider.reviewCount === 1 ? "" : "s"}
                      </p>
                      {provider.price !== null && (
                        <p className="font-['Poppins',sans-serif] text-base text-[#00BF63]">
                          {formatPrice(provider.price, provider.pricingMode)}
                        </p>
                      )}
                    </div>
                    <p className="font-['Poppins',sans-serif] text-sm text-[#00BF63] mt-5">
                      View provider and request booking
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Trust Section - Growing Network */}
      <section className="bg-[#00BF63] relative py-16 md:py-24 px-6 md:px-16">
        <div className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none">
          <img src={imgPattern.src} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <h2 className="font-['Poppins',sans-serif] text-3xl md:text-4xl text-white mb-6">
                Growing Network of Service Professionals
              </h2>
              <p className="font-['Poppins',sans-serif] text-base md:text-lg text-white/90 leading-relaxed max-w-xl">
                ServEase connects customers with trusted service professionals in just a few taps. Whether you need cleaning, repairs, or other home services, finding reliable help has never been easier. Our platform helps skilled providers reach more clients while making everyday tasks simpler for everyone.
              </p>
            </div>
            <div className="flex-1">
              <div className="bg-[#f1f1f1] rounded-[50px] overflow-hidden max-w-md mx-auto aspect-[760/830]">
                <img
                  src={imgPhone2.src}
                  alt="ServEase App Screenshot"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="bg-[#00BF63] relative py-16 md:py-24 px-6 md:px-16">
        <div className="relative max-w-7xl mx-auto space-y-16">
          {/* Track Your Bookings */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-12">
            <div className="flex-1 text-right">
              <h2 className="font-['Poppins',sans-serif] text-3xl md:text-4xl text-white mb-6">
                Track Your Bookings
              </h2>
              <p className="font-['Poppins',sans-serif] text-base md:text-lg text-white/90 leading-relaxed">
                Stay informed with real-time updates on your service bookings from start to finish. Track your provider's location, arrival time, and service progress all in one place. ServEase keeps you connected so you always know what's happening with your booking.
              </p>
            </div>
            <div className="flex-1">
              <div className="bg-[#f1f1f1] rounded-[50px] overflow-hidden max-w-md mx-auto aspect-[760/830]">
                <img
                  src={imgPhone1.src}
                  alt="Track Bookings"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Book for Family or Friends */}
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <h2 className="font-['Poppins',sans-serif] text-3xl md:text-4xl text-white mb-6">
                Book for Family or Friends
              </h2>
              <p className="font-['Poppins',sans-serif] text-base md:text-lg text-white/90 leading-relaxed max-w-xl">
                Need to book a service for someone else? ServEase makes it easy to schedule services for your family members or friends using your own account. Simply enter their details and let trusted professionals handle the rest.
              </p>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="bg-[#f1f1f1] rounded-[50px] overflow-hidden max-w-md aspect-[760/830]">
                <img
                  src={imgPhone3.src}
                  alt="Book for Family"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white py-16 md:py-24 px-6 md:px-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-['Poppins',sans-serif] text-3xl md:text-4xl text-black mb-4">
            Become a ServEase Service Worker
          </h2>
          <p className="font-['Inter',sans-serif] text-base md:text-lg text-gray-600 leading-relaxed mb-8">
            Turn your skills into opportunities. Join ServEase and connect with customers who need your services.
          </p>
          <Link
            href="/provider-registration"
            className="inline-block bg-[#00BF63] hover:bg-[#00a855] text-white font-['Inter',sans-serif] px-8 py-3 rounded-xl transition-colors"
          >
            Join as a Worker
          </Link>
        </div>
      </section>
    </div>
  );
}

function resolveCategoryIcon(icon: string | null, name: string) {
  const key = `${icon ?? ""} ${name}`.toLowerCase();

  if (key.includes("clean") || key.includes("sparkle")) {
    return Sparkles;
  }

  if (key.includes("repair") || key.includes("wrench")) {
    return Wrench;
  }

  if (key.includes("education") || key.includes("tutor")) {
    return GraduationCap;
  }

  if (key.includes("pet")) {
    return PawPrint;
  }

  if (key.includes("event")) {
    return PartyPopper;
  }

  if (key.includes("tech") || key.includes("auto")) {
    return MonitorSmartphone;
  }

  return Home;
}

function formatPrice(price: number, pricingMode: "flat" | "hourly") {
  const formatted = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(price);

  return pricingMode === "hourly" ? `${formatted}/hr` : formatted;
}

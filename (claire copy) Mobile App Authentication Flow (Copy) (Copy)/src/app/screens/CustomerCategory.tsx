import { useNavigate, useParams } from "react-router";
import { ServiceHeader } from "../components/ServiceHeader";
import { formatPesoShort } from "../utils/formatPeso";

// Import Figma assets
import imgCleaning from "figma:asset/8bd2e59dbf8efcf21cb462c4e005a4ae10bc8a9f.png";
import imgPainting from "figma:asset/055a94c7aed3d6b215d8c30ebe8ef2d390e91063.png";
import imgElectrical from "figma:asset/0470ea35e3bf1f6abd920a53f6d9574601847653.png";
import imgPlumbing from "figma:asset/ae4149c41522183f2cdefb36af0811177140690c.png";
import imgHandyman1 from "figma:asset/911b8d9c9aa4a10429fb6f533910cec9d69acd94.png";
import imgHandyman2 from "figma:asset/9dad9ac22cc069814276effcb79422ffe3886a97.png";
import imgInterior from "figma:asset/7bb0ce6a244ec7885ff0237ef8e266be2159d15e.png";
import imgGardening from "figma:asset/f1b9a189702e78d03113bd5a4e3316bd3b070080.png";

const categoryData: Record<string, { name: string; services: Array<{ id: number; title: string; description: string; price: number; image: string }> }> = {
  "home-maintenance-repair": {
    name: "Home Maintenance and Repair",
    services: [
      { id: 101, title: "General Plumbing Repair", description: "Fix leaks, clogs, and install fixtures", price: 75, image: imgPlumbing },
      { id: 102, title: "Electrical Repair & Installation", description: "Wiring, outlets, and lighting fixes", price: 85, image: imgElectrical },
      { id: 103, title: "Carpentry & Woodwork", description: "Furniture repair and custom woodwork", price: 90, image: imgHandyman1 },
      { id: 104, title: "HVAC Maintenance", description: "AC and heating system service", price: 110, image: imgHandyman2 },
      { id: 105, title: "Roof Inspection & Repair", description: "Identify and fix roof issues", price: 150, image: imgInterior },
      { id: 106, title: "Door & Window Repair", description: "Fix or replace doors and windows", price: 95, image: imgPainting },
      { id: 107, title: "Drywall Patching", description: "Repair holes and cracks in walls", price: 65, image: imgHandyman1 },
      { id: 108, title: "Gutter Cleaning & Repair", description: "Clear and fix gutters and downspouts", price: 80, image: imgGardening },
    ],
  },
  "beauty-wellness-personal-care": {
    name: "Beauty, Wellness & Personal Care",
    services: [
      { id: 201, title: "In-Home Hair Styling", description: "Professional cuts, colors, and styling", price: 60, image: imgHandyman2 },
      { id: 202, title: "Mobile Massage Therapy", description: "Relaxing massage at your location", price: 90, image: imgHandyman1 },
      { id: 203, title: "Manicure & Pedicure", description: "Nail care and beautification", price: 45, image: imgCleaning },
      { id: 204, title: "Makeup Artist Services", description: "Special event makeup application", price: 80, image: imgPainting },
      { id: 205, title: "Personal Training", description: "One-on-one fitness coaching", price: 70, image: imgElectrical },
      { id: 206, title: "Yoga Instruction", description: "Private or group yoga sessions", price: 55, image: imgInterior },
      { id: 207, title: "Nutrition Consulting", description: "Diet planning and wellness advice", price: 100, image: imgGardening },
    ],
  },
  "education-professional-services": {
    name: "Education & Professional Services",
    services: [
      { id: 301, title: "Private Tutoring (Math)", description: "One-on-one math instruction", price: 50, image: imgHandyman1 },
      { id: 302, title: "Language Lessons", description: "Learn a new language with expert tutors", price: 55, image: imgHandyman2 },
      { id: 303, title: "Music Lessons", description: "Piano, guitar, and vocal training", price: 60, image: imgPainting },
      { id: 304, title: "Resume Writing", description: "Professional resume and cover letter", price: 75, image: imgCleaning },
      { id: 305, title: "Business Consulting", description: "Strategy and operations advice", price: 150, image: imgInterior },
      { id: 306, title: "Tax Preparation", description: "File your taxes accurately", price: 120, image: imgElectrical },
      { id: 307, title: "Legal Consultation", description: "Get legal advice from experts", price: 200, image: imgPlumbing },
      { id: 308, title: "Career Coaching", description: "Advance your professional goals", price: 90, image: imgGardening },
    ],
  },
  "domestic-cleaning-services": {
    name: "Domestic & Cleaning Services",
    services: [
      { id: 401, title: "Deep House Cleaning", description: "Thorough cleaning of your entire home", price: 120, image: imgCleaning },
      { id: 402, title: "Regular Housekeeping", description: "Weekly or bi-weekly cleaning service", price: 80, image: imgHandyman1 },
      { id: 403, title: "Carpet & Upholstery Cleaning", description: "Steam clean carpets and furniture", price: 95, image: imgHandyman2 },
      { id: 404, title: "Window Washing", description: "Inside and outside window cleaning", price: 70, image: imgPainting },
      { id: 405, title: "Move-In/Move-Out Cleaning", description: "Prepare your home for new occupants", price: 150, image: imgInterior },
      { id: 406, title: "Laundry & Ironing", description: "Wash, dry, and iron your clothes", price: 50, image: imgElectrical },
      { id: 407, title: "Kitchen Deep Clean", description: "Sanitize and degrease your kitchen", price: 85, image: imgPlumbing },
      { id: 408, title: "Bathroom Sanitization", description: "Deep clean and disinfect bathrooms", price: 65, image: imgGardening },
    ],
  },
  "pet-services": {
    name: "Pet Services",
    services: [
      { id: 501, title: "Dog Walking", description: "Daily walks for your furry friend", price: 25, image: imgGardening },
      { id: 502, title: "Pet Sitting", description: "In-home care while you're away", price: 40, image: imgHandyman1 },
      { id: 503, title: "Pet Grooming", description: "Bathing, trimming, and nail care", price: 60, image: imgHandyman2 },
      { id: 504, title: "Pet Training", description: "Obedience and behavior training", price: 75, image: imgCleaning },
      { id: 505, title: "Veterinary House Calls", description: "Vet visits at your convenience", price: 100, image: imgElectrical },
      { id: 506, title: "Aquarium Maintenance", description: "Clean and maintain your fish tank", price: 55, image: imgPlumbing },
      { id: 507, title: "Pet Taxi Service", description: "Safe transport for your pets", price: 35, image: imgPainting },
    ],
  },
  "events-entertainment": {
    name: "Events & Entertainment",
    services: [
      { id: 601, title: "DJ Services", description: "Music and entertainment for parties", price: 200, image: imgHandyman2 },
      { id: 602, title: "Event Photography", description: "Capture your special moments", price: 250, image: imgPainting },
      { id: 603, title: "Catering Services", description: "Delicious food for any event", price: 300, image: imgCleaning },
      { id: 604, title: "Party Planning", description: "Full-service event coordination", price: 180, image: imgInterior },
      { id: 605, title: "Face Painting", description: "Fun designs for kids' parties", price: 75, image: imgHandyman1 },
      { id: 606, title: "Balloon Decoration", description: "Creative balloon displays and arches", price: 120, image: imgGardening },
      { id: 607, title: "Magic Shows", description: "Entertainment for all ages", price: 150, image: imgElectrical },
      { id: 608, title: "Live Band Performance", description: "Musical entertainment for events", price: 400, image: imgPlumbing },
    ],
  },
  "automotive-tech-support": {
    name: "Automotive & Tech Support",
    services: [
      { id: 701, title: "Mobile Car Wash & Detailing", description: "Professional car cleaning at your location", price: 85, image: imgHandyman1 },
      { id: 702, title: "Oil Change Service", description: "Quick oil change at your home", price: 50, image: imgHandyman2 },
      { id: 703, title: "Tire Replacement", description: "Install new tires on-site", price: 100, image: imgPlumbing },
      { id: 704, title: "Computer Repair", description: "Fix hardware and software issues", price: 90, image: imgElectrical },
      { id: 705, title: "Phone Screen Replacement", description: "Replace cracked smartphone screens", price: 70, image: imgPainting },
      { id: 706, title: "Home Network Setup", description: "Install and configure WiFi networks", price: 95, image: imgInterior },
      { id: 707, title: "Smart Home Installation", description: "Set up smart devices and systems", price: 120, image: imgCleaning },
      { id: 708, title: "TV Mounting & Setup", description: "Mount and configure your television", price: 80, image: imgGardening },
    ],
  },
};

export default function CustomerCategory() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  
  const category = slug ? categoryData[slug] : null;

  if (!category) {
    return (
      <div className="bg-white w-full h-screen flex items-center justify-center">
        <p className="font-['Nunito',sans-serif] text-[16px] text-[#666]">
          Category not found
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white w-full h-screen flex flex-col">
      {/* Service Header */}
      <ServiceHeader
        title={category.name}
        subtitle={`${category.services.length} services available`}
      />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[24px] pb-[40px]">
        <div className="mt-[20px] mb-[20px]">
          <h1 className="font-['Nunito',sans-serif] text-[22px] text-[#111827] leading-[1.2] mb-[6px]">
            {category.name}
          </h1>
          <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280]">
            {category.services.length} services available
          </p>
        </div>

        {/* Services Grid */}
        <div className="space-y-[12px]">
          {category.services.map((service) => (
            <button
              key={service.id}
              onClick={() => navigate(`/customer/service/${service.id}`)}
              className="w-full flex gap-[14px] p-[12px] bg-[#F9FAFB] rounded-[14px] border border-[#F2F2F2] transition-all active:scale-[0.98] shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
            >
              <div className="w-[90px] h-[90px] rounded-[12px] overflow-hidden flex-shrink-0">
                <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-between text-left py-[2px]">
                <div>
                  <h3 className="font-['Nunito',sans-serif] text-[14px] text-[#111827] mb-[4px] leading-[1.3]">
                    {service.title}
                  </h3>
                  <p className="font-['Nunito',sans-serif] text-[12px] text-[#6B7280] leading-[1.4]">
                    {service.description}
                  </p>
                </div>
                <p className="font-['Nunito',sans-serif] text-[14px] text-[#56C490]">
                  From {formatPesoShort(service.price)}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Home Indicator */}
      <div className="h-[34px] bg-white flex-shrink-0 relative">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>
    </div>
  );
}
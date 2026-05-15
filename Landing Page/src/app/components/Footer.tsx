import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";
import imgLogo from "../../assets/f5a6a28739bed7a9af038e3bf55db0c6b4b73bfc.png";

export function Footer() {
  return (
    <footer className="bg-black text-white py-12 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="flex-1">
            <img src={imgLogo.src} alt="ServEase" className="h-10 object-contain mb-4" />
            <p className="font-['Inter',sans-serif] text-sm text-gray-300 max-w-lg leading-relaxed">
              At ServEase, we prioritize your trust and safety. We connect you with verified service professionals to make everyday tasks easier. Your satisfaction and security are at the heart of everything we do. For more details, please read our full Privacy Policy and Terms of Service.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="font-['Poppins',sans-serif] text-[#00BF63] mb-1">Quick Links</h4>
            {[
              { to: "/", label: "Home" },
              { to: "/about", label: "About Us" },
              { to: "/faq", label: "FAQ" },
              { to: "/contact", label: "Contact" },
            ].map((link) => (
              <Link
                key={link.to}
                href={link.to}
                className="font-['Inter',sans-serif] text-sm text-gray-300 no-underline hover:text-[#00BF63] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex gap-4">
            {[
              { Icon: Facebook, label: "Facebook" },
              { Icon: Instagram, label: "Instagram" },
              { Icon: Twitter, label: "Twitter" },
            ].map(({ Icon, label }) => (
              <div
                key={label}
                className="w-12 h-12 rounded-full bg-[#343434] flex items-center justify-center cursor-pointer hover:bg-[#00BF63] transition-colors"
              >
                <Icon size={20} className="text-white" />
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p className="font-['Inter',sans-serif] text-xs text-gray-500">
            &copy; 2026 ServEase. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

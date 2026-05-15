"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { createSupabaseBrowserClient } from "../lib/supabase-browser";
import imgLogo from "../../assets/f5a6a28739bed7a9af038e3bf55db0c6b4b73bfc.png";

export function Navbar() {
  const pathname = usePathname();
  const { isSignedIn, signOut } = useNavAuth();
  const isActive = (path: string) => pathname === path;

  return (
    <nav className="w-full px-6 md:px-16 py-4 flex items-center justify-between relative z-50">
      <Link href="/" className="flex items-center gap-2">
        <img src={imgLogo.src} alt="ServEase" className="h-10 object-contain" />
      </Link>
      <div className="hidden md:flex items-center bg-black rounded-full px-8 py-3 gap-8">
        <Link
          href="/"
          className={`font-['Poppins',sans-serif] text-base no-underline transition-colors ${
            isActive("/") ? "text-[#00BF63]" : "text-white hover:text-[#00BF63]"
          }`}
        >
          Home
        </Link>
        <Link
          href="/about"
          className={`font-['Poppins',sans-serif] text-base no-underline transition-colors ${
            isActive("/about") ? "text-[#00BF63]" : "text-white hover:text-[#00BF63]"
          }`}
        >
          About Us
        </Link>
        <Link
          href="/faq"
          className={`font-['Poppins',sans-serif] text-base no-underline transition-colors ${
            isActive("/faq") ? "text-[#00BF63]" : "text-white hover:text-[#00BF63]"
          }`}
        >
          FAQ
        </Link>
        <Link
          href="/contact"
          className={`font-['Poppins',sans-serif] text-base no-underline transition-colors ${
            isActive("/contact") ? "text-[#00BF63]" : "text-white hover:text-[#00BF63]"
          }`}
        >
          Contact
        </Link>
        <Link
          href={isSignedIn ? "/account" : "/login"}
          className={`font-['Poppins',sans-serif] text-base no-underline transition-colors ${
            isActive("/account") || isActive("/login")
              ? "text-[#00BF63]"
              : "text-white hover:text-[#00BF63]"
          }`}
        >
          {isSignedIn ? "Account" : "Sign In"}
        </Link>
        {isSignedIn && (
          <button
            type="button"
            onClick={signOut}
            className="inline-flex items-center gap-2 font-['Poppins',sans-serif] text-base text-white transition-colors hover:text-[#00BF63]"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        )}
      </div>
      {/* Mobile menu */}
      <MobileMenu isSignedIn={isSignedIn} signOut={signOut} />
    </nav>
  );
}

function MobileMenu({
  isSignedIn,
  signOut,
}: {
  isSignedIn: boolean;
  signOut: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="text-white p-2"
        aria-label="Toggle menu"
      >
        {open ? <X size={28} /> : <Menu size={28} />}
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 bg-black/95 backdrop-blur-sm flex flex-col items-center gap-4 py-6 z-50">
          {[
            { path: "/", label: "Home" },
            { path: "/about", label: "About Us" },
            { path: "/faq", label: "FAQ" },
            { path: "/contact", label: "Contact" },
            {
              path: isSignedIn ? "/account" : "/login",
              label: isSignedIn ? "Account" : "Sign In",
            },
          ].map((item) => (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setOpen(false)}
              className={`font-['Poppins',sans-serif] text-lg no-underline ${
                isActive(item.path) ? "text-[#00BF63]" : "text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
          {isSignedIn && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                void signOut();
              }}
              className="inline-flex items-center gap-2 font-['Poppins',sans-serif] text-lg text-white"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function useNavAuth() {
  const router = useRouter();
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    let isMounted = true;

    try {
      const supabase = createSupabaseBrowserClient();

      void supabase.auth.getSession().then(({ data }) => {
        if (isMounted) {
          setIsSignedIn(Boolean(data.session));
        }
      });

      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (isMounted) {
          setIsSignedIn(Boolean(session));
        }
      });

      return () => {
        isMounted = false;
        listener.subscription.unsubscribe();
      };
    } catch {
      setIsSignedIn(false);
      return () => {
        isMounted = false;
      };
    }
  }, []);

  const signOut = async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
      setIsSignedIn(false);
      router.push("/login");
    } catch {
      setIsSignedIn(false);
      router.push("/login");
    }
  };

  return { isSignedIn, signOut };
}

import { useState, useRef, useEffect } from "react";

interface SearchableDropdownProps {
  label: string;
  required?: boolean;
  placeholder: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function SearchableDropdown({
  label,
  required,
  placeholder,
  options,
  value,
  onChange,
  error,
}: SearchableDropdownProps) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync query with external value changes
  useEffect(() => {
    setQuery(value);
  }, [value]);

  const filtered = options.filter((opt) =>
    opt.toLowerCase().includes(query.toLowerCase())
  );

  const handleInputChange = (text: string) => {
    setQuery(text);
    onChange(text);
    setIsOpen(true);
  };

  const handleSelect = (opt: string) => {
    setQuery(opt);
    onChange(opt);
    setIsOpen(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
        {label} {required && <span className="text-[#ff4444]">*</span>}
      </label>
      <input
        type="text"
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => {
          setIsFocused(true);
          setIsOpen(true);
        }}
        placeholder={placeholder}
        className={`w-full px-[16px] py-[14px] bg-[#f5f5f5] border-2 rounded-[12px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:bg-white transition-all ${
          error ? "border-[#ff4444]" : isFocused ? "border-[#56C490] bg-white" : "border-transparent"
        }`}
      />

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-[4px] bg-white border border-[#e0e0e0] rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.12)] z-20 overflow-hidden max-h-[220px] overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((opt) => (
              <button
                key={opt}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(opt)}
                className={`w-full px-[16px] py-[12px] font-['Nunito',sans-serif] text-[14px] text-left transition-all ${
                  value === opt
                    ? "bg-[#56C490]/10 text-[#56C490]"
                    : "text-[#1a1a1a] active:bg-[#f5f5f5]"
                }`}
              >
                {opt}
              </button>
            ))
          ) : (
            <div className="px-[16px] py-[14px] font-['Nunito',sans-serif] text-[14px] text-[#999]">
              No results found
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="font-['Nunito',sans-serif] text-[11px] text-[#ff4444] mt-[6px]">
          {error}
        </p>
      )}
    </div>
  );
}
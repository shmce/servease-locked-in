import { useState, useRef, useEffect } from "react";
import { MoreVertical, LucideIcon } from "lucide-react";
import { IconButton } from "./IconButton";
import { cn } from "../ui/utils";

export interface ActionMenuItem {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: "default" | "danger";
  disabled?: boolean;
  helperText?: string;
  divider?: boolean;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  align?: "left" | "right";
}

export function ActionMenu({ items, align = "right" }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <IconButton
        icon={MoreVertical}
        tooltip="More actions"
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        size="sm"
      />

      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div 
            className="fixed inset-0 z-40 md:hidden" 
            onClick={() => setIsOpen(false)}
          />

          {/* Desktop: Dropdown Menu */}
          <div
            className={cn(
              "absolute z-50 mt-1 w-56 rounded-lg bg-white shadow-lg border border-gray-200 py-1",
              "hidden md:block",
              align === "right" ? "right-0" : "left-0"
            )}
          >
            {items.map((item, index) => (
              <div key={index}>
                {item.divider && <div className="h-px bg-gray-200 my-1" />}
                <button
                  onClick={() => {
                    if (!item.disabled) {
                      item.onClick();
                      setIsOpen(false);
                    }
                  }}
                  disabled={item.disabled}
                  className={cn(
                    "w-full flex items-start gap-3 px-4 py-2 text-sm transition-colors text-left",
                    item.disabled
                      ? "opacity-50 cursor-not-allowed"
                      : item.variant === "danger"
                      ? "text-red-600 hover:bg-red-50"
                      : "text-gray-700 hover:bg-[#DCFCE7]",
                    !item.disabled && "cursor-pointer"
                  )}
                >
                  {item.icon && <item.icon className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                  <div className="flex-1">
                    <div>{item.label}</div>
                    {item.helperText && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        {item.helperText}
                      </div>
                    )}
                  </div>
                </button>
              </div>
            ))}
          </div>

          {/* Mobile: Bottom Sheet */}
          <div className="fixed inset-x-0 bottom-0 z-50 md:hidden bg-white rounded-t-2xl shadow-2xl border-t border-gray-200 animate-slide-up">
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-gray-900">Actions</h3>
            </div>
            <div className="max-h-96 overflow-y-auto py-2">
              {items.map((item, index) => (
                <div key={index}>
                  {item.divider && <div className="h-px bg-gray-200 my-2" />}
                  <button
                    onClick={() => {
                      if (!item.disabled) {
                        item.onClick();
                        setIsOpen(false);
                      }
                    }}
                    disabled={item.disabled}
                    className={cn(
                      "w-full flex items-start gap-3 px-4 py-3 text-sm transition-colors text-left",
                      item.disabled
                        ? "opacity-50 cursor-not-allowed"
                        : item.variant === "danger"
                        ? "text-red-600 active:bg-red-50"
                        : "text-gray-700 active:bg-[#DCFCE7]",
                      !item.disabled && "cursor-pointer"
                    )}
                  >
                    {item.icon && <item.icon className="w-5 h-5 mt-0.5 flex-shrink-0" />}
                    <div className="flex-1">
                      <div className="font-medium">{item.label}</div>
                      {item.helperText && (
                        <div className="text-xs text-gray-500 mt-1">
                          {item.helperText}
                        </div>
                      )}
                    </div>
                  </button>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

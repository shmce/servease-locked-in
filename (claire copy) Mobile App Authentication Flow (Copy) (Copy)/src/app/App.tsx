import React from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { BookingProvider } from "./contexts/BookingContext";
import { OnboardingProvider } from "./contexts/OnboardingContext";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-[393px] h-[852px] mx-auto bg-white flex flex-col items-center justify-center px-[24px] text-center">
          <div className="w-[64px] h-[64px] bg-[#ff4444]/10 rounded-full flex items-center justify-center mb-[16px]">
            <span className="text-[28px]">!</span>
          </div>
          <h2 className="font-['Nunito',sans-serif] text-[20px] text-[#1a1a1a] mb-[8px]">
            Something went wrong
          </h2>
          <p className="font-['Nunito',sans-serif] text-[14px] text-[#666] mb-[24px]">
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#56C490] text-white font-['Nunito',sans-serif] text-[15px] px-[32px] py-[14px] rounded-[50px]"
          >
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <OnboardingProvider>
        <BookingProvider>
          <RouterProvider router={router} />
        </BookingProvider>
      </OnboardingProvider>
    </ErrorBoundary>
  );
}
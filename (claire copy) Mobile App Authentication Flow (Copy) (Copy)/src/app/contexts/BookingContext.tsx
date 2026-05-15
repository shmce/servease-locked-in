import React, { createContext, useContext, useState, ReactNode } from "react";

type BookingStatus = "pending" | "confirmed" | "onTheWay" | "arrived" | "inProgress" | "completed" | "cancelled";

interface BookingStatusState {
  [bookingId: string]: {
    status: BookingStatus;
    statusColor?: string;
  };
}

interface BookingContextType {
  bookingStatuses: BookingStatusState;
  updateBookingStatus: (bookingId: string, status: BookingStatus, statusColor?: string) => void;
  getBookingStatus: (bookingId: string) => BookingStatus | undefined;
}

const BookingContext = createContext<BookingContextType | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookingStatuses, setBookingStatuses] = useState<BookingStatusState>({});

  const updateBookingStatus = (bookingId: string, status: BookingStatus, statusColor?: string) => {
    setBookingStatuses((prev) => ({
      ...prev,
      [bookingId]: { status, statusColor }
    }));
  };

  const getBookingStatus = (bookingId: string): BookingStatus | undefined => {
    return bookingStatuses[bookingId]?.status;
  };

  return (
    <BookingContext.Provider value={{ bookingStatuses, updateBookingStatus, getBookingStatus }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
}

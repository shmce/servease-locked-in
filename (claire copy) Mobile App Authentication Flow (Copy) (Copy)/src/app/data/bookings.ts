// Shared bookings data for Provider screens

export interface Booking {
  id: string;
  referenceNumber: string;
  customerName: string;
  customerPhoto: string;
  serviceType: string;
  date: string;
  time: string;
  location: string;
  distance?: string;
  status: string;
  amount: string;
  statusColor: string;
}

export type TabType = "upcoming" | "inProgress" | "completed" | "cancelled";

export const bookingsData: Record<TabType, Booking[]> = {
  upcoming: [
    {
      id: "1",
      referenceNumber: "BK-2026-03-001",
      customerName: "Juan Dela Cruz",
      customerPhoto: "https://i.pravatar.cc/150?img=12",
      serviceType: "Plumbing Repair",
      date: "March 15, 2026",
      time: "2:00 PM",
      location: "123 Rizal Street, Makati City",
      distance: "2.3 km",
      status: "Confirmed",
      amount: "1,500.00",
      statusColor: "#56C490"
    },
    {
      id: "2",
      referenceNumber: "BK-2026-03-002",
      customerName: "Maria Santos",
      customerPhoto: "https://i.pravatar.cc/150?img=5",
      serviceType: "Electrical Wiring",
      date: "March 16, 2026",
      time: "10:00 AM",
      location: "456 Bonifacio Ave, Taguig",
      distance: "5.1 km",
      status: "Pending",
      amount: "2,300.00",
      statusColor: "#F59E0B"
    },
    {
      id: "3",
      referenceNumber: "BK-2026-03-003",
      customerName: "Pedro Reyes",
      customerPhoto: "https://i.pravatar.cc/150?img=8",
      serviceType: "Aircon Cleaning",
      date: "March 18, 2026",
      time: "3:30 PM",
      location: "789 Luna Street, Quezon City",
      distance: "7.8 km",
      status: "Confirmed",
      amount: "800.00",
      statusColor: "#56C490"
    }
  ],
  inProgress: [
    {
      id: "4",
      referenceNumber: "BK-2026-03-004",
      customerName: "Ana Garcia",
      customerPhoto: "https://i.pravatar.cc/150?img=9",
      serviceType: "Home Cleaning",
      date: "March 13, 2026",
      time: "9:00 AM",
      location: "321 Magallanes Street, Manila",
      status: "In Progress",
      amount: "1,200.00",
      statusColor: "#3B82F6"
    }
  ],
  completed: [
    {
      id: "5",
      referenceNumber: "BK-2026-03-005",
      customerName: "Carlos Fernandez",
      customerPhoto: "https://i.pravatar.cc/150?img=13",
      serviceType: "Painting Service",
      date: "March 10, 2026",
      time: "1:00 PM",
      location: "555 Roxas Blvd, Pasay City",
      status: "Completed",
      amount: "3,500.00",
      statusColor: "#6B7280"
    },
    {
      id: "6",
      referenceNumber: "BK-2026-03-006",
      customerName: "Lisa Martinez",
      customerPhoto: "https://i.pravatar.cc/150?img=10",
      serviceType: "Plumbing Repair",
      date: "March 8, 2026",
      time: "11:00 AM",
      location: "222 Katipunan Ave, QC",
      status: "Completed",
      amount: "1,800.00",
      statusColor: "#6B7280"
    }
  ],
  cancelled: [
    {
      id: "7",
      referenceNumber: "BK-2026-03-007",
      customerName: "Roberto Cruz",
      customerPhoto: "https://i.pravatar.cc/150?img=7",
      serviceType: "Carpentry Work",
      date: "March 5, 2026",
      time: "4:00 PM",
      location: "888 EDSA, Mandaluyong",
      status: "Cancelled",
      amount: "2,000.00",
      statusColor: "#EF4444"
    }
  ]
};

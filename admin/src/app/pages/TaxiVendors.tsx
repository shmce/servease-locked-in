import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Car, Users, MapPin, DollarSign } from "lucide-react";

const stats = [
  {
    title: "Active Vendors",
    value: "234",
    change: "+15 this month",
    icon: Car,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Total Drivers",
    value: "1,567",
    change: "+89 new",
    icon: Users,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    title: "Active Rides",
    value: "234",
    change: "Live now",
    icon: MapPin,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    title: "Daily Revenue",
    value: "$21,650",
    change: "+15% today",
    icon: DollarSign,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
];

const vendors = [
  {
    id: "TX001",
    name: "City Rides",
    fleet: "156 vehicles",
    status: "active",
    drivers: 234,
    trips: 1245,
    revenue: "$21,650",
    rating: 4.6,
  },
  {
    id: "TX002",
    name: "Quick Cabs",
    fleet: "98 vehicles",
    status: "active",
    drivers: 145,
    trips: 876,
    revenue: "$15,890",
    rating: 4.5,
  },
  {
    id: "TX003",
    name: "Metro Taxi Service",
    fleet: "45 vehicles",
    status: "pending",
    drivers: 67,
    trips: 0,
    revenue: "$0",
    rating: 0,
  },
];

export function TaxiVendors() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Taxi Vendor Portal</h1>
        <p className="text-gray-500 mt-1">
          Manage taxi vendors, drivers, vehicles, and ride operations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Taxi Vendors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {vendors.map((vendor) => (
              <div
                key={vendor.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{vendor.name}</h3>
                      <Badge
                        variant={
                          vendor.status === "active"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {vendor.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{vendor.fleet}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Active Drivers</p>
                        <p className="font-medium">{vendor.drivers}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Completed Trips</p>
                        <p className="font-medium">{vendor.trips}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Revenue</p>
                        <p className="font-medium text-green-600">{vendor.revenue}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Rating</p>
                        <p className="text-yellow-600">
                          {vendor.rating > 0 ? `★ ${vendor.rating}` : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

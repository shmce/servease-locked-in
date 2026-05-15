import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Truck, Package, MapPin, Clock, Users } from "lucide-react";

const stats = [
  {
    title: "Active Deliveries",
    value: "567",
    change: "Live tracking",
    icon: Truck,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Total Drivers",
    value: "2,345",
    change: "+89 this week",
    icon: Users,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    title: "Pending Pickups",
    value: "124",
    change: "Awaiting assignment",
    icon: Package,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    title: "Avg Delivery Time",
    value: "32 min",
    change: "-5 min improved",
    icon: Clock,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
];

const activeDeliveries = [
  {
    id: "DEL-001",
    driver: "John Smith",
    order: "ORD-12345",
    module: "Grocery",
    status: "in-transit",
    pickup: "Fresh Mart 24",
    dropoff: "123 Main St",
    eta: "15 min",
  },
  {
    id: "DEL-002",
    driver: "Sarah Johnson",
    order: "ORD-12346",
    module: "Restaurant",
    status: "picked-up",
    pickup: "Gourmet Kitchen",
    dropoff: "456 Oak Ave",
    eta: "22 min",
  },
  {
    id: "DEL-003",
    driver: "Mike Wilson",
    order: "ORD-12347",
    module: "Pharmacy",
    status: "assigned",
    pickup: "HealthPlus Pharmacy",
    dropoff: "789 Pine Rd",
    eta: "35 min",
  },
  {
    id: "DEL-004",
    driver: "Emily Brown",
    order: "ORD-12348",
    module: "Marketplace",
    status: "in-transit",
    pickup: "TechStore Pro",
    dropoff: "321 Elm St",
    eta: "18 min",
  },
];

const driverPerformance = [
  {
    id: "DRV-001",
    name: "John Smith",
    vehicle: "Honda Activa - AB12CD3456",
    completedToday: 23,
    rating: 4.8,
    status: "active",
  },
  {
    id: "DRV-002",
    name: "Sarah Johnson",
    vehicle: "Hero Splendor - XY98ZW7654",
    completedToday: 19,
    rating: 4.7,
    status: "active",
  },
  {
    id: "DRV-003",
    name: "Mike Wilson",
    vehicle: "TVS Apache - LM45NO8901",
    completedToday: 21,
    rating: 4.9,
    status: "active",
  },
];

export function Logistics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Logistics & Delivery</h1>
        <p className="text-gray-500 mt-1">
          Manage drivers, vehicles, and delivery operations across all modules
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
          <CardTitle>Active Deliveries - Live Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeDeliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{delivery.driver}</h3>
                      <Badge
                        variant={
                          delivery.status === "in-transit"
                            ? "default"
                            : delivery.status === "picked-up"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {delivery.status}
                      </Badge>
                      <Badge variant="outline">{delivery.module}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500 flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          Order: {delivery.order}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Pickup: {delivery.pickup}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">
                          <MapPin className="w-3 h-3 inline" /> {delivery.dropoff}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm text-gray-500">ETA</p>
                    <p className="text-xl font-bold text-blue-600">{delivery.eta}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Performing Drivers Today</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {driverPerformance.map((driver) => (
              <div
                key={driver.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{driver.name}</h3>
                      <Badge variant="default">{driver.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{driver.vehicle}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-600">ID: {driver.id}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Completed Today</p>
                    <p className="text-2xl font-bold text-green-600">{driver.completedToday}</p>
                    <p className="text-yellow-600 mt-1">★ {driver.rating}</p>
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

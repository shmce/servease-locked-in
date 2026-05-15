import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { MapPin, Users, AlertTriangle, CheckCircle, Clock } from "lucide-react";

const liveMetrics = [
  {
    title: "Active Services",
    value: "234",
    status: "success",
    icon: Users,
  },
  {
    title: "Problem Zones",
    value: "3",
    status: "warning",
    icon: AlertTriangle,
  },
  {
    title: "Available Providers",
    value: "456",
    status: "info",
    icon: CheckCircle,
  },
  {
    title: "Avg Service Time",
    value: "28 min",
    status: "info",
    icon: Clock,
  },
];

const problemZones = [
  {
    zone: "Downtown District",
    issue: "High demand, low provider availability",
    activeBookings: 45,
    availableProviders: 8,
    severity: "high",
  },
  {
    zone: "North Suburbs",
    issue: "Service delays",
    activeBookings: 23,
    availableProviders: 12,
    severity: "medium",
  },
  {
    zone: "Industrial Area",
    issue: "Extended service times",
    activeBookings: 18,
    availableProviders: 15,
    severity: "low",
  },
];

const activeServices = [
  {
    id: "SVC-1234",
    provider: "John Smith",
    booking: "BKG-5678",
    module: "Restaurant",
    location: "123 Main St",
    status: "in-progress",
    eta: "12 min",
  },
  {
    id: "SVC-1235",
    provider: "Sarah Lee",
    booking: "BKG-5679",
    module: "Grocery",
    location: "456 Oak Ave",
    status: "confirmed",
    eta: "8 min",
  },
  {
    id: "SVC-1236",
    provider: "Mike Johnson",
    booking: "BKG-5680",
    module: "Pharmacy",
    location: "789 Pine Rd",
    status: "assigned",
    eta: "18 min",
  },
];

export function LiveOps() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Live Operations</h1>
        <p className="text-gray-500 mt-1">
          Real-time monitoring and intervention tools
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {liveMetrics.map((metric) => (
          <Card key={metric.title}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-xl ${
                    metric.status === "success"
                      ? "bg-green-50"
                      : metric.status === "warning"
                      ? "bg-amber-50"
                      : "bg-blue-50"
                  }`}
                >
                  <metric.icon
                    className={`w-6 h-6 ${
                      metric.status === "success"
                        ? "text-green-600"
                        : metric.status === "warning"
                        ? "text-amber-600"
                        : "text-blue-600"
                    }`}
                  />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                  <p className="text-sm text-gray-500">{metric.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Map Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Heat Map - Demand & Supply</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-96 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-700 mb-2">
                Live Operations Map
              </p>
              <p className="text-sm text-gray-500 max-w-md">
                Real-time visualization of active services, provider locations, and demand hotspots
                would be displayed here using a map integration (Google Maps, Mapbox, etc.)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Problem Zones */}
      <Card>
        <CardHeader>
          <CardTitle>Problem Zones - Requires Intervention</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {problemZones.map((zone, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border ${
                  zone.severity === "high"
                    ? "bg-red-50 border-red-200"
                    : zone.severity === "medium"
                    ? "bg-amber-50 border-amber-200"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-gray-900">{zone.zone}</h3>
                      <Badge
                        variant={
                          zone.severity === "high"
                            ? "destructive"
                            : zone.severity === "medium"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {zone.severity} severity
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{zone.issue}</p>
                    <div className="flex items-center gap-6 text-sm">
                      <span>
                        <strong>{zone.activeBookings}</strong> active bookings
                      </span>
                      <span>
                        <strong>{zone.availableProviders}</strong> providers available
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      View Map
                    </Button>
                    <Button size="sm">Assign Providers</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Services */}
      <Card>
        <CardHeader>
          <CardTitle>Live Services - Manual Intervention</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeServices.map((service) => (
              <div
                key={service.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {service.provider}
                      </h4>
                      <Badge
                        variant={
                          service.status === "in-progress"
                            ? "default"
                            : service.status === "confirmed"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {service.status}
                      </Badge>
                      <Badge variant="outline">{service.module}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <p className="text-gray-500">Booking</p>
                        <p className="font-medium">{service.booking}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Location</p>
                        <p className="font-medium">{service.location}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm text-gray-500 mb-2">ETA</p>
                    <p className="text-xl font-bold text-blue-600 mb-2">
                      {service.eta}
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Reassign
                      </Button>
                      <Button size="sm" variant="outline">
                        Contact
                      </Button>
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
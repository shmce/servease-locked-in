import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Pill, FileCheck, ShieldCheck, Package } from "lucide-react";

const stats = [
  {
    title: "Licensed Pharmacies",
    value: "345",
    change: "+12 this month",
    icon: ShieldCheck,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Medicine Inventory",
    value: "12,456",
    change: "+234 items",
    icon: Package,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    title: "Prescriptions Verified",
    value: "1,234",
    change: "Today",
    icon: FileCheck,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    title: "Active Orders",
    value: "89",
    change: "Live now",
    icon: Pill,
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
];

const pharmacies = [
  {
    id: "PH001",
    name: "HealthPlus Pharmacy",
    license: "PH-2024-001",
    status: "verified",
    medicines: 2345,
    orders: 198,
    revenue: "$28,100",
    compliance: "100%",
  },
  {
    id: "PH002",
    name: "MediCare Plus",
    license: "PH-2024-002",
    status: "verified",
    medicines: 1890,
    orders: 156,
    revenue: "$21,450",
    compliance: "98%",
  },
  {
    id: "PH003",
    name: "WellCare Pharmacy",
    license: "PH-2024-003",
    status: "pending",
    medicines: 1234,
    orders: 0,
    revenue: "$0",
    compliance: "N/A",
  },
];

export function PharmacySellers() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pharmacy Partners</h1>
        <p className="text-gray-500 mt-1">
          Manage pharmacy licenses, medicine listings, and prescription compliance
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
          <CardTitle>Registered Pharmacies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pharmacies.map((pharmacy) => (
              <div
                key={pharmacy.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{pharmacy.name}</h3>
                      <Badge
                        variant={
                          pharmacy.status === "verified"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {pharmacy.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">License: {pharmacy.license}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Medicine Items</p>
                        <p className="font-medium">{pharmacy.medicines}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Orders</p>
                        <p className="font-medium">{pharmacy.orders}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Revenue</p>
                        <p className="font-medium text-green-600">{pharmacy.revenue}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Compliance</p>
                        <p className="font-medium text-blue-600">{pharmacy.compliance}</p>
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

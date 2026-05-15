import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ShoppingBasket, Store, Package, TrendingUp } from "lucide-react";

const stats = [
  {
    title: "Total Stores",
    value: "856",
    change: "+45 this month",
    icon: Store,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    title: "Active Inventory",
    value: "23,456",
    change: "+1,234 items",
    icon: Package,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Daily Orders",
    value: "4,567",
    change: "+12% today",
    icon: ShoppingBasket,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    title: "Avg Delivery Time",
    value: "28 min",
    change: "-5 min improved",
    icon: TrendingUp,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
];

const stores = [
  {
    id: "GS001",
    name: "Fresh Mart 24",
    area: "Downtown",
    status: "active",
    inventory: 2345,
    orders: 234,
    revenue: "$38,920",
    deliverySlots: "24/7",
    rating: 4.7,
  },
  {
    id: "GS002",
    name: "QuickMart Express",
    area: "Suburbs",
    status: "active",
    inventory: 1890,
    orders: 198,
    revenue: "$29,450",
    deliverySlots: "6AM - 11PM",
    rating: 4.5,
  },
  {
    id: "GS003",
    name: "Organic Valley",
    area: "West District",
    status: "active",
    inventory: 1234,
    orders: 156,
    revenue: "$22,340",
    deliverySlots: "8AM - 9PM",
    rating: 4.8,
  },
];

export function GrocerySellers() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Grocery Stores</h1>
        <p className="text-gray-500 mt-1">
          Manage grocery stores, inventory, and fast delivery operations
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
          <CardTitle>Active Grocery Stores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stores.map((store) => (
              <div
                key={store.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{store.name}</h3>
                      <Badge variant="default">{store.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Area</p>
                        <p className="font-medium">{store.area}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Inventory Items</p>
                        <p className="font-medium">{store.inventory}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Today's Orders</p>
                        <p className="font-medium">{store.orders}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Revenue</p>
                        <p className="font-medium text-green-600">{store.revenue}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm text-gray-500">Delivery Slots</p>
                    <p className="font-medium">{store.deliverySlots}</p>
                    <p className="text-yellow-600 mt-1">★ {store.rating}</p>
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

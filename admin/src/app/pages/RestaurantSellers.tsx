import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Utensils, ChefHat, Clock, Star } from "lucide-react";

const stats = [
  {
    title: "Partner Restaurants",
    value: "1,234",
    change: "+67 this month",
    icon: Utensils,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    title: "Active Orders",
    value: "567",
    change: "Live now",
    icon: ChefHat,
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  {
    title: "Avg Prep Time",
    value: "32 min",
    change: "-3 min improved",
    icon: Clock,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Avg Rating",
    value: "4.6",
    change: "+0.2 this week",
    icon: Star,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
  },
];

const restaurants = [
  {
    id: "RS001",
    name: "Gourmet Kitchen",
    cuisine: "Italian, Continental",
    status: "active",
    menuItems: 89,
    orders: 145,
    revenue: "$32,450",
    rating: 4.7,
  },
  {
    id: "RS002",
    name: "Spice Paradise",
    cuisine: "Indian, Asian",
    status: "active",
    menuItems: 112,
    orders: 198,
    revenue: "$28,920",
    rating: 4.6,
  },
  {
    id: "RS003",
    name: "Burger House",
    cuisine: "Fast Food, American",
    status: "active",
    menuItems: 45,
    orders: 234,
    revenue: "$24,560",
    rating: 4.5,
  },
];

export function RestaurantSellers() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Restaurant Partners</h1>
        <p className="text-gray-500 mt-1">
          Manage restaurant onboarding, menus, and order operations
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
          <CardTitle>Restaurant Partners</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{restaurant.name}</h3>
                      <Badge variant="default">{restaurant.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{restaurant.cuisine}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Menu Items</p>
                        <p className="font-medium">{restaurant.menuItems}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Today's Orders</p>
                        <p className="font-medium">{restaurant.orders}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Revenue</p>
                        <p className="font-medium text-green-600">{restaurant.revenue}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Rating</p>
                        <p className="text-yellow-600">★ {restaurant.rating}</p>
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

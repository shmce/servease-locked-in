import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  DollarSign,
  TrendingUp,
  Download,
  Filter,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

const platformEarnings = {
  totalGMV: "₱4,567,890",
  totalCommission: "₱456,789",
  adsRevenue: "₱45,678",
  subscriptionFees: "₱12,340",
  penalties: "₱5,670",
  refundLeakage: "-₱8,234",
  netPlatformEarnings: "₱512,243",
};

const moduleBreakdown = [
  { module: "Marketplace", gmv: "₱1,234,567", commission: "₱123,457", rate: "10%" },
  { module: "Grocery", gmv: "₱987,654", commission: "₱79,012", rate: "8%" },
  { module: "Restaurant", gmv: "₱876,543", commission: "₱105,185", rate: "12%" },
  { module: "Pharmacy", gmv: "₱543,210", commission: "₱38,025", rate: "7%" },
  { module: "Hospital", gmv: "₱432,109", commission: "₱64,815", rate: "15%" },
  { module: "Healthcare", gmv: "₱493,807", commission: "₱98,761", rate: "20%" },
];

const partnerStatements = [
  {
    partner: "TechStore Pro",
    type: "Service Provider",
    module: "Marketplace",
    grossSales: "₱67,890",
    commission: "-₱6,789",
    taxes: "-₱3,394",
    refunds: "-₱1,234",
    netPayable: "₱56,473",
    status: "paid",
  },
  {
    partner: "Fresh Mart 24",
    type: "Service Provider",
    module: "Grocery",
    grossSales: "₱45,678",
    commission: "-₱3,654",
    taxes: "-₱2,284",
    refunds: "-₱890",
    netPayable: "₱38,850",
    status: "pending",
  },
  {
    partner: "North Zone Franchise",
    type: "Franchisee",
    module: "Multi-Service",
    grossSales: "₱234,567",
    commission: "-₱23,457",
    taxes: "-₱11,728",
    refunds: "-₱4,321",
    netPayable: "₱195,061",
    status: "paid",
  },
];

export function Statements() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Statements</h1>
          <p className="text-gray-500 mt-1">
            Platform earnings and partner statements
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <Tabs defaultValue="platform" className="space-y-6">
        <TabsList>
          <TabsTrigger value="platform">Platform Commission Statement</TabsTrigger>
          <TabsTrigger value="partners">Partner Statements</TabsTrigger>
        </TabsList>

        <TabsContent value="platform" className="space-y-6">
          {/* Period Selector */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Select defaultValue="jan-2026">
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jan-2026">January 2026</SelectItem>
                    <SelectItem value="dec-2025">December 2025</SelectItem>
                    <SelectItem value="nov-2025">November 2025</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="all">
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    <SelectItem value="metro-manila">Metro Manila</SelectItem>
                    <SelectItem value="cebu">Cebu</SelectItem>
                    <SelectItem value="davao">Davao</SelectItem>
                    <SelectItem value="iloilo">Iloilo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Platform Earnings Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Earnings Summary - January 2026</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between p-4 bg-blue-50 rounded-lg">
                    <span className="font-semibold text-gray-700">Total GMV</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {platformEarnings.totalGMV}
                    </span>
                  </div>
                  <div className="flex justify-between p-4 bg-green-50 rounded-lg">
                    <span className="font-semibold text-gray-700">Platform Commission</span>
                    <span className="text-2xl font-bold text-green-600">
                      {platformEarnings.totalCommission}
                    </span>
                  </div>
                  <div className="flex justify-between p-4 bg-purple-50 rounded-lg">
                    <span className="font-semibold text-gray-700">Ads Revenue</span>
                    <span className="text-2xl font-bold text-purple-600">
                      {platformEarnings.adsRevenue}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between p-4 bg-amber-50 rounded-lg">
                    <span className="font-semibold text-gray-700">Subscription Fees</span>
                    <span className="text-2xl font-bold text-amber-600">
                      {platformEarnings.subscriptionFees}
                    </span>
                  </div>
                  <div className="flex justify-between p-4 bg-orange-50 rounded-lg">
                    <span className="font-semibold text-gray-700">Penalties Collected</span>
                    <span className="text-2xl font-bold text-orange-600">
                      {platformEarnings.penalties}
                    </span>
                  </div>
                  <div className="flex justify-between p-4 bg-red-50 rounded-lg">
                    <span className="font-semibold text-gray-700">Refund Leakage</span>
                    <span className="text-2xl font-bold text-red-600">
                      {platformEarnings.refundLeakage}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 mb-1">Net Platform Earnings</p>
                    <p className="text-4xl font-bold">{platformEarnings.netPlatformEarnings}</p>
                  </div>
                  <TrendingUp className="w-16 h-16 opacity-50" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Module Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Commission by Module</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {moduleBreakdown.map((item) => (
                  <div
                    key={item.module}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-900">{item.module}</h3>
                      <Badge variant="outline">Rate: {item.rate}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Total GMV</p>
                        <p className="font-semibold text-gray-900">{item.gmv}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Commission Earned</p>
                        <p className="font-semibold text-green-600">{item.commission}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Commission Rate</p>
                        <p className="font-semibold text-blue-600">{item.rate}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="partners" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Partner Settlements - January 2026</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {partnerStatements.map((partner, idx) => (
                  <div
                    key={idx}
                    className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{partner.partner}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{partner.type}</Badge>
                          <Badge variant="secondary">{partner.module}</Badge>
                          <Badge
                            variant={partner.status === "paid" ? "default" : "secondary"}
                          >
                            {partner.status}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 mb-1">Gross Sales</p>
                        <p className="font-bold text-gray-900">{partner.grossSales}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Commission</p>
                        <p className="font-bold text-red-600">{partner.commission}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Taxes</p>
                        <p className="font-bold text-red-600">{partner.taxes}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Refunds</p>
                        <p className="font-bold text-red-600">{partner.refunds}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Net Payable</p>
                        <p className="font-bold text-green-600 text-lg">{partner.netPayable}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
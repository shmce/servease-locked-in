import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  FileText,
} from "lucide-react";
import { ApprovalDrawer } from "../components/shared/ApprovalDrawer";

const approvals = {
  kyc: [
    {
      id: "KYC-001",
      type: "Service Provider KYC",
      module: "Marketplace",
      name: "Home Essentials Store",
      submittedDate: "2026-02-06",
      priority: "high",
      documents: ["Business License", "Tax ID", "Bank Details", "Owner ID Proof"],
    },
    {
      id: "KYC-002",
      type: "Franchisee Verification",
      module: "Multi-Service",
      name: "North Zone Franchise",
      submittedDate: "2026-02-07",
      priority: "high",
      documents: ["Franchise Agreement", "Financial Statements", "Territory Proof"],
    },
    {
      id: "KYC-003",
      type: "Provider Verification",
      module: "Healthcare",
      name: "Dr. John Smith",
      submittedDate: "2026-02-05",
      priority: "medium",
      documents: ["License", "Credentials", "Background Check", "Insurance"],
    },
  ],
  promotions: [
    {
      id: "PROMO-001",
      type: "Flash Sale",
      module: "Marketplace",
      seller: "Fashion Hub",
      campaign: "Weekend Fashion Sale - 40% Off",
      discount: "40%",
      budget: "$10,000",
      duration: "2 days",
      submittedDate: "2026-02-07",
      priority: "medium",
    },
    {
      id: "PROMO-002",
      type: "Combo Offer",
      module: "Restaurant",
      seller: "Gourmet Kitchen",
      campaign: "Family Meal Deal",
      discount: "30%",
      budget: "$5,000",
      duration: "7 days",
      submittedDate: "2026-02-06",
      priority: "low",
    },
  ],
  payouts: [
    {
      id: "PAY-001",
      type: "Payout Request",
      module: "Marketplace",
      seller: "TechStore Pro",
      amount: "$45,230",
      period: "Jan 2026",
      submittedDate: "2026-02-08",
      priority: "high",
    },
    {
      id: "PAY-002",
      type: "Franchisee Settlement",
      module: "Multi-Service",
      seller: "East Region Franchise",
      amount: "$72,340",
      period: "Jan 2026",
      submittedDate: "2026-02-07",
      priority: "high",
    },
  ],
  catalog: [
    {
      id: "CAT-001",
      type: "Product Listing",
      module: "Marketplace",
      seller: "Electronics World",
      product: "Samsung Galaxy S24 Ultra",
      category: "Electronics",
      submittedDate: "2026-02-08",
      priority: "low",
    },
  ],
  disputes: [
    {
      id: "DIS-001",
      type: "Booking Dispute",
      module: "Restaurant",
      seller: "Pizza Corner",
      customer: "Jane Smith",
      orderAmount: "$45",
      issue: "Service not completed",
      submittedDate: "2026-02-08",
      priority: "high",
    },
  ],
};

const stats = [
  {
    title: "Pending Approvals",
    value: "42",
    icon: Clock,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    title: "High Priority",
    value: "12",
    icon: AlertCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  {
    title: "Approved Today",
    value: "28",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    title: "Avg Response Time",
    value: "2.3h",
    icon: Clock,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
];

export function Approvals() {
  const [activeTab, setActiveTab] = useState("kyc");
  const [selectedApproval, setSelectedApproval] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleViewApproval = (approval: any) => {
    setSelectedApproval(approval);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Approval Queue</h1>
        <p className="text-gray-500 mt-1">
          Review and process all pending approvals across modules
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Approval Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Approval Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="kyc">
                KYC Approvals ({approvals.kyc.length})
              </TabsTrigger>
              <TabsTrigger value="promotions">
                Promotions ({approvals.promotions.length})
              </TabsTrigger>
              <TabsTrigger value="payouts">
                Payouts ({approvals.payouts.length})
              </TabsTrigger>
              <TabsTrigger value="catalog">
                Catalog ({approvals.catalog.length})
              </TabsTrigger>
              <TabsTrigger value="disputes">
                Disputes ({approvals.disputes.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="kyc" className="space-y-4 mt-6">
              {approvals.kyc.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-900">{item.name}</h3>
                        <Badge
                          variant={
                            item.priority === "high"
                              ? "destructive"
                              : item.priority === "medium"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {item.priority}
                        </Badge>
                        <Badge variant="outline">{item.module}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{item.type}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>ID: {item.id}</span>
                        <span>Submitted: {item.submittedDate}</span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {item.documents.length} documents
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewApproval(item)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="promotions" className="space-y-4 mt-6">
              {approvals.promotions.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-900">{item.campaign}</h3>
                        <Badge
                          variant={
                            item.priority === "high"
                              ? "destructive"
                              : item.priority === "medium"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {item.priority}
                        </Badge>
                        <Badge variant="outline">{item.module}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {item.type} by {item.seller}
                      </p>
                      <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                        <div>
                          <span className="text-gray-500">Discount:</span>
                          <span className="ml-2 font-semibold text-green-600">{item.discount}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Budget:</span>
                          <span className="ml-2 font-semibold">{item.budget}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Duration:</span>
                          <span className="ml-2 font-semibold">{item.duration}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>ID: {item.id}</span>
                        <span>Submitted: {item.submittedDate}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewApproval(item)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="payouts" className="space-y-4 mt-6">
              {approvals.payouts.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-900">{item.seller}</h3>
                        <Badge variant="destructive">high priority</Badge>
                        <Badge variant="outline">{item.module}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{item.type} - {item.period}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>ID: {item.id}</span>
                        <span>Submitted: {item.submittedDate}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600 mb-2">{item.amount}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewApproval(item)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="catalog" className="space-y-4 mt-6">
              {approvals.catalog.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-900">{item.product}</h3>
                        <Badge variant="secondary">{item.priority}</Badge>
                        <Badge variant="outline">{item.module}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {item.type} by {item.seller} • {item.category}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>ID: {item.id}</span>
                        <span>Submitted: {item.submittedDate}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewApproval(item)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="disputes" className="space-y-4 mt-6">
              {approvals.disputes.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border border-red-200 bg-red-50 rounded-xl hover:border-red-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-900">{item.issue}</h3>
                        <Badge variant="destructive">high priority</Badge>
                        <Badge variant="outline">{item.module}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Customer: {item.customer} vs Seller: {item.seller}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>ID: {item.id}</span>
                        <span>Amount: {item.orderAmount}</span>
                        <span>Submitted: {item.submittedDate}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewApproval(item)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Approval Drawer */}
      <ApprovalDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        approval={selectedApproval}
      />
    </div>
  );
}
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Users,
  Plus,
  Calendar,
  Download,
  Edit2,
  Power,
  FileText,
  Clock,
  Mail,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { notifyBackendRequired } from "../../utils/backendRequired";

const recentReports = [
  {
    id: 1,
    name: "March 2026 Customer Growth Report",
    generatedDate: "2026-04-01T08:00:00",
    format: "PDF",
    size: "1.8 MB",
  },
  {
    id: 2,
    name: "Service Provider Activity Report",
    generatedDate: "2026-03-31T18:30:00",
    format: "Excel",
    size: "2.2 MB",
  },
  {
    id: 3,
    name: "Weekly User Engagement - Week 13",
    generatedDate: "2026-03-30T09:00:00",
    format: "PDF",
    size: "1.4 MB",
  },
  {
    id: 4,
    name: "Customer Retention Analysis",
    generatedDate: "2026-03-28T14:00:00",
    format: "Excel",
    size: "2.6 MB",
  },
  {
    id: 5,
    name: "February User Statistics",
    generatedDate: "2026-03-01T08:00:00",
    format: "PDF",
    size: "1.9 MB",
  },
];

const scheduledReportsData = [
  {
    id: 1,
    name: "Daily User Activity Summary",
    frequency: "Daily",
    recipients: "ops@servease.ph, admin@servease.ph",
    lastSent: "2026-04-01T08:00:00",
    status: "Active",
  },
  {
    id: 2,
    name: "Weekly User Growth Report",
    frequency: "Weekly",
    recipients: "admin@servease.ph",
    lastSent: "2026-03-30T09:00:00",
    status: "Active",
  },
  {
    id: 3,
    name: "Monthly User Analytics",
    frequency: "Monthly",
    recipients: "admin@servease.ph, ops@servease.ph",
    lastSent: "2026-03-01T08:00:00",
    status: "Active",
  },
];

export function UserReports() {
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const [generateForm, setGenerateForm] = useState({
    template: "",
    format: "PDF",
    dateRange: "",
  });

  const [scheduleForm, setScheduleForm] = useState({
    name: "",
    template: "",
    frequency: "",
    recipients: "",
    format: "PDF",
  });

  const handleGenerateReport = () => {
    if (!generateForm.template) {
      toast.error("Please select a report template");
      return;
    }

    notifyBackendRequired("Generating user reports", "POST /v1/admin/reports/users");
  };

  const handleScheduleReport = () => {
    if (!scheduleForm.name || !scheduleForm.template || !scheduleForm.frequency || !scheduleForm.recipients) {
      toast.error("Please fill in all required fields");
      return;
    }

    notifyBackendRequired("Scheduling user reports", "POST /v1/admin/reports/users/schedules");
  };

  const handleDownloadReport = (reportName: string) => {
    notifyBackendRequired(`Downloading ${reportName}`, "GET /v1/admin/reports/users/:id/download");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            User Reports
          </h1>
          <p className="text-gray-500 mt-1">
            Analyze customer and service provider metrics
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setIsScheduleModalOpen(true)}
            variant="outline"
            className="w-full sm:w-auto"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Report
          </Button>
          <Button
            onClick={() => setIsGenerateModalOpen(true)}
            className="bg-[#00BF63] hover:bg-[#00A055] w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Generate New Report
          </Button>
        </div>
      </div>

      {/* Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Report Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => {
                setGenerateForm({ ...generateForm, template: "daily" });
                setIsGenerateModalOpen(true);
              }}
              className="p-4 border rounded-lg hover:border-[#00BF63] hover:bg-[#DCFCE7] transition-all text-left"
            >
              <FileText className="w-8 h-8 text-[#00BF63] mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Daily Summary</h3>
              <p className="text-sm text-gray-500">
                Daily user activity metrics
              </p>
            </button>

            <button
              onClick={() => {
                setGenerateForm({ ...generateForm, template: "weekly" });
                setIsGenerateModalOpen(true);
              }}
              className="p-4 border rounded-lg hover:border-[#00BF63] hover:bg-[#DCFCE7] transition-all text-left"
            >
              <FileText className="w-8 h-8 text-[#00BF63] mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Weekly Summary</h3>
              <p className="text-sm text-gray-500">
                Weekly user engagement analysis
              </p>
            </button>

            <button
              onClick={() => {
                setGenerateForm({ ...generateForm, template: "monthly" });
                setIsGenerateModalOpen(true);
              }}
              className="p-4 border rounded-lg hover:border-[#00BF63] hover:bg-[#DCFCE7] transition-all text-left"
            >
              <FileText className="w-8 h-8 text-[#00BF63] mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Monthly Summary</h3>
              <p className="text-sm text-gray-500">
                Comprehensive monthly user report
              </p>
            </button>

            <button
              onClick={() => {
                setGenerateForm({ ...generateForm, template: "custom" });
                setIsGenerateModalOpen(true);
              }}
              className="p-4 border rounded-lg hover:border-[#00BF63] hover:bg-[#DCFCE7] transition-all text-left"
            >
              <Plus className="w-8 h-8 text-[#00BF63] mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Custom Report</h3>
              <p className="text-sm text-gray-500">
                Build custom user report
              </p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Name</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Last Sent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scheduledReportsData.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell className="font-medium text-gray-900">
                      {schedule.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        <Clock className="w-3 h-3 mr-1" />
                        {schedule.frequency}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Mail className="w-3 h-3" />
                        {schedule.recipients.split(",").length} recipient(s)
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(schedule.lastSent).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {schedule.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline">
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600">
                          <Power className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Name</TableHead>
                  <TableHead>Generated Date</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        {report.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(report.generatedDate).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-gray-50">
                        {report.format}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {report.size}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => handleDownloadReport(report.name)}
                        className="bg-[#00BF63] hover:bg-[#00A055]"
                      >
                        <Download className="w-3 h-3 mr-2" />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Generate Report Modal */}
      <Dialog open={isGenerateModalOpen} onOpenChange={setIsGenerateModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Generate User Report</DialogTitle>
            <DialogDescription>
              Select report template and parameters
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Report Template *</Label>
              <Select
                value={generateForm.template}
                onValueChange={(value) =>
                  setGenerateForm({ ...generateForm, template: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily Summary</SelectItem>
                  <SelectItem value="weekly">Weekly Summary</SelectItem>
                  <SelectItem value="monthly">Monthly Summary</SelectItem>
                  <SelectItem value="custom">Custom Report Builder</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Format</Label>
              <Select
                value={generateForm.format}
                onValueChange={(value) =>
                  setGenerateForm({ ...generateForm, format: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="Excel">Excel</SelectItem>
                  <SelectItem value="CSV">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select
                value={generateForm.dateRange}
                onValueChange={(value) =>
                  setGenerateForm({ ...generateForm, dateRange: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="last7days">Last 7 Days</SelectItem>
                  <SelectItem value="last30days">Last 30 Days</SelectItem>
                  <SelectItem value="thismonth">This Month</SelectItem>
                  <SelectItem value="lastmonth">Last Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsGenerateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerateReport}
              className="bg-[#00BF63] hover:bg-[#00A055]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Report Modal */}
      <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule User Report</DialogTitle>
            <DialogDescription>
              Set up automatic report generation and delivery
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Report Name *</Label>
              <Input
                placeholder="e.g., Daily User Activity Summary"
                value={scheduleForm.name}
                onChange={(e) =>
                  setScheduleForm({ ...scheduleForm, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Template *</Label>
              <Select
                value={scheduleForm.template}
                onValueChange={(value) =>
                  setScheduleForm({ ...scheduleForm, template: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily Summary</SelectItem>
                  <SelectItem value="weekly">Weekly Summary</SelectItem>
                  <SelectItem value="monthly">Monthly Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Frequency *</Label>
              <Select
                value={scheduleForm.frequency}
                onValueChange={(value) =>
                  setScheduleForm({ ...scheduleForm, frequency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Daily">Daily</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Recipients (Email Addresses) *</Label>
              <Input
                placeholder="email1@servease.ph, email2@servease.ph"
                value={scheduleForm.recipients}
                onChange={(e) =>
                  setScheduleForm({ ...scheduleForm, recipients: e.target.value })
                }
              />
              <p className="text-xs text-gray-500">
                Separate multiple emails with commas
              </p>
            </div>

            <div className="space-y-2">
              <Label>Format</Label>
              <Select
                value={scheduleForm.format}
                onValueChange={(value) =>
                  setScheduleForm({ ...scheduleForm, format: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="Excel">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsScheduleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleScheduleReport}
              className="bg-[#00BF63] hover:bg-[#00A055]"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

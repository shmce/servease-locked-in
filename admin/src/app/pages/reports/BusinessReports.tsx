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
  Briefcase,
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

// Mock data for recent reports
const recentReports = [
  {
    id: 1,
    name: "March Business Overview",
    generatedDate: "2026-04-01T08:00:00",
    format: "PDF",
    size: "2.4 MB",
  },
  {
    id: 2,
    name: "Q1 2026 Business Summary",
    generatedDate: "2026-03-31T18:30:00",
    format: "Excel",
    size: "1.8 MB",
  },
  {
    id: 3,
    name: "Weekly Business Report - Week 13",
    generatedDate: "2026-03-30T09:00:00",
    format: "PDF",
    size: "1.2 MB",
  },
  {
    id: 4,
    name: "Service Provider Growth Analysis",
    generatedDate: "2026-03-28T14:00:00",
    format: "PDF",
    size: "3.1 MB",
  },
  {
    id: 5,
    name: "February Business Overview",
    generatedDate: "2026-03-01T08:00:00",
    format: "Excel",
    size: "2.6 MB",
  },
];

// Mock data for scheduled reports
const scheduledReportsData = [
  {
    id: 1,
    name: "Daily Business Summary",
    frequency: "Daily",
    recipients: "admin@servease.ph, manager@servease.ph",
    lastSent: "2026-04-01T08:00:00",
    status: "Active",
  },
  {
    id: 2,
    name: "Weekly Business Overview",
    frequency: "Weekly",
    recipients: "admin@servease.ph",
    lastSent: "2026-03-30T09:00:00",
    status: "Active",
  },
  {
    id: 3,
    name: "Monthly Business Report",
    frequency: "Monthly",
    recipients: "admin@servease.ph, finance@servease.ph, ops@servease.ph",
    lastSent: "2026-03-01T08:00:00",
    status: "Active",
  },
];

export function BusinessReports({ hideHeader = false }: { hideHeader?: boolean }) {
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [, setIsEditScheduleOpen] = useState(false);
  const [, setSelectedSchedule] = useState<any>(null);

  // Generate report form
  const [generateForm, setGenerateForm] = useState({
    template: "",
    format: "PDF",
    dateRange: "",
  });

  // Schedule report form
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

    notifyBackendRequired("Generating business reports", "POST /v1/admin/reports/business");
  };

  const handleScheduleReport = () => {
    if (!scheduleForm.name || !scheduleForm.template || !scheduleForm.frequency || !scheduleForm.recipients) {
      toast.error("Please fill in all required fields");
      return;
    }

    notifyBackendRequired(
      "Scheduling business reports",
      "POST /v1/admin/reports/business/schedules",
    );
  };

  const handleEditSchedule = (schedule: any) => {
    setSelectedSchedule(schedule);
    setIsEditScheduleOpen(true);
  };

  const handleToggleSchedule = (scheduleId: number, currentStatus: string) => {
    notifyBackendRequired(
      "Changing report schedules",
      "PATCH /v1/admin/reports/business/schedules/:id/status",
    );
  };

  const handleDownloadReport = (reportName: string) => {
    notifyBackendRequired(
      `Downloading ${reportName}`,
      "GET /v1/admin/reports/business/:id/download",
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      {!hideHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Business Reports
            </h1>
            <p className="text-gray-500 mt-1">
              Generate and schedule comprehensive business reports
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
      )}

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
              className="p-4 border rounded-lg hover:border-[#00BF63] hover:bg-[#DCFCE7] transition-all text-left group"
            >
              <FileText className="w-8 h-8 text-[#00BF63] mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Daily Summary</h3>
              <p className="text-sm text-gray-500">
                Daily business metrics and KPIs
              </p>
            </button>

            <button
              onClick={() => {
                setGenerateForm({ ...generateForm, template: "weekly" });
                setIsGenerateModalOpen(true);
              }}
              className="p-4 border rounded-lg hover:border-[#00BF63] hover:bg-[#DCFCE7] transition-all text-left group"
            >
              <FileText className="w-8 h-8 text-[#00BF63] mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Weekly Summary</h3>
              <p className="text-sm text-gray-500">
                Week-over-week performance analysis
              </p>
            </button>

            <button
              onClick={() => {
                setGenerateForm({ ...generateForm, template: "monthly" });
                setIsGenerateModalOpen(true);
              }}
              className="p-4 border rounded-lg hover:border-[#00BF63] hover:bg-[#DCFCE7] transition-all text-left group"
            >
              <FileText className="w-8 h-8 text-[#00BF63] mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Monthly Summary</h3>
              <p className="text-sm text-gray-500">
                Comprehensive monthly overview
              </p>
            </button>

            <button
              onClick={() => {
                setGenerateForm({ ...generateForm, template: "custom" });
                setIsGenerateModalOpen(true);
              }}
              className="p-4 border rounded-lg hover:border-[#00BF63] hover:bg-[#DCFCE7] transition-all text-left group"
            >
              <Plus className="w-8 h-8 text-[#00BF63] mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Custom Report</h3>
              <p className="text-sm text-gray-500">
                Build your own custom report
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
                      <Badge
                        className={
                          schedule.status === "Active"
                            ? "bg-green-100 text-green-700 border-green-200"
                            : "bg-gray-100 text-gray-700 border-gray-200"
                        }
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {schedule.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditSchedule(schedule)}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleSchedule(schedule.id, schedule.status)}
                          className={
                            schedule.status === "Active"
                              ? "text-red-600 hover:text-red-700"
                              : "text-green-600 hover:text-green-700"
                          }
                        >
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
            <DialogTitle>Generate New Report</DialogTitle>
            <DialogDescription>
              Select report template and parameters
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template">Report Template *</Label>
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
              <Label htmlFor="format">Format</Label>
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
              <Label htmlFor="dateRange">Date Range</Label>
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
            <DialogTitle>Schedule Report</DialogTitle>
            <DialogDescription>
              Set up automatic report generation and delivery
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="scheduleName">Report Name *</Label>
              <Input
                id="scheduleName"
                placeholder="e.g., Daily Business Summary"
                value={scheduleForm.name}
                onChange={(e) =>
                  setScheduleForm({ ...scheduleForm, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduleTemplate">Template *</Label>
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
              <Label htmlFor="frequency">Frequency *</Label>
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
              <Label htmlFor="recipients">Recipients (Email Addresses) *</Label>
              <Input
                id="recipients"
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
              <Label htmlFor="scheduleFormat">Format</Label>
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

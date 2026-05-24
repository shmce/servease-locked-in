import { useEffect, useState } from "react";
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
  FileText,
  Clock,
  Mail,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  type ScheduledAdminReport,
  exportAdminBookingsCsv,
  exportAdminReportPdf,
  generateAdminReport,
  listAdminReportSchedules,
  scheduleAdminReport,
} from "../../../services/serveaseAdminApi";
import { useAuth } from "../../contexts/AuthContext";

interface ScheduledReportRow {
  id: string;
  name: string;
  frequency: string;
  recipients: string;
  runAt: string;
  format: string;
  lastDeliveredAt: string | null;
  deliveryCount: number;
  status: "Active" | "Scheduled" | "Paused";
}

function reportScheduleFromGateway(
  schedule: ScheduledAdminReport,
): ScheduledReportRow {
  return {
    id: schedule.id,
    name: schedule.name,
    frequency:
      schedule.frequency.charAt(0).toUpperCase() + schedule.frequency.slice(1),
    recipients: schedule.recipients.join(", "),
    runAt: schedule.nextRunAt,
    format: schedule.format.toUpperCase(),
    lastDeliveredAt: schedule.lastDeliveredAt,
    deliveryCount: schedule.deliveryCount,
    status: "Scheduled",
  };
}

export function BusinessReports({ hideHeader = false }: { hideHeader?: boolean }) {
  const { accessToken } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReportRow[]>([]);

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

  useEffect(() => {
    if (!accessToken) {
      setScheduledReports([]);
      return;
    }

    let isMounted = true;
    listAdminReportSchedules(accessToken, "bookings")
      .then((schedules) => {
        if (isMounted) {
          setScheduledReports(schedules.map(reportScheduleFromGateway));
        }
      })
      .catch(() => {
        if (isMounted) {
          toast.error("Unable to load scheduled business reports.");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [accessToken]);

  const downloadCsv = async (filename: string) => {
    if (!accessToken) {
      toast.error("Sign in to export business reports.");
      return;
    }
    setIsExporting(true);
    try {
      const csv = await exportAdminBookingsCsv(accessToken);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("Business report exported.");
      setIsGenerateModalOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to export business report.",
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!generateForm.template) {
      toast.error("Please select a report template");
      return;
    }
    if (!accessToken) {
      toast.error("Sign in to generate business reports.");
      return;
    }

    const format = generateForm.format === "PDF" ? "pdf" : "csv";
    setIsExporting(true);
    try {
      const report = await generateAdminReport(accessToken, "bookings", {
        format,
        dateRange: generateForm.dateRange || null,
      });
      if (format === "pdf") {
        const pdf = await exportAdminReportPdf(accessToken, "bookings");
        const url = URL.createObjectURL(pdf);
        const link = document.createElement("a");
        link.href = url;
        link.download = report.fileName.replace("bookings", "business");
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      } else {
        await downloadCsv(report.fileName.replace("bookings", "business"));
      }
      toast.success("Business report generated.");
      setIsGenerateModalOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to generate business report.",
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleScheduleReport = async () => {
    if (!scheduleForm.name || !scheduleForm.template || !scheduleForm.frequency || !scheduleForm.recipients) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!accessToken) {
      toast.error("Sign in to schedule business reports.");
      return;
    }

    try {
      const schedule = await scheduleAdminReport(accessToken, "bookings", {
        name: scheduleForm.name,
        frequency: scheduleForm.frequency as "daily" | "weekly" | "monthly",
        recipients: scheduleForm.recipients.split(",").map((item) => item.trim()).filter(Boolean),
        format: scheduleForm.format === "PDF" ? "pdf" : "csv",
      });
      setScheduledReports((current) => [
        reportScheduleFromGateway(schedule),
        ...current,
      ]);
      toast.success(`Business report scheduled for ${new Date(schedule.nextRunAt).toLocaleDateString()}.`);
      setIsScheduleModalOpen(false);
      setScheduleForm({
        name: "",
        template: "",
        frequency: "",
        recipients: "",
        format: "PDF",
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to schedule business report.",
      );
    }
  };

  const handleDownloadReport = (reportName: string) => {
    void downloadCsv(
      `${reportName.toLowerCase().replace(/\s+/g, "-")}-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`,
    );
  };

  const recentReports = scheduledReports
    .filter((report) => report.lastDeliveredAt)
    .sort(
      (a, b) =>
        new Date(b.lastDeliveredAt ?? 0).getTime() -
        new Date(a.lastDeliveredAt ?? 0).getTime(),
    );

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
                  <TableHead>Next / Last Run</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scheduledReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-sm text-gray-500">
                      No scheduled business reports found
                    </TableCell>
                  </TableRow>
                ) : (
                  scheduledReports.map((schedule) => (
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
                        {new Date(schedule.runAt).toLocaleString("en-US", {
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
                    </TableRow>
                  ))
                )}
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
                {recentReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-sm text-gray-500">
                      No delivered business reports found
                    </TableCell>
                  </TableRow>
                ) : (
                  recentReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          {report.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(report.lastDeliveredAt ?? "").toLocaleString("en-US", {
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
                        {report.deliveryCount} delivery
                        {report.deliveryCount === 1 ? "" : "ies"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => handleDownloadReport(report.name)}
                          disabled={isExporting}
                          className="bg-[#00BF63] hover:bg-[#00A055]"
                        >
                          <Download className="w-3 h-3 mr-2" />
                          {isExporting ? "Downloading..." : "Download Latest"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
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
              onClick={() => void handleGenerateReport()}
              disabled={isExporting}
              className="bg-[#00BF63] hover:bg-[#00A055]"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isExporting ? "Generating..." : "Generate Report"}
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
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
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
                  <SelectItem value="CSV">CSV</SelectItem>
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
              onClick={() => void handleScheduleReport()}
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

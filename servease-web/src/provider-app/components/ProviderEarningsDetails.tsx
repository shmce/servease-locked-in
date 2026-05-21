import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router";
import {
  DollarSign,
  Clock,
  CheckCircle,
  CreditCard,
  Download,
  FileText,
  ChevronLeft,
  Calendar,
  Filter,
  Eye,
  ChevronDown,
} from "lucide-react";
import {
  getStoredProviderAccessToken,
  listProviderPayments,
  type PaymentSummary,
} from "../../services/serveaseProviderApi";
import { pickQueryItemId } from "../utils/providerDeeplinks";

// Styles object for reusability
const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(to bottom right, #F9FAFB, rgba(16, 185, 129, 0.05))",
    padding: "32px",
  },
  maxWidthContainer: {
    maxWidth: "1280px",
    margin: "0 auto",
  },
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    color: "#6B7280",
    fontSize: "14px",
    fontWeight: "600",
    textDecoration: "none",
    marginBottom: "24px",
    transition: "color 0.3s ease",
  },
  pageHeader: {
    marginBottom: "40px",
  },
  pageTitle: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#111827",
    marginBottom: "12px",
    letterSpacing: "-0.025em",
  },
  pageSubtitle: {
    fontSize: "16px",
    color: "#6B7280",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: "1px solid #F3F4F6",
    padding: "24px",
    transition: "box-shadow 0.3s ease",
  },
  summaryCard: {
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: "1px solid #F3F4F6",
    padding: "20px",
    transition: "all 0.3s ease",
  },
  iconContainer: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "12px",
  },
  label: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    marginBottom: "8px",
  },
  value: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#111827",
  },
  filterSection: {
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: "1px solid #F3F4F6",
    padding: "24px",
    marginBottom: "32px",
  },
  filterLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "8px",
    display: "block",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "2px solid #E5E7EB",
    fontSize: "14px",
    color: "#374151",
    transition: "border-color 0.3s ease",
    outline: "none",
  },
  select: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "2px solid #E5E7EB",
    fontSize: "14px",
    color: "#374151",
    transition: "border-color 0.3s ease",
    outline: "none",
    cursor: "pointer",
    backgroundColor: "white",
  },
  button: {
    padding: "12px 20px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.3s ease",
    border: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  primaryButton: {
    backgroundColor: "#00BF63",
    color: "white",
    boxShadow: "0 4px 16px rgba(0, 191, 99, 0.25)",
  },
  secondaryButton: {
    backgroundColor: "white",
    color: "#374151",
    border: "2px solid #E5E7EB",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
  },
  tableHeader: {
    backgroundColor: "#F9FAFB",
    position: "sticky" as const,
    top: 0,
    zIndex: 10,
  },
  tableHeaderCell: {
    padding: "16px",
    fontSize: "12px",
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    textAlign: "left" as const,
    borderBottom: "2px solid #E5E7EB",
  },
  tableCell: {
    padding: "16px",
    fontSize: "14px",
    color: "#374151",
    borderBottom: "1px solid #F3F4F6",
  },
  tableRow: {
    transition: "background-color 0.2s ease",
  },
  statusBadge: {
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
    display: "inline-block",
  },
  viewLink: {
    color: "#00BF63",
    fontSize: "13px",
    fontWeight: "600",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    transition: "color 0.3s ease",
  },
};

interface Transaction {
  id: string;
  date: string;
  dateValue: string;
  bookingRef: string;
  customerName: string;
  serviceType: string;
  amountCharged: number;
  platformFee: number;
  tips: number;
  netEarnings: number;
  status: "completed" | "pending" | "processing";
}

const csvHeaders = [
  "Date",
  "Booking Ref",
  "Customer",
  "Service Type",
  "Amount Charged",
  "Platform Fee",
  "Tips",
  "Net Earnings",
  "Status",
];

function escapeCsvCell(value: string | number): string {
  const text = String(value);

  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

function escapeHtml(value: string | number): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildCsv(transactions: Transaction[]): string {
  return [
    csvHeaders.join(","),
    ...transactions.map((transaction) =>
      [
        transaction.date,
        transaction.bookingRef,
        transaction.customerName,
        transaction.serviceType,
        transaction.amountCharged,
        transaction.platformFee,
        transaction.tips,
        transaction.netEarnings,
        transaction.status,
      ]
        .map(escapeCsvCell)
        .join(","),
    ),
  ].join("\n");
}

function toTransaction(payment: PaymentSummary): Transaction {
  const date = new Date(payment.paidAt || payment.createdAt || "");
  const dateValue = Number.isNaN(date.getTime())
    ? ""
    : date.toISOString().slice(0, 10);
  const status =
    payment.status === "paid"
      ? "completed"
      : payment.status === "pending"
        ? "pending"
        : "processing";

  return {
    id: payment.id,
    dateValue,
    date: Number.isNaN(date.getTime())
      ? "-"
      : date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
    bookingRef: payment.bookingId,
    customerName: payment.customerId || "ServEase Customer",
    serviceType: "Service Booking",
    amountCharged: payment.amount,
    platformFee: payment.platformFee,
    tips: 0,
    netEarnings: payment.providerPayout,
    status,
  };
}

export function ProviderEarningsDetails() {
  const location = useLocation();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [serviceCategory, setServiceCategory] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [liveTransactions, setLiveTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadPayments = async () => {
      const token = getStoredProviderAccessToken();

      if (!token) {
        setLoadError("Sign in to load transactions from the backend.");
        return;
      }

      setIsLoading(true);
      setLoadError(null);

      try {
        const payments = await listProviderPayments(token);
        setLiveTransactions(payments.map(toTransaction));
      } catch (error) {
        setLoadError(
          error instanceof Error ? error.message : "Unable to load transactions.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadPayments();
  }, []);

  const transactions = liveTransactions;
  const highlightedPaymentId = pickQueryItemId(
    location.search,
    "paymentId",
    transactions.map((transaction) => transaction.id),
  );
  const filteredTransactions = useMemo(
    () =>
      transactions.filter((transaction) => {
        if (dateFrom && transaction.dateValue && transaction.dateValue < dateFrom) {
          return false;
        }

        if (dateTo && transaction.dateValue && transaction.dateValue > dateTo) {
          return false;
        }

        if (paymentStatus !== "all" && transaction.status !== paymentStatus) {
          return false;
        }

        if (serviceCategory !== "all") {
          const normalized = transaction.serviceType.toLowerCase().replace(/\s+/g, "-");
          if (!normalized.includes(serviceCategory)) {
            return false;
          }
        }

        return true;
      }),
    [dateFrom, dateTo, paymentStatus, serviceCategory, transactions],
  );

  const totalEarnings = transactions.reduce(
    (sum, transaction) => sum + transaction.netEarnings,
    0,
  );
  const pendingEarnings = transactions
    .filter((transaction) => transaction.status === "pending")
    .reduce((sum, transaction) => sum + transaction.netEarnings, 0);
  const inProcessing = transactions
    .filter((transaction) => transaction.status === "processing")
    .reduce((sum, transaction) => sum + transaction.netEarnings, 0);
  const paidOut = transactions
    .filter((transaction) => transaction.status === "completed")
    .reduce((sum, transaction) => sum + transaction.netEarnings, 0);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "completed":
        return {
          backgroundColor: "#D1FAE5",
          color: "#059669",
        };
      case "pending":
        return {
          backgroundColor: "#FEF3C7",
          color: "#D97706",
        };
      case "processing":
        return {
          backgroundColor: "#DBEAFE",
          color: "#2563EB",
        };
      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
        };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Paid Out";
      case "pending":
        return "Pending";
      case "processing":
        return "Processing";
      default:
        return status;
    }
  };

  const exportCsv = () => {
    const blob = new Blob([buildCsv(filteredTransactions)], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `servease-earnings-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setIsExportDropdownOpen(false);
  };

  const exportPrintableReport = () => {
    const rows = filteredTransactions
      .map(
        (transaction) => `
          <tr>
            <td>${escapeHtml(transaction.date)}</td>
            <td>${escapeHtml(transaction.bookingRef)}</td>
            <td>${escapeHtml(transaction.customerName)}</td>
            <td>${escapeHtml(transaction.serviceType)}</td>
            <td>PHP ${escapeHtml(transaction.amountCharged)}</td>
            <td>PHP ${escapeHtml(transaction.platformFee)}</td>
            <td>PHP ${escapeHtml(transaction.tips)}</td>
            <td>PHP ${escapeHtml(transaction.netEarnings)}</td>
            <td>${escapeHtml(getStatusLabel(transaction.status))}</td>
          </tr>
        `,
      )
      .join("");
    const report = window.open("", "_blank", "noopener,noreferrer,width=1024,height=768");

    if (!report) {
      window.print();
      setIsExportDropdownOpen(false);
      return;
    }

    report.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>ServEase Earnings Report</title>
          <style>
            body { font-family: Arial, sans-serif; color: #111827; padding: 24px; }
            h1 { margin-bottom: 4px; }
            p { color: #4B5563; margin-top: 0; }
            table { border-collapse: collapse; width: 100%; margin-top: 24px; }
            th, td { border: 1px solid #E5E7EB; font-size: 12px; padding: 8px; text-align: left; }
            th { background: #F9FAFB; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <h1>ServEase Earnings Report</h1>
          <p>${escapeHtml(filteredTransactions.length)} filtered transactions</p>
          <table>
            <thead>
              <tr>${csvHeaders.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr>
            </thead>
            <tbody>${rows || '<tr><td colspan="9">No transactions found.</td></tr>'}</tbody>
          </table>
          <script>window.print();</script>
        </body>
      </html>
    `);
    report.document.close();
    setIsExportDropdownOpen(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.maxWidthContainer}>
        {/* Back Link */}
        <Link
          to="/provider/earningsdashboard"
          style={styles.backLink}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#00BF63";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#6B7280";
          }}
        >
          <ChevronLeft style={{ width: "16px", height: "16px" }} />
          <span>Back to Dashboard</span>
        </Link>

        {/* Page Header */}
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>Earnings Details</h1>
          <p style={styles.pageSubtitle}>
            View detailed breakdown of all your transactions and earnings
          </p>
          {loadError && (
            <p style={{ color: "#B91C1C", fontSize: "14px", marginTop: "12px" }}>
              {loadError}
            </p>
          )}
          {isLoading && (
            <p style={{ color: "#6B7280", fontSize: "14px", marginTop: "12px" }}>
              Loading live transactions...
            </p>
          )}
        </div>

        {/* Top Section: Earnings Summary */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "24px",
            marginBottom: "32px",
          }}
        >
          {/* Total Earnings */}
          <div style={styles.summaryCard}>
            <div
              style={{ ...styles.iconContainer, backgroundColor: "#D1FAE5" }}
            >
              <DollarSign
                style={{ width: "24px", height: "24px", color: "#00BF63" }}
              />
            </div>
            <p style={styles.label}>Total Earnings</p>
            <p style={styles.value}>₱{totalEarnings.toLocaleString()}</p>
          </div>

          {/* Pending */}
          <div style={styles.summaryCard}>
            <div
              style={{ ...styles.iconContainer, backgroundColor: "#FEF3C7" }}
            >
              <Clock
                style={{ width: "24px", height: "24px", color: "#F59E0B" }}
              />
            </div>
            <p style={styles.label}>Pending</p>
            <p style={styles.value}>₱{pendingEarnings.toLocaleString()}</p>
          </div>

          {/* Processing */}
          <div style={styles.summaryCard}>
            <div
              style={{ ...styles.iconContainer, backgroundColor: "#DBEAFE" }}
            >
              <CreditCard
                style={{ width: "24px", height: "24px", color: "#3B82F6" }}
              />
            </div>
            <p style={styles.label}>Processing</p>
            <p style={styles.value}>₱{inProcessing.toLocaleString()}</p>
          </div>

          {/* Paid Out */}
          <div style={styles.summaryCard}>
            <div
              style={{ ...styles.iconContainer, backgroundColor: "#D1FAE5" }}
            >
              <CheckCircle
                style={{ width: "24px", height: "24px", color: "#00BF63" }}
              />
            </div>
            <p style={styles.label}>Paid Out</p>
            <p style={styles.value}>₱{paidOut.toLocaleString()}</p>
          </div>
        </div>

        {/* Middle Section: Filters */}
        <div style={styles.filterSection}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "24px",
            }}
          >
            <Filter style={{ width: "20px", height: "20px", color: "#00BF63" }} />
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                color: "#111827",
                margin: 0,
              }}
            >
              Filter Transactions
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr auto",
              gap: "16px",
              alignItems: "end",
            }}
          >
            {/* Date From */}
            <div>
              <label style={styles.filterLabel}>Date From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                style={styles.input}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#00BF63";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#E5E7EB";
                }}
              />
            </div>

            {/* Date To */}
            <div>
              <label style={styles.filterLabel}>Date To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                style={styles.input}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#00BF63";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#E5E7EB";
                }}
              />
            </div>

            {/* Service Category */}
            <div>
              <label style={styles.filterLabel}>Service Category</label>
              <select
                value={serviceCategory}
                onChange={(e) => setServiceCategory(e.target.value)}
                style={styles.select}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#00BF63";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#E5E7EB";
                }}
              >
                <option value="all">All Services</option>
                <option value="house-cleaning">House Cleaning</option>
                <option value="plumbing">Plumbing</option>
                <option value="electrical">Electrical</option>
                <option value="aircon">Aircon Services</option>
              </select>
            </div>

            {/* Payment Status */}
            <div>
              <label style={styles.filterLabel}>Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                style={styles.select}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#00BF63";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#E5E7EB";
                }}
              >
                <option value="all">All Statuses</option>
                <option value="completed">Paid Out</option>
                <option value="processing">Processing</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            {/* Export Button */}
            <div style={{ position: "relative" }}>
              <button
                style={{ ...styles.button, ...styles.primaryButton }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#059669";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#00BF63";
                }}
                onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
              >
                <Download style={{ width: "18px", height: "18px" }} />
                <span>Export</span>
                <ChevronDown
                  style={{
                    width: "16px",
                    height: "16px",
                    marginLeft: "4px",
                    transition: "transform 0.3s ease",
                    transform: isExportDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>
              {isExportDropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: "0",
                    top: "calc(100% + 8px)",
                    backgroundColor: "white",
                    borderRadius: "12px",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
                    border: "1px solid #E5E7EB",
                    zIndex: 1000,
                    minWidth: "200px",
                    overflow: "hidden",
                  }}
                >
                  <button
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "background-color 0.2s ease",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      backgroundColor: "white",
                      color: "#374151",
                      textAlign: "left" as const,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#F9FAFB";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "white";
                    }}
                    onClick={exportCsv}
                  >
                    <FileText style={{ width: "16px", height: "16px", color: "#00BF63" }} />
                    <span>Export as CSV</span>
                  </button>
                  <button
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "background-color 0.2s ease",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      backgroundColor: "white",
                      color: "#374151",
                      textAlign: "left" as const,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#F9FAFB";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "white";
                    }}
                    onClick={exportPrintableReport}
                  >
                    <FileText style={{ width: "16px", height: "16px", color: "#DC2626" }} />
                    <span>Export as PDF</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section: Transaction List */}
        <div style={styles.card}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "24px",
            }}
          >
            <FileText style={{ width: "20px", height: "20px", color: "#00BF63" }} />
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                color: "#111827",
                margin: 0,
              }}
            >
              Transaction History
            </h2>
            <span
              style={{
                marginLeft: "auto",
                fontSize: "14px",
                color: "#6B7280",
                fontWeight: "600",
              }}
            >
              {filteredTransactions.length} transactions
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead style={styles.tableHeader}>
                <tr>
                  <th style={styles.tableHeaderCell}>Date</th>
                  <th style={styles.tableHeaderCell}>Booking Ref</th>
                  <th style={styles.tableHeaderCell}>Customer</th>
                  <th style={styles.tableHeaderCell}>Service Type</th>
                  <th style={styles.tableHeaderCell}>Amount Charged</th>
                  <th style={styles.tableHeaderCell}>Platform Fee</th>
                  <th style={styles.tableHeaderCell}>Tips</th>
                  <th
                    style={{
                      ...styles.tableHeaderCell,
                      color: "#00BF63",
                      fontWeight: "800",
                    }}
                  >
                    Net Earnings
                  </th>
                  <th style={styles.tableHeaderCell}>Status</th>
                  <th style={styles.tableHeaderCell}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction, index) => {
                  const isHighlighted = highlightedPaymentId === transaction.id;
                  const rowBackground = isHighlighted
                    ? "#F0FDF4"
                    : index % 2 === 0 ? "white" : "#FAFAFA";

                  return (
                  <tr
                    key={transaction.id}
                    data-provider-payment-id={transaction.id}
                    style={{
                      ...styles.tableRow,
                      backgroundColor: rowBackground,
                      boxShadow: isHighlighted ? "inset 4px 0 0 #00BF63" : undefined,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#F9FAFB";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = rowBackground;
                    }}
                  >
                    <td style={styles.tableCell}>
                      <span style={{ fontWeight: "600" }}>{transaction.date}</span>
                    </td>
                    <td style={styles.tableCell}>
                      <span style={{ fontFamily: "monospace", fontSize: "13px" }}>
                        {transaction.bookingRef}
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      <span style={{ fontWeight: "600" }}>{transaction.customerName}</span>
                    </td>
                    <td style={styles.tableCell}>{transaction.serviceType}</td>
                    <td style={styles.tableCell}>
                      ₱{transaction.amountCharged.toLocaleString()}
                    </td>
                    <td style={styles.tableCell}>
                      <span style={{ color: "#9CA3AF" }}>
                        -₱{transaction.platformFee.toLocaleString()}
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      {transaction.tips > 0 ? (
                        <span style={{ color: "#00BF63", fontWeight: "600" }}>
                          +₱{transaction.tips.toLocaleString()}
                        </span>
                      ) : (
                        <span style={{ color: "#9CA3AF" }}>-</span>
                      )}
                    </td>
                    <td style={styles.tableCell}>
                      <span
                        style={{
                          color: "#00BF63",
                          fontWeight: "700",
                          fontSize: "15px",
                        }}
                      >
                        ₱{transaction.netEarnings.toLocaleString()}
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      <span
                        style={{
                          ...styles.statusBadge,
                          ...getStatusStyle(transaction.status),
                        }}
                      >
                        {getStatusLabel(transaction.status)}
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      <Link
                        to={`/provider/booking-details/${encodeURIComponent(transaction.bookingRef)}`}
                        style={styles.viewLink}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "#059669";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "#00BF63";
                        }}
                      >
                        <Eye style={{ width: "14px", height: "14px" }} />
                        <span>View</span>
                      </Link>
                    </td>
                  </tr>
                  );
                })}
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      style={{
                        ...styles.tableCell,
                        color: "#6B7280",
                        padding: "32px",
                        textAlign: "center",
                      }}
                    >
                      No backend transactions found for this filter.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

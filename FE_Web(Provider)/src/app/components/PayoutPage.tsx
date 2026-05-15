import { useEffect, useState } from "react";
import { Wallet, Calendar, ChevronRight, ExternalLink, Clock, X, Search, TrendingUp, CheckCircle, AlertCircle, Plus, Building2, Smartphone } from "lucide-react";
import { useNavigate } from "react-router";
import {
  getStoredProviderAccessToken,
  listProviderPayments,
  type PaymentSummary,
} from "../../services/serveaseProviderApi";

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(to bottom right, #F9FAFB, rgba(16, 185, 129, 0.05))",
    padding: "32px",
  },
  maxWidthContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  pageHeader: {
    marginBottom: "32px",
  },
  pageTitle: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#111827",
    marginBottom: "12px",
    letterSpacing: "-0.025em",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: "1px solid #F3F4F6",
    padding: "32px",
    marginBottom: "24px",
  },
  button: {
    padding: "12px 24px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
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
    color: "#6B7280",
    border: "1px solid #E5E7EB",
  },
};

interface Transaction {
  id: string;
  date: string;
  amount: number;
  status: "completed" | "pending" | "processing";
  method: string;
  reference: string;
}

function toPayoutTransaction(payment: PaymentSummary): Transaction {
  const date = new Date(payment.paidAt || payment.createdAt || "");

  return {
    id: payment.id,
    date: Number.isNaN(date.getTime())
      ? new Date().toISOString()
      : date.toISOString(),
    amount: payment.providerPayout,
    status:
      payment.status === "paid"
        ? "completed"
        : payment.status === "pending"
          ? "pending"
          : "processing",
    method: payment.paymentMethod || "Gateway payment",
    reference: payment.id,
  };
}

export function PayoutPage() {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [expandedTransaction, setExpandedTransaction] = useState<string | null>(null);
  const [liveTransactions, setLiveTransactions] = useState<Transaction[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const nextPayoutDate = "April 5, 2026";

  const mockTransactions: Transaction[] = [
    {
      id: "1",
      date: "2024-03-15",
      amount: 4500.00,
      status: "completed",
      method: "GCash",
      reference: "TXN-2024-001234",
    },
    {
      id: "2",
      date: "2024-03-10",
      amount: 3200.00,
      status: "processing",
      method: "Bank Transfer",
      reference: "TXN-2024-001233",
    },
    {
      id: "3",
      date: "2024-03-05",
      amount: 2800.00,
      status: "completed",
      method: "PayMaya",
      reference: "TXN-2024-001232",
    },
    {
      id: "4",
      date: "2024-02-28",
      amount: 5100.00,
      status: "completed",
      method: "GCash",
      reference: "TXN-2024-001231",
    },
  ];

  useEffect(() => {
    const loadPayments = async () => {
      const token = getStoredProviderAccessToken();

      if (!token) {
        return;
      }

      try {
        setLoadError(null);
        const payments = await listProviderPayments(token);
        setLiveTransactions(payments.map(toPayoutTransaction));
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : "Unable to load payout data.");
      }
    };

    void loadPayments();
  }, []);

  const transactions = liveTransactions.length > 0 ? liveTransactions : mockTransactions;
  const currentBalance = transactions
    .filter((transaction) => transaction.status === "completed")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const pendingBalance = transactions
    .filter((transaction) => transaction.status !== "completed")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const totalEarnings = transactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0,
  );
  const nextPayoutAmount = currentBalance;
  const thisMonthEarnings = totalEarnings;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return { bg: "#DCFCE7", text: "#16A34A" };
      case "processing":
        return { bg: "#FEF3C7", text: "#D97706" };
      case "pending":
        return { bg: "#FEE2E2", text: "#DC2626" };
      default:
        return { bg: "#F3F4F6", text: "#6B7280" };
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    if (selectedFilter === "all") return true;
    return transaction.status === selectedFilter;
  });

  return (
    <div style={styles.container}>
      <div style={styles.maxWidthContainer}>
        {/* Page Header */}
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>Payout</h1>
          <p style={{ fontSize: "16px", color: "#6B7280" }}>
            Manage your earnings and payout methods
          </p>
          {loadError && (
            <p style={{ fontSize: "14px", color: "#B91C1C", marginTop: "12px" }}>
              {loadError}
            </p>
          )}
        </div>

        {/* Balance Cards */}
<div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", marginBottom: "24px" }}>
  {/* Available Balance - with button below */}
  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
    <div style={{ 
      backgroundColor: "white", 
      borderRadius: "16px", 
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)", 
      border: "1px solid #F3F4F6", 
      padding: "24px",
      height: "140px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between"
    }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Wallet style={{ width: "24px", height: "24px", color: "#00BF63" }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "4px", lineHeight: "1.4" }}>Available Balance</p>
            <p style={{ fontSize: "26px", fontWeight: "bold", color: "#111827", letterSpacing: "-0.02em", lineHeight: "1.2" }}>
              ₱{currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>
      <p style={{ fontSize: "12px", color: "#00BF63", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px", height: "18px" }}>
        <CheckCircle size={14} />
        Ready for withdrawal
      </p>
    </div>
    <button
      onClick={() => navigate("/provider/request-payout")}
      style={{ ...styles.button, ...styles.primaryButton, width: "100%" }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#059669"; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#00BF63"; }}
    >
      Request Early Payout
      <ChevronRight style={{ width: "18px", height: "18px" }} />
    </button>
    <p style={{ fontSize: "11px", color: "#9CA3AF", textAlign: "center" }}>
      Instant payout with small fee
    </p>
  </div>

  {/* Pending Balance */}
  <div style={{ 
    backgroundColor: "white", 
    borderRadius: "16px", 
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)", 
    border: "1px solid #F3F4F6", 
    padding: "24px",
    height: "140px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  }}>
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
        <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Clock style={{ width: "24px", height: "24px", color: "#D97706" }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "4px", lineHeight: "1.4" }}>Pending</p>
          <p style={{ fontSize: "26px", fontWeight: "bold", color: "#111827", letterSpacing: "-0.02em", lineHeight: "1.2" }}>
            ₱{pendingBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
    <p style={{ fontSize: "12px", color: "#D97706", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px", height: "18px" }}>
      <Clock size={14} />
      Processing in progress
    </p>
  </div>

  {/* Total Earnings */}
  <div style={{ 
    backgroundColor: "white", 
    borderRadius: "16px", 
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)", 
    border: "1px solid #F3F4F6", 
    padding: "24px",
    height: "140px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  }}>
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
        <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "#E0E7FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Calendar style={{ width: "24px", height: "24px", color: "#4F46E5" }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "4px", lineHeight: "1.4" }}>Total Earnings</p>
          <p style={{ fontSize: "26px", fontWeight: "bold", color: "#111827", letterSpacing: "-0.02em", lineHeight: "1.2" }}>
            ₱{totalEarnings.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
    <p style={{ fontSize: "12px", color: "#4F46E5", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px", height: "18px" }}>
      <TrendingUp size={14} />
      All-time total
    </p>
  </div>
</div>

{/* Next Payout & Insights */}
<div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px", marginBottom: "32px" }}>
  {/* Next Payout */}
  <div style={{ backgroundColor: "#F0FDF8", borderRadius: "16px", border: "2px solid #A7F3D0", padding: "20px" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
      <Calendar size={18} color="#00BF63" />
      <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#065F46" }}>Next Scheduled Payout</h3>
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <p style={{ fontSize: "12px", color: "#059669", marginBottom: "2px" }}>Date</p>
        <p style={{ fontSize: "16px", fontWeight: "bold", color: "#047857" }}>{nextPayoutDate}</p>
      </div>
      <div style={{ textAlign: "right" }}>
        <p style={{ fontSize: "12px", color: "#059669", marginBottom: "2px" }}>Estimated Amount</p>
        <p style={{ fontSize: "16px", fontWeight: "bold", color: "#047857" }}>
          ₱{nextPayoutAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  </div>

  {/* Monthly Earnings Insight */}
  <div style={{ backgroundColor: "#FEF3C7", borderRadius: "16px", border: "2px solid #FCD34D", padding: "20px" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
      <TrendingUp size={18} color="#D97706" />
      <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#92400E" }}>This Month's Earnings</h3>
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <p style={{ fontSize: "12px", color: "#B45309", marginBottom: "2px" }}>March 2026</p>
        <p style={{ fontSize: "20px", fontWeight: "bold", color: "#D97706" }}>
          ₱{thisMonthEarnings.toLocaleString("en-US", { minimumFractionDigits: 2 })} earned
        </p>
      </div>
    </div>
  </div>
</div>

        {/* Payout Method */}
        <div style={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#111827" }}>
              Payout Method
            </h2>
            <button
              style={{
                ...styles.button,
                ...styles.secondaryButton,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#F9FAFB";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "white";
              }}
            >
              Manage Payout Methods
              <ExternalLink style={{ width: "16px", height: "16px" }} />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Primary Method - GCash */}
            <div
              style={{
                padding: "20px",
                borderRadius: "12px",
                backgroundColor: "#F0FDF8",
                border: "2px solid #00BF63",
                minHeight: "88px",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 191, 99, 0.15)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "#00BF63", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Smartphone style={{ width: "20px", height: "20px", color: "white" }} />
                  </div>
                  <div>
                    <p style={{ fontSize: "15px", fontWeight: "600", color: "#111827", marginBottom: "4px", lineHeight: "1.3" }}>
                      GCash
                    </p>
                    <p style={{ fontSize: "13px", color: "#6B7280", lineHeight: "1.3" }}>
                      •••• •••• 1234
                    </p>
                  </div>
                </div>
                <span
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "600",
                    backgroundColor: "#00BF63",
                    color: "white",
                  }}
                >
                  Primary
                </span>
              </div>
              <p style={{ fontSize: "12px", color: "#059669", display: "flex", alignItems: "center", gap: "4px" }}>
                <Clock size={12} />
                Processing time: Instant – 1 hour
              </p>
            </div>

            {/* Secondary Method - Bank Transfer */}
            <div
              style={{
                padding: "20px",
                borderRadius: "12px",
                backgroundColor: "#F9FAFB",
                border: "1px solid #E5E7EB",
                minHeight: "88px",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#F3F4F6";
                e.currentTarget.style.borderColor = "#D1D5DB";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#F9FAFB";
                e.currentTarget.style.borderColor = "#E5E7EB";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Building2 style={{ width: "20px", height: "20px", color: "#6B7280" }} />
                  </div>
                  <div>
                    <p style={{ fontSize: "15px", fontWeight: "600", color: "#111827", marginBottom: "4px", lineHeight: "1.3" }}>
                      Bank Transfer
                    </p>
                    <p style={{ fontSize: "13px", color: "#6B7280", lineHeight: "1.3" }}>
                      BDO •••• 9012
                    </p>
                  </div>
                </div>
              </div>
              <p style={{ fontSize: "12px", color: "#6B7280", display: "flex", alignItems: "center", gap: "4px" }}>
                <Clock size={12} />
                Processing time: 1–3 business days
              </p>
            </div>

            {/* Add New Payout Method */}
            <button
              style={{
                ...styles.button,
                backgroundColor: "white",
                color: "#00BF63",
                border: "2px dashed #A7F3D0",
                width: "100%",
                padding: "18px",
                marginTop: "8px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#F0FDF8";
                e.currentTarget.style.borderColor = "#00BF63";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "white";
                e.currentTarget.style.borderColor = "#A7F3D0";
              }}
            >
              <Plus style={{ width: "18px", height: "18px" }} />
              Add new payout method
            </button>
          </div>
        </div>

        {/* Transaction History */}
        <div style={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#111827" }}>
              Transaction History
            </h2>
            <div style={{ display: "flex", gap: "8px" }}>
              {["all", "completed", "processing", "pending"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                    border: "none",
                    backgroundColor: selectedFilter === filter ? "#00BF63" : "#F3F4F6",
                    color: selectedFilter === filter ? "white" : "#6B7280",
                    transition: "all 0.3s ease",
                  }}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Search & Date Filter */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
            {/* Search Bar */}
            <div style={{ flex: 1, position: "relative" as const }}>
              <Search style={{ position: "absolute" as const, left: "14px", top: "50%", transform: "translateY(-50%)", width: "18px", height: "18px", color: "#9CA3AF" }} />
              <input
                type="text"
                placeholder="Search by reference, method, or amount..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px 12px 44px",
                  borderRadius: "10px",
                  border: "2px solid #E5E7EB",
                  fontSize: "14px",
                  color: "#374151",
                  outline: "none",
                  transition: "border-color 0.3s ease",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#00BF63"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "#E5E7EB"; }}
              />
            </div>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{
                padding: "12px 16px",
                borderRadius: "10px",
                border: "2px solid #E5E7EB",
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
                outline: "none",
                cursor: "pointer",
                backgroundColor: "white",
                minWidth: "160px",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#00BF63"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#E5E7EB"; }}
            >
              <option value="all">All Time</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filteredTransactions.length === 0 ? (
              <p style={{ textAlign: "center", color: "#6B7280", padding: "32px", fontSize: "14px" }}>
                No transactions found for this filter.
              </p>
            ) : (
              filteredTransactions.map((transaction) => {
                const statusColors = getStatusColor(transaction.status);
                const isExpanded = expandedTransaction === transaction.id;
                const serviceFee = transaction.amount * 0.05;
                const platformFee = transaction.amount * 0.02;
                const netAmount = transaction.amount - serviceFee - platformFee;
                
                return (
                  <div
                    key={transaction.id}
                    style={{
                      borderRadius: "12px",
                      backgroundColor: "#F9FAFB",
                      border: "1px solid #E5E7EB",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#F3F4F6";
                      e.currentTarget.style.borderColor = "#D1D5DB";
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#F9FAFB";
                      e.currentTarget.style.borderColor = "#E5E7EB";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div
                      style={{
                        padding: "20px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <p style={{ fontSize: "18px", fontWeight: "700", color: "#111827", marginBottom: "4px", letterSpacing: "-0.02em" }}>
                          ₱{transaction.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </p>
                        <p style={{ fontSize: "13px", color: "#6B7280" }}>
                          {new Date(transaction.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "13px", fontWeight: "600", color: "#111827", marginBottom: "4px" }}>
                          {transaction.method}
                        </p>
                        <p style={{ fontSize: "12px", color: "#9CA3AF" }}>
                          {transaction.reference}
                        </p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span
                          style={{
                            padding: "8px 14px",
                            borderRadius: "8px",
                            fontSize: "12px",
                            fontWeight: "600",
                            backgroundColor: statusColors.bg,
                            color: statusColors.text,
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          {transaction.status === "completed" && <CheckCircle size={14} />}
                          {transaction.status === "processing" && <Clock size={14} />}
                          {transaction.status === "pending" && <AlertCircle size={14} />}
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedTransaction(isExpanded ? null : transaction.id);
                          }}
                          style={{
                            padding: "8px 16px",
                            borderRadius: "8px",
                            fontSize: "12px",
                            fontWeight: "600",
                            backgroundColor: "white",
                            color: "#00BF63",
                            border: "1px solid #E5E7EB",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#F0FDF8";
                            e.currentTarget.style.borderColor = "#00BF63";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "white";
                            e.currentTarget.style.borderColor = "#E5E7EB";
                          }}
                        >
                          {isExpanded ? "Hide" : "View"} Details
                        </button>
                      </div>
                    </div>

                    {/* Expandable Breakdown */}
                    {isExpanded && (
                      <div
                        style={{
                          padding: "20px",
                          borderTop: "1px solid #E5E7EB",
                          backgroundColor: "white",
                          borderBottomLeftRadius: "12px",
                          borderBottomRightRadius: "12px",
                        }}
                      >
                        <h4 style={{ fontSize: "13px", fontWeight: "600", color: "#111827", marginBottom: "12px" }}>
                          Payment Breakdown
                        </h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "13px", color: "#6B7280" }}>Gross Amount</span>
                            <span style={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}>
                              ₱{transaction.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "13px", color: "#6B7280" }}>Service Fee (5%)</span>
                            <span style={{ fontSize: "13px", fontWeight: "600", color: "#DC2626" }}>
                              - ₱{serviceFee.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "8px", borderBottom: "1px solid #E5E7EB" }}>
                            <span style={{ fontSize: "13px", color: "#6B7280" }}>Platform Fee (2%)</span>
                            <span style={{ fontSize: "13px", fontWeight: "600", color: "#DC2626" }}>
                              - ₱{platformFee.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "8px" }}>
                            <span style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>Net Payout</span>
                            <span style={{ fontSize: "16px", fontWeight: "700", color: "#00BF63" }}>
                              ₱{netAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

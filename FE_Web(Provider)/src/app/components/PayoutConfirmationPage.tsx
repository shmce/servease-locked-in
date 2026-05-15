import { CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router";

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(to bottom right, #F9FAFB, rgba(16, 185, 129, 0.05))",
    padding: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: "1px solid #F3F4F6",
    padding: "48px",
    maxWidth: "600px",
    textAlign: "center" as const,
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
    backgroundColor: "#00BF63",
    color: "white",
    boxShadow: "0 4px 16px rgba(0, 191, 99, 0.25)",
  },
};

export function PayoutConfirmationPage() {
  const navigate = useNavigate();

  // Mock data - in real app, this would come from route state or API
  const payoutDetails = {
    amount: 4000.00,
    method: "GCash (****5678)",
    requestDate: new Date().toLocaleDateString("en-US", { 
      month: "long", 
      day: "numeric", 
      year: "numeric" 
    }),
    referenceNumber: "PO-2024-" + Math.floor(Math.random() * 100000).toString().padStart(5, "0"),
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Success Icon */}
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            backgroundColor: "#DCFCE7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
          }}
        >
          <CheckCircle2 style={{ width: "48px", height: "48px", color: "#00BF63" }} />
        </div>

        {/* Success Message */}
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "bold",
            color: "#111827",
            marginBottom: "12px",
            letterSpacing: "-0.025em",
          }}
        >
          Payout Request Received
        </h1>

        {/* Email Confirmation */}
        <p
          style={{
            fontSize: "14px",
            color: "#00BF63",
            marginBottom: "24px",
            fontWeight: "500",
          }}
        >
          A confirmation email has been sent
        </p>

        {/* Transaction Details */}
        <div
          style={{
            backgroundColor: "#F9FAFB",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "24px",
            textAlign: "left" as const,
          }}
        >
          <div style={{ marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "14px", color: "#6B7280" }}>Amount Requested</span>
            <span style={{ fontSize: "16px", fontWeight: "600", color: "#111827" }}>
              ₱{payoutDetails.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div style={{ marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "14px", color: "#6B7280" }}>Payout Method</span>
            <span style={{ fontSize: "14px", fontWeight: "500", color: "#111827" }}>
              {payoutDetails.method}
            </span>
          </div>
          <div style={{ marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "14px", color: "#6B7280" }}>Request Date</span>
            <span style={{ fontSize: "14px", fontWeight: "500", color: "#111827" }}>
              {payoutDetails.requestDate}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "14px", color: "#6B7280" }}>Reference Number</span>
            <span style={{ fontSize: "14px", fontWeight: "600", color: "#00BF63", fontFamily: "monospace" }}>
              {payoutDetails.referenceNumber}
            </span>
          </div>
        </div>

        {/* Processing Info */}
        <div
          style={{
            backgroundColor: "#FFFBEB",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "32px",
            textAlign: "left" as const,
            borderLeft: "3px solid #F59E0B",
          }}
        >
          <p style={{ fontSize: "14px", fontWeight: "600", color: "#92400E", marginBottom: "4px" }}>
            Processing Time: 1–3 business days
          </p>
          <p style={{ fontSize: "13px", color: "#78350F", lineHeight: "1.5", margin: 0 }}>
            You will receive a notification once your payout has been processed and transferred to your account.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" as const }}>
          <button
            onClick={() => navigate("/provider/payout")}
            style={styles.button}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#059669";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#00BF63";
            }}
          >
            Back to Payout
          </button>
        </div>
      </div>
    </div>
  );
}
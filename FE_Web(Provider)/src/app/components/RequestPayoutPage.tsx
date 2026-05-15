import { useState } from "react";
import { Wallet, AlertCircle, CheckCircle2, Clock, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(to bottom right, #F9FAFB, rgba(16, 185, 129, 0.05))",
    padding: "32px",
  },
  maxWidthContainer: {
    maxWidth: "800px",
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
    padding: "14px 28px",
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
  input: {
    padding: "14px 16px",
    borderRadius: "10px",
    border: "2px solid #E5E7EB",
    fontSize: "16px",
    color: "#374151",
    transition: "border-color 0.3s ease",
    outline: "none",
    width: "100%",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "8px",
    display: "block",
  },
};

export function RequestPayoutPage() {
  const navigate = useNavigate();
  const availableBalance = 15420.50;
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("GCash");
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Calculate fees and final amount
  const amount = parseFloat(withdrawAmount) || 0;
  const withdrawalFee = amount > 0 ? amount * 0.025 : 0; // 2.5% fee
  const amountToReceive = amount - withdrawalFee;

  const isValidAmount = amount > 0 && amount <= availableBalance;
  const canSubmit = isValidAmount && termsAccepted;

  const payoutMethods = [
    { id: "GCash", name: "GCash", account: "•••• •••• 1234" },
    { id: "PayMaya", name: "PayMaya", account: "•••• •••• 5678" },
    { id: "BankTransfer", name: "Bank Transfer", account: "BDO •••• 9012" },
  ];

  const handleRequestPayout = () => {
    if (!canSubmit) return;
    console.log("Requesting payout:", {
      amount,
      withdrawalFee,
      amountToReceive,
      method: selectedMethod,
    });
    // Navigate to confirmation page
    navigate("/provider/payout-confirmation");
  };

  return (
    <div style={styles.container}>
      <div style={styles.maxWidthContainer}>
        {/* Back Navigation */}
        <button
          onClick={() => navigate("/provider/payout")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 12px",
            marginBottom: "8px",
            backgroundColor: "transparent",
            border: "none",
            color: "#6B7280",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease",
            borderRadius: "8px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#00BF63";
            e.currentTarget.style.backgroundColor = "#F0FDF8";
            const arrow = e.currentTarget.querySelector("svg");
            if (arrow) {
              (arrow as SVGElement).style.transform = "translateX(-3px)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#6B7280";
            e.currentTarget.style.backgroundColor = "transparent";
            const arrow = e.currentTarget.querySelector("svg");
            if (arrow) {
              (arrow as SVGElement).style.transform = "translateX(0)";
            }
          }}
        >
          <ArrowLeft 
            style={{ 
              width: "16px", 
              height: "16px", 
              transition: "transform 0.3s ease"
            }} 
          />
          Back to Payout
        </button>

        {/* Page Header */}
        <div style={{ ...styles.pageHeader, marginBottom: "20px" }}>
          <h1 style={styles.pageTitle}>Request Payout</h1>
          <p style={{ fontSize: "16px", color: "#6B7280" }}>
            Withdraw your earnings to your preferred payout method
          </p>
        </div>

        {/* Available Balance Display */}
        <div
          style={{
            ...styles.card,
            background: "linear-gradient(135deg, #00BF63 0%, #059669 100%)",
            color: "white",
            marginBottom: "20px",
            padding: "24px",
          }}
        >
          <p style={{ fontSize: "13px", opacity: 0.9, marginBottom: "6px" }}>
            Available Balance
          </p>
          <h2 style={{ fontSize: "36px", fontWeight: "bold", letterSpacing: "-0.02em", marginBottom: "6px" }}>
            ₱{availableBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
          <p style={{ fontSize: "12px", opacity: 0.85, fontWeight: "500" }}>
            Ready for withdrawal
          </p>
        </div>

        {/* Payout Request Form */}
        <div style={styles.card}>
          {/* Amount to Withdraw */}
          <div style={{ marginBottom: "24px" }}>
            <label style={styles.label}>Amount to Withdraw</label>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#6B7280",
                }}
              >
                ₱
              </span>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="0.00"
                style={{
                  ...styles.input,
                  paddingLeft: "40px",
                  fontSize: "24px",
                  fontWeight: "600",
                  MozAppearance: "textfield" as any,
                  WebkitAppearance: "none" as any,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#00BF63";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#E5E7EB";
                }}
              />
            </div>
            {amount > availableBalance && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginTop: "8px",
                }}
              >
                <AlertCircle style={{ width: "14px", height: "14px", color: "#DC2626" }} />
                <p style={{ fontSize: "13px", color: "#DC2626" }}>
                  Amount exceeds available balance
                </p>
              </div>
            )}
          </div>

          {/* Calculation Summary */}
          {amount > 0 && (
            <div
              style={{
                backgroundColor: "#F9FAFB",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <span style={{ fontSize: "14px", color: "#6B7280" }}>
                  Withdrawal Amount
                </span>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>
                  ₱{amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <span style={{ fontSize: "14px", color: "#6B7280" }}>
                  Withdrawal Fee (2.5%)
                </span>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#DC2626" }}>
                  -₱{withdrawalFee.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div
                style={{
                  borderTop: "2px solid #E5E7EB",
                  paddingTop: "12px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: "15px", fontWeight: "600", color: "#111827" }}>
                  Amount You'll Receive
                </span>
                <span style={{ fontSize: "18px", fontWeight: "700", color: "#00BF63" }}>
                  ₱{amountToReceive.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}

          {/* Payout Method Selector */}
          <div style={{ marginBottom: "24px" }}>
            <label style={styles.label}>Payout Method</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {payoutMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    border: "2px solid",
                    borderColor: selectedMethod === method.id ? "#00BF63" : "#E5E7EB",
                    backgroundColor: selectedMethod === method.id ? "#F0FDF8" : "white",
                    transition: "all 0.3s ease",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: "15px",
                        fontWeight: "600",
                        color: selectedMethod === method.id ? "#00BF63" : "#111827",
                        marginBottom: "2px",
                      }}
                    >
                      {method.name}
                    </p>
                    <p style={{ fontSize: "13px", color: "#6B7280" }}>
                      {method.account}
                    </p>
                  </div>
                  {selectedMethod === method.id && (
                    <CheckCircle2
                      style={{ width: "20px", height: "20px", color: "#00BF63" }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Processing Time Notice */}
          <div
            style={{
              backgroundColor: "#EFF6FF",
              border: "1px solid #BFDBFE",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "24px",
              display: "flex",
              gap: "12px",
            }}
          >
            <Clock
              style={{ width: "20px", height: "20px", color: "#2563EB", flexShrink: 0 }}
            />
            <div>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#1E40AF",
                  marginBottom: "4px",
                }}
              >
                Processing Time
              </p>
              <p style={{ fontSize: "13px", color: "#1E3A8A", lineHeight: "1.6" }}>
                Your payout will be processed within 1–3 business days. You'll receive a
                confirmation email once the transfer is complete.
              </p>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div
            style={{
              paddingTop: "24px",
              borderTop: "1px solid #F3F4F6",
              marginBottom: "24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "start", gap: "12px" }}>
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                style={{
                  width: "18px",
                  height: "18px",
                  cursor: "pointer",
                  accentColor: "#00BF63",
                  marginTop: "2px",
                  flexShrink: 0,
                }}
              />
              <label
                htmlFor="terms"
                style={{
                  fontSize: "14px",
                  color: "#374151",
                  cursor: "pointer",
                  lineHeight: "1.6",
                }}
              >
                I agree to the{" "}
                <span style={{ color: "#00BF63", fontWeight: "600" }}>
                  terms and conditions
                </span>{" "}
                for early payout requests. I understand that a 2.5% processing fee will be
                deducted from my withdrawal amount.
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleRequestPayout}
            disabled={!canSubmit}
            style={{
              ...styles.button,
              ...styles.primaryButton,
              width: "100%",
              opacity: !canSubmit ? 0.5 : 1,
              cursor: !canSubmit ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (canSubmit) {
                e.currentTarget.style.backgroundColor = "#059669";
              }
            }}
            onMouseLeave={(e) => {
              if (canSubmit) {
                e.currentTarget.style.backgroundColor = "#00BF63";
              }
            }}
          >
            <Wallet style={{ width: "18px", height: "18px" }} />
            Request Payout
          </button>

          {!termsAccepted && amount > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginTop: "12px",
                justifyContent: "center",
              }}
            >
              <AlertCircle style={{ width: "14px", height: "14px", color: "#DC2626" }} />
              <p style={{ fontSize: "13px", color: "#DC2626" }}>
                Please accept the terms and conditions to continue
              </p>
            </div>
          )}
        </div>

        {/* Info Card */}
        <div
          style={{
            backgroundColor: "#FEF3C7",
            border: "1px solid #FCD34D",
            borderRadius: "12px",
            padding: "16px",
            display: "flex",
            gap: "12px",
          }}
        >
          <AlertCircle
            style={{ width: "20px", height: "20px", color: "#D97706", flexShrink: 0 }}
          />
          <div>
            <p
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#92400E",
                marginBottom: "4px",
              }}
            >
              Early Payout Notice
            </p>
            <p style={{ fontSize: "13px", color: "#78350F", lineHeight: "1.6" }}>
              Regular scheduled payouts are free of charge. Early payout requests incur a
              2.5% processing fee. Consider waiting for your next scheduled payout to avoid
              fees.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
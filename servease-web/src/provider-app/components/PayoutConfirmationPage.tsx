import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  getStoredProviderAccessToken,
  listProviderPayouts,
  type PayoutSummary,
} from "../../services/serveaseProviderApi";

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

interface PayoutConfirmationDetails {
  amount: number;
  netAmount: number | null;
  processingFee: number | null;
  method: string;
  requestDate: string | null;
  referenceNumber: string | null;
}

function toPayoutConfirmationDetails(
  payout: PayoutSummary,
): PayoutConfirmationDetails {
  return {
    amount: payout.amount,
    netAmount: payout.netAmount,
    processingFee: payout.processingFee,
    method: payout.accountLabel ?? "Selected payout method",
    requestDate: payout.requestedAt ?? payout.createdAt,
    referenceNumber: payout.reference ?? payout.id,
  };
}

export function PayoutConfirmationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const payoutId = searchParams.get("payoutId");
  const [payoutDetails, setPayoutDetails] =
    useState<PayoutConfirmationDetails | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!payoutId) {
      setPayoutDetails(null);
      setLoadError("Payout request details are not available.");
      return;
    }

    const token = getStoredProviderAccessToken();
    if (!token) {
      setPayoutDetails(null);
      setLoadError("Sign in again to view payout request details.");
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    void listProviderPayouts(token)
      .then((payouts) => {
        if (cancelled) return;
        const payout = payouts.find((item) => item.id === payoutId);
        if (!payout) {
          setPayoutDetails(null);
          setLoadError("Payout request details were not found.");
          return;
        }
        setPayoutDetails(toPayoutConfirmationDetails(payout));
      })
      .catch((error) => {
        if (cancelled) return;
        setPayoutDetails(null);
        setLoadError(
          error instanceof Error
            ? error.message
            : "Unable to load payout request details.",
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [payoutId]);

  const formattedRequestDate = payoutDetails?.requestDate
    ? new Date(payoutDetails.requestDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

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

        {/* Confirmation Summary */}
        <p
          style={{
            fontSize: "14px",
            color: "#4B5563",
            marginBottom: "24px",
            fontWeight: "500",
          }}
        >
          {isLoading
            ? "Loading payout request details..."
            : payoutDetails
              ? "The payout service returned the request details below."
              : loadError}
        </p>

        {/* Transaction Details */}
        {payoutDetails ? (
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
            {payoutDetails.processingFee !== null && (
              <div style={{ marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "14px", color: "#6B7280" }}>Processing Fee</span>
                <span style={{ fontSize: "14px", fontWeight: "500", color: "#DC2626" }}>
                  -₱{payoutDetails.processingFee.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}
            {payoutDetails.netAmount !== null && (
              <div style={{ marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "14px", color: "#6B7280" }}>Net Amount</span>
                <span style={{ fontSize: "16px", fontWeight: "600", color: "#00BF63" }}>
                  ₱{payoutDetails.netAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}
            <div style={{ marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "14px", color: "#6B7280" }}>Payout Method</span>
              <span style={{ fontSize: "14px", fontWeight: "500", color: "#111827" }}>
                {payoutDetails.method}
              </span>
            </div>
            {formattedRequestDate && (
              <div style={{ marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "14px", color: "#6B7280" }}>Request Date</span>
                <span style={{ fontSize: "14px", fontWeight: "500", color: "#111827" }}>
                  {formattedRequestDate}
                </span>
              </div>
            )}
            {payoutDetails.referenceNumber && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "14px", color: "#6B7280" }}>Reference Number</span>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#00BF63", fontFamily: "monospace" }}>
                  {payoutDetails.referenceNumber}
                </span>
              </div>
            )}
          </div>
        ) : null}

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
            Track Status in Payout History
          </p>
          <p style={{ fontSize: "13px", color: "#78350F", lineHeight: "1.5", margin: 0 }}>
            Use the payout page as the source of truth for processing status,
            transferred amount, and any operational follow-up.
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

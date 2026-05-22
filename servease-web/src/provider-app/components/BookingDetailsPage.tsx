import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router";
import type { Map as MapLibreMap, Marker as MapLibreMarker } from "maplibre-gl";
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  MapPin,
  Calendar,
  Clock,
  Navigation,
  CheckCircle,
  Upload,
  AlertCircle,
  Image as ImageIcon,
  Send,
  DollarSign,
  X,
} from "lucide-react";
import {
  createProviderBookingAttachment,
  createProviderBookingDispute,
  createProviderBookingServiceUpdate,
  deleteProviderBookingAttachment,
  getProviderBooking,
  getProviderBookingTrackingSnapshot,
  getStoredProviderAccessToken,
  listProviderConversationMessages,
  listProviderBookingServiceUpdates,
  openProviderConversation,
  sendProviderConversationMessage,
  updateProviderBookingStatus,
  uploadProviderProgressPhoto,
  type BookingStatus,
  type BookingServiceUpdateSummary,
  type BookingSummary,
  type BookingTrackingSnapshot,
  type ConversationMessage,
  type ConversationSummary,
} from "../../services/serveaseProviderApi";

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#F9FAFB",
    padding: "32px",
  },
  maxWidthContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "32px",
  },
  backButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    color: "#6B7280",
    marginBottom: "16px",
    padding: "8px 0",
    transition: "color 0.3s ease",
  },
  pageTitle: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#111827",
    letterSpacing: "-0.025em",
    marginBottom: "8px",
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  statusBadge: {
    padding: "8px 16px",
    borderRadius: "12px",
    fontSize: "13px",
    fontWeight: "600",
    display: "inline-block",
  },
  refNumber: {
    fontSize: "14px",
    color: "#6B7280",
    fontWeight: "500",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: "1px solid #F3F4F6",
    padding: "24px",
    marginBottom: "24px",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#111827",
    marginBottom: "20px",
  },
  timeline: {
    display: "flex",
    justifyContent: "space-between",
    position: "relative" as const,
    marginBottom: "32px",
  },
  timelineLine: {
    position: "absolute" as const,
    top: "20px",
    left: "0",
    right: "0",
    height: "3px",
    backgroundColor: "#E5E7EB",
    zIndex: 0,
  },
  timelineProgress: {
    height: "100%",
    backgroundColor: "#00BF63",
    transition: "width 0.5s ease",
  },
  timelineStep: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    flex: 1,
    zIndex: 1,
  },
  timelineCircle: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    border: "3px solid #E5E7EB",
    marginBottom: "8px",
    transition: "all 0.3s ease",
  },
  timelineLabel: {
    fontSize: "11px",
    fontWeight: "500",
    color: "#9CA3AF",
    textAlign: "center" as const,
  },
  customerSection: {
    display: "flex",
    gap: "20px",
    alignItems: "flex-start",
  },
  avatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    backgroundColor: "#E5E7EB",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    fontWeight: "600",
    color: "#6B7280",
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#111827",
    marginBottom: "8px",
  },
  rating: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    marginBottom: "12px",
  },
  phoneNumber: {
    fontSize: "14px",
    color: "#6B7280",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  buttonGroup: {
    display: "flex",
    gap: "12px",
  },
  button: {
    padding: "10px 20px",
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
  outlinedButton: {
    backgroundColor: "white",
    color: "#00BF63",
    border: "2px solid #00BF63",
  },
  dangerButton: {
    backgroundColor: "white",
    color: "#DC2626",
    border: "1px solid #FEE2E2",
  },
  detailRow: {
    display: "flex",
    gap: "12px",
    marginBottom: "16px",
    alignItems: "flex-start",
  },
  detailIcon: {
    color: "#9CA3AF",
    marginTop: "2px",
    flexShrink: 0,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: "12px",
    color: "#9CA3AF",
    marginBottom: "4px",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: "14px",
    color: "#374151",
    fontWeight: "500",
  },
  mapPlaceholder: {
    width: "100%",
    height: "200px",
    backgroundColor: "#F3F4F6",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#9CA3AF",
    fontSize: "14px",
    marginTop: "12px",
    marginBottom: "12px",
    border: "2px dashed #D1D5DB",
  },
  photoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12px",
    marginTop: "12px",
  },
  photoItem: {
    aspectRatio: "1",
    backgroundColor: "#F3F4F6",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px dashed #D1D5DB",
    cursor: "pointer",
    overflow: "hidden",
    position: "relative" as const,
    transition: "all 0.3s ease",
  },
  pricingRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 0",
    borderBottom: "1px solid #F3F4F6",
  },
  pricingLabel: {
    fontSize: "14px",
    color: "#6B7280",
  },
  pricingValue: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#111827",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "16px 0",
    marginTop: "12px",
    borderTop: "2px solid #E5E7EB",
  },
  totalLabel: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#111827",
  },
  totalValue: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#00BF63",
  },
  chatContainer: {
    maxHeight: "400px",
    overflowY: "auto" as const,
    marginBottom: "16px",
  },
  chatBubble: {
    padding: "12px 16px",
    borderRadius: "12px",
    marginBottom: "12px",
    maxWidth: "70%",
  },
  chatBubbleCustomer: {
    backgroundColor: "#F3F4F6",
    marginRight: "auto",
  },
  chatBubbleProvider: {
    backgroundColor: "#D1FAE5",
    marginLeft: "auto",
  },
  chatSender: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: "4px",
  },
  chatMessage: {
    fontSize: "14px",
    color: "#374151",
  },
  chatTime: {
    fontSize: "10px",
    color: "#9CA3AF",
    marginTop: "4px",
  },
  chatInput: {
    display: "flex",
    gap: "12px",
  },
  input: {
    flex: 1,
    padding: "10px 14px",
    borderRadius: "10px",
    border: "2px solid #E5E7EB",
    fontSize: "14px",
    color: "#374151",
    outline: "none",
  },
  actionButtons: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "12px",
    marginTop: "24px",
  },
  infoBox: {
    backgroundColor: "#FEF3C7",
    border: "1px solid #FDE68A",
    borderRadius: "10px",
    padding: "16px",
    marginBottom: "20px",
    fontSize: "13px",
    color: "#92400E",
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
  },
  routePreviewCard: {
    backgroundColor: "#F8FAFC",
    border: "1px solid #D1FAE5",
    borderRadius: "16px",
    marginTop: "18px",
    overflow: "hidden",
  },
  routePreviewMap: {
    backgroundColor: "#E5E7EB",
    height: "220px",
    position: "relative" as const,
  },
  routePreviewFallback: {
    position: "absolute" as const,
    inset: 0,
    alignItems: "center",
    background: "linear-gradient(135deg, #E8F8EF 0%, #E6F0FF 100%)",
    color: "#6B7280",
    display: "flex",
    fontSize: "13px",
    fontWeight: "600",
    justifyContent: "center",
    padding: "18px",
    textAlign: "center" as const,
  },
  routePreviewMeta: {
    backgroundColor: "rgba(255,255,255,0.86)",
    display: "grid",
    gap: "6px",
    padding: "14px",
  },
};

const OPENFREEMAP_STYLE_URL =
  process.env.NEXT_PUBLIC_MAP_STYLE_URL?.trim() ||
  "https://tiles.openfreemap.org/styles/liberty";

function toUiStatus(status: BookingStatus): string {
  switch (status) {
    case "confirmed":
      return "upcoming";
    case "in_progress":
      return "in-progress";
    case "completed":
      return "completed";
    case "cancelled":
      return "cancelled";
    case "rejected":
      return "declined";
    case "pending":
    default:
      return "pending";
  }
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function trackingSummary(tracking: BookingTrackingSnapshot | null): string {
  if (!tracking) {
    return "Route preview loading";
  }

  const parts = [
    tracking.distanceKm === null ? null : `${tracking.distanceKm.toFixed(1)} km`,
    tracking.trafficLevel ? `${tracking.trafficLevel} traffic` : null,
  ].filter(Boolean);

  return parts.length ? parts.join(" · ") : tracking.status.replace("_", " ");
}

function buildDirectionsUrl(
  booking: BookingSummary,
  tracking: BookingTrackingSnapshot | null,
): string | null {
  const coordinateDestination = tracking?.destinationLocation
    ? `${tracking.destinationLocation.latitude},${tracking.destinationLocation.longitude}`
    : null;
  const destination = coordinateDestination || booking.serviceAddress?.trim();

  if (!destination) {
    return null;
  }

  const params = new URLSearchParams({
    api: "1",
    destination,
    travelmode: "driving",
  });

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function isTrackingLocation(
  location: BookingTrackingSnapshot["destinationLocation"] | undefined,
): location is NonNullable<BookingTrackingSnapshot["destinationLocation"]> {
  return (
    Boolean(location) &&
    Number.isFinite(location?.latitude) &&
    Number.isFinite(location?.longitude)
  );
}

function createRouteMarker(kind: "provider" | "destination"): HTMLElement {
  const marker = document.createElement("div");
  marker.style.width = kind === "provider" ? "24px" : "28px";
  marker.style.height = kind === "provider" ? "24px" : "28px";
  marker.style.borderRadius = "999px";
  marker.style.backgroundColor = kind === "provider" ? "#2F6FED" : "#00BF63";
  marker.style.border = "5px solid #FFFFFF";
  marker.style.boxShadow =
    kind === "provider"
      ? "0 8px 18px rgba(47,111,237,0.28)"
      : "0 8px 18px rgba(0,191,99,0.28)";
  return marker;
}

function RoutePreview({
  tracking,
  address,
}: {
  tracking: BookingTrackingSnapshot | null;
  address: string;
}) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [mapUnavailable, setMapUnavailable] = useState(false);
  const destination = isTrackingLocation(tracking?.destinationLocation)
    ? tracking.destinationLocation
    : null;
  const provider = isTrackingLocation(tracking?.providerLocation)
    ? tracking.providerLocation
    : null;

  useEffect(() => {
    if (!mapContainerRef.current || !destination) {
      return;
    }

    let cancelled = false;
    let map: MapLibreMap | null = null;
    const markers: MapLibreMarker[] = [];

    setMapUnavailable(false);

    void import("maplibre-gl")
      .then((maplibregl) => {
        if (cancelled || !mapContainerRef.current) {
          return;
        }

        map = new maplibregl.Map({
          attributionControl: false,
          center: [destination.longitude, destination.latitude],
          container: mapContainerRef.current,
          cooperativeGestures: true,
          interactive: true,
          pitchWithRotate: false,
          scrollZoom: false,
          style: OPENFREEMAP_STYLE_URL,
          zoom: provider ? 12 : 14,
        });
        map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

        if (provider) {
          markers.push(
            new maplibregl.Marker({ element: createRouteMarker("provider") })
              .setLngLat([provider.longitude, provider.latitude])
              .addTo(map),
          );
        }

        markers.push(
          new maplibregl.Marker({ element: createRouteMarker("destination") })
            .setLngLat([destination.longitude, destination.latitude])
            .addTo(map),
        );

        map.on("load", () => {
          if (!map || !provider) {
            return;
          }

          map.addSource("tracking-route", {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: [
                  [provider.longitude, provider.latitude],
                  [destination.longitude, destination.latitude],
                ],
              },
            },
          });
          map.addLayer({
            id: "tracking-route-casing",
            type: "line",
            source: "tracking-route",
            paint: {
              "line-color": "#FFFFFF",
              "line-width": 8,
              "line-opacity": 0.92,
            },
          });
          map.addLayer({
            id: "tracking-route-line",
            type: "line",
            source: "tracking-route",
            paint: {
              "line-color": "#0B7A44",
              "line-width": 4,
              "line-opacity": 0.95,
            },
          });

          const bounds = new maplibregl.LngLatBounds(
            [provider.longitude, provider.latitude],
            [provider.longitude, provider.latitude],
          ).extend([destination.longitude, destination.latitude]);
          map.fitBounds(bounds, { duration: 0, maxZoom: 14, padding: 46 });
        });

        map.on("error", () => {
          if (!map?.loaded()) {
            setMapUnavailable(true);
          }
        });
      })
      .catch(() => {
        setMapUnavailable(true);
      });

    return () => {
      cancelled = true;
      markers.forEach((marker) => marker.remove());
      map?.remove();
    };
  }, [
    destination,
    destination?.latitude,
    destination?.longitude,
    provider,
    provider?.latitude,
    provider?.longitude,
  ]);

  return (
    <div style={styles.routePreviewCard}>
      <div ref={mapContainerRef} style={styles.routePreviewMap}>
        {(!destination || mapUnavailable) && (
          <div style={styles.routePreviewFallback}>
            {destination
              ? "Map tiles are temporarily unavailable."
              : "Service coordinates are not available yet."}
          </div>
        )}
      </div>
      <div style={styles.routePreviewMeta}>
        <div style={styles.detailLabel}>Route preview</div>
        <div style={styles.detailValue}>{trackingSummary(tracking)}</div>
        <div style={styles.detailLabel}>
          {tracking?.destinationLocation
            ? `${tracking.destinationLocation.latitude.toFixed(5)}, ${tracking.destinationLocation.longitude.toFixed(5)}`
            : address}
        </div>
      </div>
    </div>
  );
}

export function BookingDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const messageInputRef = useRef<HTMLInputElement | null>(null);
  const photosSectionRef = useRef<HTMLDivElement | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [apiBooking, setApiBooking] = useState<BookingSummary | null>(null);
  const [tracking, setTracking] = useState<BookingTrackingSnapshot | null>(null);
  const [conversation, setConversation] = useState<ConversationSummary | null>(null);
  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([]);
  const [serviceUpdates, setServiceUpdates] = useState<BookingServiceUpdateSummary[]>([]);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [serviceUpdatesError, setServiceUpdatesError] = useState<string | null>(null);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isPostingProgress, setIsPostingProgress] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");
  const [progressPhoto, setProgressPhoto] = useState<File | null>(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeDetails, setDisputeDetails] = useState("");

  useEffect(() => {
    const loadBooking = async () => {
      const token = getStoredProviderAccessToken();

      if (!token || !id) {
        return;
      }

      try {
        setDetailError(null);
        setServiceUpdatesError(null);
        setTrackingError(null);
        const [booking, updatesResult, trackingResult, conversationResult] = await Promise.all([
          getProviderBooking(token, id),
          listProviderBookingServiceUpdates(token, id)
            .then((updates) => ({ updates, error: null }))
            .catch((error: unknown) => ({
              updates: [] as BookingServiceUpdateSummary[],
              error,
            })),
          getProviderBookingTrackingSnapshot(token, id)
            .then((snapshot) => ({ snapshot, error: null }))
            .catch((error: unknown) => ({
              snapshot: null as BookingTrackingSnapshot | null,
              error,
            })),
          openProviderConversation(token, id)
            .then(async (openedConversation) => ({
              conversation: openedConversation,
              messages: await listProviderConversationMessages(
                token,
                openedConversation.id,
              ),
            }))
            .catch((error: unknown) => ({ error })),
        ]);
        setApiBooking(booking);
        setServiceUpdates(updatesResult.updates);
        setTracking(trackingResult.snapshot);
        setServiceUpdatesError(
          updatesResult.error instanceof Error
            ? updatesResult.error.message
            : updatesResult.error
              ? "Unable to load service updates."
              : null,
        );
        setTrackingError(
          trackingResult.error instanceof Error
            ? trackingResult.error.message
            : trackingResult.error
              ? "Unable to load route tracking."
              : null,
        );
        if ("error" in conversationResult) {
          setConversation(null);
          setConversationMessages([]);
          setMessageError(
            conversationResult.error instanceof Error
              ? conversationResult.error.message
              : "Unable to load booking messages.",
          );
        } else {
          setConversation(conversationResult.conversation);
          setConversationMessages(conversationResult.messages);
          setMessageError(null);
        }
      } catch (error) {
        setDetailError(
          error instanceof Error ? error.message : "Unable to load booking details.",
        );
      }
    };

    void loadBooking();
  }, [id]);

  if (!apiBooking) {
    return (
      <div style={styles.container}>
        <div style={styles.maxWidthContainer}>
          <div style={styles.infoBox}>
            {detailError ?? "Loading booking details…"}
          </div>
        </div>
      </div>
    );
  }

  const estimatedHours = apiBooking.hoursRequired ?? null;
  const estimatedDuration =
    estimatedHours === null
      ? "Not specified"
      : `${estimatedHours} hour${estimatedHours === 1 ? "" : "s"}`;
  const actualDuration =
    apiBooking.status === "completed" && estimatedHours !== null
      ? `${estimatedHours} hour${estimatedHours === 1 ? "" : "s"}`
      : "-";
  const booking = {
    id: apiBooking.id,
    refNumber: apiBooking.bookingReference,
    status: toUiStatus(apiBooking.status),
    customer: {
      name: apiBooking.customerFullName || "ServEase Customer",
      phone: apiBooking.customerContactNumber || "Contact unavailable",
    },
    service: {
      type: apiBooking.serviceTitle || "Service Booking",
      date: formatDate(apiBooking.scheduledAt),
      time: formatTime(apiBooking.scheduledAt),
      location: apiBooking.serviceAddress || "Address unavailable",
      description:
        apiBooking.serviceDescription ?? "No additional description provided.",
      instructions:
        apiBooking.customerNotes ?? "No special instructions provided.",
      estimatedDuration,
      actualDuration,
    },
    photos: (apiBooking.attachments ?? []).map((attachment) => ({
      id: attachment.id,
      url: attachment.fileUrl,
      label:
        attachment.caption ||
        (attachment.mediaKind === "provider_progress"
          ? "Provider update"
          : "Reference photo"),
    })),
    pricing: {
      totalAmount: apiBooking.totalAmount,
    },
  };

  const openDirections = () => {
    const url = buildDirectionsUrl(apiBooking, tracking);
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const callCustomer = () => {
    if (apiBooking.customerContactNumber) {
      window.location.href = `tel:${apiBooking.customerContactNumber}`;
    }
  };

  const focusMessages = () => {
    messageInputRef.current?.focus();
    messageInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const focusPhotos = () => {
    photosSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const updateStatus = async (nextStatus: BookingStatus) => {
    const token = getStoredProviderAccessToken();

    if (!token || !apiBooking) {
      return;
    }

    setIsUpdating(true);
    setDetailError(null);

    try {
      setApiBooking(
        await updateProviderBookingStatus(
          token,
          apiBooking.id,
          apiBooking.status,
          nextStatus,
        ),
      );
    } catch (error) {
      setDetailError(
        error instanceof Error ? error.message : "Unable to update booking status.",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const submitProgressUpdate = async () => {
    const token = getStoredProviderAccessToken();

    if (!token || !apiBooking || !progressMessage.trim()) {
      return;
    }

    setIsPostingProgress(true);
    setDetailError(null);

    try {
      let attachmentId: string | null = null;

      if (progressPhoto) {
        const uploaded = await uploadProviderProgressPhoto(token, progressPhoto);
        const attachment = await createProviderBookingAttachment(token, apiBooking.id, {
          mediaKind: "provider_progress",
          fileUrl: uploaded.publicUrl,
          fileName: progressPhoto.name,
          mimeType: progressPhoto.type || uploaded.contentType,
          storagePath: uploaded.path,
          fileSize: uploaded.size,
          caption: progressMessage.trim(),
        });
        attachmentId = attachment.id;
      }

      const created = await createProviderBookingServiceUpdate(token, apiBooking.id, {
        updateType: "progress",
        message: progressMessage.trim(),
        attachmentId,
      });
      setServiceUpdates((current) => [created, ...current]);
      setProgressMessage("");
      setProgressPhoto(null);
    } catch (error) {
      setDetailError(
        error instanceof Error ? error.message : "Unable to post service progress.",
      );
    } finally {
      setIsPostingProgress(false);
    }
  };

  const removeBookingAttachment = async (attachmentId: string) => {
    const token = getStoredProviderAccessToken();

    if (!token || !apiBooking) {
      return;
    }

    setIsUpdating(true);
    setDetailError(null);

    try {
      await deleteProviderBookingAttachment(token, apiBooking.id, attachmentId);
      setApiBooking({
        ...apiBooking,
        attachments: (apiBooking.attachments ?? []).filter(
          (attachment) => attachment.id !== attachmentId,
        ),
      });
    } catch (error) {
      setDetailError(
        error instanceof Error ? error.message : "Unable to remove booking photo.",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const submitDispute = async () => {
    const token = getStoredProviderAccessToken();
    const reason = disputeReason.trim();
    const details = disputeDetails.trim();

    if (!token || !apiBooking || !reason || !details) {
      return;
    }

    setIsUpdating(true);
    setDetailError(null);

    try {
      await createProviderBookingDispute(token, apiBooking.id, {
        category: reason,
        reason: details,
      });
      setDisputeReason("");
      setDisputeDetails("");
    } catch (error) {
      setDetailError(
        error instanceof Error ? error.message : "Unable to raise booking dispute.",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const timelineSteps = [
    { label: "Requested", status: "completed" },
    { label: "Accepted", status: "completed" },
    { label: "On the Way", status: "current" },
    { label: "Arrived", status: "pending" },
    { label: "In Progress", status: "pending" },
    { label: "Completed", status: "pending" },
  ];

  const currentStepIndex = timelineSteps.findIndex((s) => s.status === "current");
  const progressPercentage = (currentStepIndex / (timelineSteps.length - 1)) * 100;

  const getStatusBadgeStyle = (status: string) => {
    const baseStyle = styles.statusBadge;
    switch (status) {
      case "upcoming":
        return { ...baseStyle, backgroundColor: "#DBEAFE", color: "#1E40AF" };
      case "in-progress":
        return { ...baseStyle, backgroundColor: "#FEF3C7", color: "#92400E" };
      case "completed":
        return { ...baseStyle, backgroundColor: "#D1FAE5", color: "#065F46" };
      case "cancelled":
        return { ...baseStyle, backgroundColor: "#FEE2E2", color: "#991B1B" };
      default:
        return baseStyle;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "upcoming":
        return "Upcoming";
      case "in-progress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const getTimelineCircleStyle = (status: string) => {
    switch (status) {
      case "completed":
        return {
          ...styles.timelineCircle,
          backgroundColor: "#00BF63",
          borderColor: "#00BF63",
        };
      case "current":
        return {
          ...styles.timelineCircle,
          backgroundColor: "white",
          borderColor: "#00BF63",
        };
      default:
        return styles.timelineCircle;
    }
  };

  const getTimelineLabelStyle = (status: string) => {
    if (status === "completed" || status === "current") {
      return { ...styles.timelineLabel, color: "#00BF63" };
    }
    return styles.timelineLabel;
  };

  const handleSendMessage = async () => {
    const token = getStoredProviderAccessToken();
    const content = chatMessage.trim();

    if (!token || !conversation || !content) {
      return;
    }

    setIsSendingMessage(true);
    setMessageError(null);

    try {
      const sentMessage = await sendProviderConversationMessage(
        token,
        conversation.id,
        content,
      );
      setConversationMessages((current) => [...current, sentMessage]);
      setChatMessage("");
    } catch (error) {
      setMessageError(
        error instanceof Error ? error.message : "Unable to send this message.",
      );
    } finally {
      setIsSendingMessage(false);
    }
  };

  const formatServiceUpdateTime = (value: string | null): string => {
    if (!value) {
      return "";
    }

    return new Date(value).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const initials = booking.customer.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div style={styles.container}>
      <div style={styles.maxWidthContainer}>
        <div style={styles.header}>
          <button
            style={styles.backButton}
            onClick={() => navigate("/provider/bookings")}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#00BF63")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}
          >
            <ArrowLeft size={18} />
            Back to Bookings
          </button>
          <div style={styles.headerRow}>
            <h1 style={styles.pageTitle}>{booking.refNumber}</h1>
            <div style={getStatusBadgeStyle(booking.status)}>
              {getStatusLabel(booking.status)}
            </div>
          </div>
          {detailError && (
            <p style={{ color: "#B91C1C", fontSize: "14px", marginTop: "12px" }}>
              {detailError}
            </p>
          )}
        </div>

        {/* Progress Timeline */}
        <div style={styles.card}>
          <div style={styles.timeline}>
            <div style={styles.timelineLine}>
              <div
                style={{ ...styles.timelineProgress, width: `${progressPercentage}%` }}
              />
            </div>
            {timelineSteps.map((step, index) => (
              <div key={index} style={styles.timelineStep}>
                <div style={getTimelineCircleStyle(step.status)}>
                  {step.status === "completed" && <CheckCircle size={20} color="white" />}
                  {step.status === "current" && (
                    <div
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        backgroundColor: "#00BF63",
                      }}
                    />
                  )}
                </div>
                <div style={getTimelineLabelStyle(step.status)}>{step.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* Left Column */}
          <div>
            {/* Customer Info */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Customer Information</h2>
              <div style={styles.customerSection}>
                <div style={styles.avatar}>{initials}</div>
                <div style={styles.customerInfo}>
                  <div style={styles.customerName}>{booking.customer.name}</div>
                  <div style={styles.phoneNumber}>
                    <Phone size={14} />
                    {booking.customer.phone}
                  </div>
                  <div style={styles.buttonGroup}>
                    <button
                      type="button"
                      style={{ ...styles.button, ...styles.outlinedButton }}
                      onClick={callCustomer}
                    >
                      <Phone size={16} />
                      Call
                    </button>
                    <button
                      type="button"
                      style={{ ...styles.button, ...styles.outlinedButton }}
                      onClick={focusMessages}
                    >
                      <MessageCircle size={16} />
                      Message
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Service Details</h2>

              <div style={styles.detailRow}>
                <div style={styles.detailIcon}>
                  <Calendar size={18} />
                </div>
                <div style={styles.detailContent}>
                  <div style={styles.detailLabel}>Service Type</div>
                  <div style={styles.detailValue}>{booking.service.type}</div>
                </div>
              </div>

              <div style={styles.detailRow}>
                <div style={styles.detailIcon}>
                  <Calendar size={18} />
                </div>
                <div style={styles.detailContent}>
                  <div style={styles.detailLabel}>Date & Time</div>
                  <div style={styles.detailValue}>
                    {booking.service.date} • {booking.service.time}
                  </div>
                </div>
              </div>

              <div style={styles.detailRow}>
                <div style={styles.detailIcon}>
                  <MapPin size={18} />
                </div>
                <div style={styles.detailContent}>
                  <div style={styles.detailLabel}>Location</div>
	                  <div style={styles.detailValue}>{booking.service.location}</div>
	                  <RoutePreview tracking={tracking} address={booking.service.location} />
                  {trackingError && (
                    <p style={{ color: "#B91C1C", fontSize: "13px", marginTop: "8px" }}>
                      {trackingError}
                    </p>
                  )}
	                </div>
	              </div>

              <div style={styles.detailRow}>
                <div style={styles.detailIcon}>
                  <AlertCircle size={18} />
                </div>
                <div style={styles.detailContent}>
                  <div style={styles.detailLabel}>Description</div>
                  <div style={styles.detailValue}>{booking.service.description}</div>
                </div>
              </div>

              {booking.photos.length > 0 && (
                <div ref={photosSectionRef} style={{ marginTop: "16px" }}>
                  <div style={styles.detailLabel}>Photos</div>
                  <div style={styles.photoGrid}>
                    {booking.photos.map((photo) => (
                      <div key={photo.id} style={styles.photoItem}>
                        {photo.url ? (
                          <img
                            src={photo.url}
                            alt={photo.label}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              borderRadius: "8px",
                            }}
                          />
                        ) : (
                          <ImageIcon size={24} color="#9CA3AF" />
                        )}
                        {apiBooking ? (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => void removeBookingAttachment(String(photo.id))}
                            style={{
                              position: "absolute",
                              right: "6px",
                              top: "6px",
                              width: "28px",
                              height: "28px",
                              borderRadius: "999px",
                              border: "none",
                              backgroundColor: "rgba(220,38,38,0.9)",
                              color: "white",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: isUpdating ? "not-allowed" : "pointer",
                            }}
                            aria-label="Remove booking photo"
                          >
                            <X size={14} />
                          </button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={styles.detailRow}>
                <div style={styles.detailIcon}>
                  <AlertCircle size={18} />
                </div>
                <div style={styles.detailContent}>
                  <div style={styles.detailLabel}>Special Instructions</div>
                  <div style={styles.detailValue}>{booking.service.instructions}</div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                  marginTop: "16px",
                }}
              >
                <div>
                  <div style={styles.detailLabel}>Estimated Duration</div>
                  <div style={styles.detailValue}>{booking.service.estimatedDuration}</div>
                </div>
                <div>
                  <div style={styles.detailLabel}>Actual Duration</div>
                  <div style={styles.detailValue}>{booking.service.actualDuration}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div>
            {/* Pricing Summary */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Pricing Summary</h2>

              <div style={styles.totalRow}>
                <div style={styles.totalLabel}>Booking Total</div>
                <div style={styles.totalValue}>
                  ₱{booking.pricing.totalAmount.toLocaleString()}
                </div>
              </div>
              <p style={{ color: "#6B7280", fontSize: "13px", lineHeight: 1.5, marginTop: "8px" }}>
                Provider payout and fee details are available from the payments and payout
                records after processing.
              </p>
            </div>

            {/* Action Buttons */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Actions</h2>

              {booking.status === "upcoming" && (
                <>
                  <div style={styles.infoBox}>
                    <AlertCircle size={18} style={{ marginTop: "2px", flexShrink: 0 }} />
                    <div>
                      Make sure to arrive on time. Customer will be notified when you start your
                      trip.
                    </div>
                  </div>

                  <div style={styles.actionButtons}>
                    <button
                      style={{ ...styles.button, ...styles.primaryButton }}
                      onClick={openDirections}
                    >
                      <Navigation size={16} />
                      Get Directions
                    </button>
                    <button
                      disabled={isUpdating}
                      style={{ ...styles.button, ...styles.outlinedButton, opacity: isUpdating ? 0.7 : 1 }}
                      onClick={() => void updateStatus("in_progress")}
                    >
                      <CheckCircle size={16} />
                      {isUpdating ? "Updating..." : "Start Trip"}
                    </button>
                    <button
                      style={{
                        ...styles.button,
                        ...styles.dangerButton,
                        gridColumn: "1 / -1",
                      }}
                      onClick={() => navigate(`/provider/cancel-booking/${id}`)}
                    >
                      <X size={16} />
                      Cancel Booking
                    </button>
                  </div>
                </>
              )}

              {booking.status === "in-progress" && (
                <>
                  <div style={{ display: "grid", gap: "12px" }}>
                    <textarea
                      value={progressMessage}
                      onChange={(event) => setProgressMessage(event.target.value)}
                      placeholder="Share a progress update for the customer..."
                      rows={4}
                      style={{
                        ...styles.input,
                        minHeight: "110px",
                        resize: "vertical",
                        fontFamily: "inherit",
                      }}
                    />
                    <label
                      style={{
                        ...styles.button,
                        ...styles.outlinedButton,
                        justifyContent: "center",
                        cursor: isPostingProgress ? "not-allowed" : "pointer",
                        opacity: isPostingProgress ? 0.7 : 1,
                      }}
                    >
                      <Upload size={16} />
                      {progressPhoto ? progressPhoto.name : "Attach Progress Photo"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        disabled={isPostingProgress}
                        onChange={(event) =>
                          setProgressPhoto(event.currentTarget.files?.[0] ?? null)
                        }
                        style={{ display: "none" }}
                      />
                    </label>
                  </div>
                  <div style={styles.actionButtons}>
                    <button
                      disabled={isUpdating}
                      style={{ ...styles.button, ...styles.primaryButton, opacity: isUpdating ? 0.7 : 1 }}
                      onClick={() => void updateStatus("completed")}
                    >
                      <CheckCircle size={16} />
                      {isUpdating ? "Updating..." : "Complete Service"}
                    </button>
                    <button
                      type="button"
                      style={{ ...styles.button, ...styles.outlinedButton }}
                      onClick={focusPhotos}
                    >
                      <ImageIcon size={16} />
                      View Photos
                    </button>
                    <button
                      disabled={isPostingProgress || !progressMessage.trim()}
                      style={{
                        ...styles.button,
                        ...styles.primaryButton,
                        gridColumn: "1 / -1",
                        opacity: isPostingProgress || !progressMessage.trim() ? 0.7 : 1,
                        cursor:
                          isPostingProgress || !progressMessage.trim()
                            ? "not-allowed"
                            : "pointer",
                      }}
                      onClick={() => void submitProgressUpdate()}
                    >
                      <Send size={16} />
                      {isPostingProgress ? "Posting..." : "Post Progress Update"}
                    </button>
                  </div>
                </>
              )}

              <div style={{ marginTop: "24px", borderTop: "1px solid #F3F4F6", paddingTop: "18px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#111827", marginBottom: "12px" }}>
                  Raise Dispute
                </h3>
                <div style={{ display: "grid", gap: "12px" }}>
                  <input
                    type="text"
                    style={styles.input}
                    placeholder="Reason"
                    value={disputeReason}
                    onChange={(event) => setDisputeReason(event.target.value)}
                  />
                  <textarea
                    value={disputeDetails}
                    onChange={(event) => setDisputeDetails(event.target.value)}
                    placeholder="Describe what happened..."
                    rows={4}
                    style={{
                      ...styles.input,
                      minHeight: "100px",
                      resize: "vertical",
                      fontFamily: "inherit",
                    }}
                  />
                  <button
                    disabled={isUpdating || !disputeReason.trim() || !disputeDetails.trim()}
                    style={{
                      ...styles.button,
                      ...styles.dangerButton,
                      opacity:
                        isUpdating || !disputeReason.trim() || !disputeDetails.trim()
                          ? 0.7
                          : 1,
                      cursor:
                        isUpdating || !disputeReason.trim() || !disputeDetails.trim()
                          ? "not-allowed"
                          : "pointer",
                    }}
                    onClick={() => void submitDispute()}
                  >
                    <AlertCircle size={16} />
                    {isUpdating ? "Submitting..." : "Raise Dispute"}
                  </button>
                </div>
              </div>

              <div style={{ marginTop: "24px", borderTop: "1px solid #F3F4F6", paddingTop: "18px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#111827", marginBottom: "12px" }}>
	                  Service Updates
	                </h3>
                {serviceUpdatesError && (
                  <div style={{ ...styles.infoBox, marginBottom: "12px" }}>
                    <AlertCircle size={18} style={{ marginTop: "2px", flexShrink: 0 }} />
                    <div>{serviceUpdatesError}</div>
                  </div>
                )}
	                {serviceUpdates.length > 0 ? (
                  <div style={{ display: "grid", gap: "10px" }}>
                    {serviceUpdates.map((update) => (
                      <div
                        key={update.id}
                        style={{
                          border: "1px solid #D1FAE5",
                          backgroundColor: "#F0FDF8",
                          borderRadius: "10px",
                          padding: "12px",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginBottom: "6px" }}>
                          <span style={{ fontSize: "12px", fontWeight: "700", color: "#065F46", textTransform: "uppercase" }}>
                            {update.updateType}
                          </span>
                          <span style={{ fontSize: "11px", color: "#6B7280" }}>
                            {formatServiceUpdateTime(update.createdAt)}
                          </span>
                        </div>
                        <p style={{ fontSize: "13px", color: "#374151", lineHeight: "1.6" }}>
                          {update.message || "Service update posted."}
                        </p>
                        {update.attachmentId && (
                          <p style={{ fontSize: "12px", color: "#00BF63", fontWeight: "600", marginTop: "6px" }}>
                            Photo attached
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: "13px", color: "#6B7280" }}>
                    No service updates posted yet.
                  </p>
                )}
              </div>
            </div>

            {/* Chat / Messages */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Messages</h2>

              {messageError ? (
                <div style={styles.infoBox}>
                  <AlertCircle size={18} style={{ marginTop: "2px", flexShrink: 0 }} />
                  <div>{messageError}</div>
                </div>
              ) : null}

              <div style={styles.chatContainer}>
                {conversationMessages.length === 0 ? (
                  <div style={styles.detailValue}>
                    No messages yet. Send a note to the customer.
                  </div>
                ) : (
                  conversationMessages.map((message) => {
                    const isProvider = message.senderRole === "provider";
                    return (
                      <div
                        key={message.id}
                        style={{
                          ...styles.chatBubble,
                          ...(isProvider
                            ? styles.chatBubbleProvider
                            : styles.chatBubbleCustomer),
                        }}
                      >
                        <div style={styles.chatSender}>
                          {isProvider ? "You" : booking.customer.name}
                        </div>
                        <div style={styles.chatMessage}>{message.content}</div>
                        <div style={styles.chatTime}>
                          {formatServiceUpdateTime(message.createdAt)}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div style={styles.chatInput}>
                <input
                  ref={messageInputRef}
                  type="text"
                  style={styles.input}
                  placeholder="Type a message..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      void handleSendMessage();
                    }
                  }}
                />
                <button
                  type="button"
                  aria-label="Send message"
                  disabled={!conversation || !chatMessage.trim() || isSendingMessage}
                  style={{
                    ...styles.button,
                    ...styles.primaryButton,
                    opacity: !conversation || !chatMessage.trim() || isSendingMessage ? 0.7 : 1,
                    cursor:
                      !conversation || !chatMessage.trim() || isSendingMessage
                        ? "not-allowed"
                        : "pointer",
                  }}
                  onClick={() => void handleSendMessage()}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

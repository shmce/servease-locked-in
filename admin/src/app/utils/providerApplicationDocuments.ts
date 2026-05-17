import type {
  AdminProviderApplicationDocumentSummary,
  AdminProviderApplicationSummary,
} from "../../services/serveaseAdminApi";

type ProviderDocumentStatus = "verified" | "pending" | "rejected";

export interface ProviderDocumentItem {
  id: string;
  documentId?: string;
  name: string;
  file: string;
  date: string;
  status: ProviderDocumentStatus;
  color: string;
  iconColor: string;
  previewUrl?: string | null;
  downloadUrl?: string | null;
}

const DOCUMENT_COLOR_PALETTE = [
  { color: "bg-blue-100", iconColor: "text-blue-500" },
  { color: "bg-green-100", iconColor: "text-green-500" },
  { color: "bg-purple-100", iconColor: "text-purple-500" },
  { color: "bg-teal-100", iconColor: "text-teal-500" },
  { color: "bg-cyan-100", iconColor: "text-cyan-500" },
  { color: "bg-indigo-100", iconColor: "text-indigo-500" },
  { color: "bg-pink-100", iconColor: "text-pink-500" },
];

function humanizeDocumentType(documentType: string): string {
  return documentType
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .replace(/\b(Id|Nbi|Prc|Tin)\b/g, (match) => match.toUpperCase());
}

function getDocumentFileName(document: AdminProviderApplicationDocumentSummary): string {
  const sourcePath = document.storagePath ?? document.fileUrl;
  const fileName = sourcePath?.split("/").filter(Boolean).pop();

  return fileName ?? `${document.documentType}.document`;
}

function formatDocumentDate(createdAt: string | null): string {
  if (!createdAt) return "Date unavailable";

  const date = new Date(createdAt);

  return Number.isFinite(date.getTime())
    ? date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Date unavailable";
}

function normalizeStatus(
  status: AdminProviderApplicationDocumentSummary["status"],
): ProviderDocumentStatus {
  if (status === "approved") return "verified";
  if (status === "rejected") return "rejected";
  return "pending";
}

function normalizeSearchValue(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

export function toProviderDocumentItems(
  documents: AdminProviderApplicationDocumentSummary[],
): ProviderDocumentItem[] {
  return documents.map((document, index) => ({
    id: document.id,
    documentId: document.id,
    name: humanizeDocumentType(document.documentType),
    file: getDocumentFileName(document),
    date: formatDocumentDate(document.createdAt),
    status: normalizeStatus(document.status),
    previewUrl: document.previewUrl,
    downloadUrl: document.downloadUrl,
    ...DOCUMENT_COLOR_PALETTE[index % DOCUMENT_COLOR_PALETTE.length],
  }));
}

export function countVerifiedProviderDocuments(documents: ProviderDocumentItem[]): number {
  return documents.filter((document) => document.status === "verified").length;
}

export function findProviderApplicationForDetails(
  applications: AdminProviderApplicationSummary[],
  provider: { providerId: string; businessName?: string | null },
): AdminProviderApplicationSummary | null {
  const normalizedProviderId = normalizeSearchValue(provider.providerId);
  const normalizedBusinessName = normalizeSearchValue(provider.businessName);

  return (
    applications.find(
      (application) => normalizeSearchValue(application.id) === normalizedProviderId,
    ) ??
    applications.find(
      (application) =>
        normalizedBusinessName.length > 0 &&
        normalizeSearchValue(application.businessName) === normalizedBusinessName,
    ) ??
    null
  );
}

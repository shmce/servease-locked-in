import { describe, expect, it } from "vitest";
import type { AdminProviderApplicationSummary } from "../../services/serveaseAdminApi";
import {
  countVerifiedProviderDocuments,
  findProviderApplicationForDetails,
  toProviderDocumentItems,
} from "./providerApplicationDocuments";

const application = {
  id: "application-1",
  applicationReference: "APP-0001",
  userId: "user-1",
  businessName: "HomeFix Pro",
  serviceArea: "Makati",
  serviceDescription: "Repairs",
  yearsExperience: 5,
  verificationStatus: "approved",
  isActive: true,
  averageRating: 4.8,
  reviewCount: 12,
  serviceCount: 3,
  documentCount: 2,
  pendingDocumentCount: 1,
  approvedDocumentCount: 1,
  rejectedDocumentCount: 0,
  latestDecisionReason: null,
  latestDecisionAt: null,
  latestDecidedBy: null,
  createdAt: "2026-03-01T04:00:00.000Z",
  updatedAt: "2026-03-01T04:00:00.000Z",
  documents: [
    {
      id: "document-1",
      applicationId: "application-1",
      userId: "user-1",
      documentType: "government_id",
      fileUrl: "https://storage.example.com/provider-documents/government-id.jpg",
      storagePath: "provider-documents/user-1/government-id.jpg",
      status: "approved",
      createdAt: "2026-03-01T04:00:00.000Z",
      previewUrl: "https://signed.example.com/preview/government-id.jpg",
      downloadUrl: "https://signed.example.com/download/government-id.jpg",
    },
    {
      id: "document-2",
      applicationId: "application-1",
      userId: "user-1",
      documentType: "business-permit",
      fileUrl: null,
      storagePath: null,
      status: "pending",
      createdAt: null,
      previewUrl: null,
      downloadUrl: null,
    },
  ],
} satisfies AdminProviderApplicationSummary;

describe("provider application document helpers", () => {
  it("maps gateway documents into ServiceProviderDetails document cards", () => {
    const documents = toProviderDocumentItems(application.documents);

    expect(documents).toEqual([
      expect.objectContaining({
        id: "document-1",
        documentId: "document-1",
        name: "Government ID",
        file: "government-id.jpg",
        date: "Mar 1, 2026",
        status: "verified",
        previewUrl: "https://signed.example.com/preview/government-id.jpg",
        downloadUrl: "https://signed.example.com/download/government-id.jpg",
      }),
      expect.objectContaining({
        id: "document-2",
        documentId: "document-2",
        name: "Business Permit",
        file: "business-permit.document",
        date: "Date unavailable",
        status: "pending",
      }),
    ]);
    expect(countVerifiedProviderDocuments(documents)).toBe(1);
  });

  it("resolves the application backing a provider details page", () => {
    expect(findProviderApplicationForDetails([application], {
      providerId: "application-1",
      businessName: "Other Provider",
    })).toBe(application);

    expect(findProviderApplicationForDetails([application], {
      providerId: "provider-1",
      businessName: "homefix pro",
    })).toBe(application);
  });
});

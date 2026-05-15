import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { X } from "lucide-react";

interface ApprovalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  approval: any;
}

export function ApprovalDrawer({ isOpen, onClose, approval }: ApprovalDrawerProps) {
  if (!isOpen || !approval) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-[600px] bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{approval.name || approval.seller}</h2>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{approval.module}</Badge>
                <Badge
                  variant={
                    approval.priority === "high"
                      ? "destructive"
                      : approval.priority === "medium"
                      ? "default"
                      : "secondary"
                  }
                >
                  {approval.priority} priority
                </Badge>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Summary */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Type:</span>
                <span className="font-medium">{approval.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Submitted:</span>
                <span className="font-medium">{approval.submittedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">ID:</span>
                <span className="font-medium">{approval.id}</span>
              </div>
            </div>
          </div>

          {/* Risk Score */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Risk Assessment</h3>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-900">Risk Score</span>
                <span className="text-2xl font-bold text-green-600">23/100</span>
              </div>
              <div className="w-full h-2 bg-green-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-600 w-[23%]" />
              </div>
              <p className="text-xs text-green-700 mt-2">Low Risk - Auto-approval eligible</p>
            </div>
          </div>

          {/* Documents */}
          {approval.documents && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Documents ({approval.documents.length})</h3>
              <div className="space-y-2">
                {approval.documents.map((doc: string, idx: number) => (
                  <div key={idx} className="p-3 border border-gray-200 rounded-lg flex items-center justify-between hover:border-blue-300 transition-colors">
                    <span className="text-sm font-medium">{doc}</span>
                    <Button size="sm" variant="outline">View</Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audit Trail */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">History & Notes</h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Application submitted</p>
                  <p className="text-xs text-gray-500">{approval.submittedDate} - System</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-gray-300 mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Auto-validation passed</p>
                  <p className="text-xs text-gray-500">2 hours ago - System</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-3">
            <Button variant="destructive" className="flex-1">
              Reject
            </Button>
            <Button variant="outline" className="flex-1">
              Hold / Request Changes
            </Button>
            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">
              Approve
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

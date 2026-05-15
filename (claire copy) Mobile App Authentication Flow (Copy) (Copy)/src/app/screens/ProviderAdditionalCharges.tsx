import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Plus, X, AlertCircle } from "lucide-react";
import { StatusBar } from "../components/StatusBar";

interface ChargeItem {
  id: number;
  description: string;
  amount: number;
}

export default function ProviderAdditionalCharges() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [itemDescription, setItemDescription] = useState("");
  const [itemAmount, setItemAmount] = useState("");
  const [chargeItems, setChargeItems] = useState<ChargeItem[]>([]);
  const [justification, setJustification] = useState("");

  const bookingPrice = 2500;

  const handleAddItem = () => {
    if (itemDescription.trim() && itemAmount.trim()) {
      const newItem: ChargeItem = {
        id: Date.now(),
        description: itemDescription,
        amount: parseFloat(itemAmount)
      };
      setChargeItems([...chargeItems, newItem]);
      setItemDescription("");
      setItemAmount("");
    }
  };

  const handleRemoveItem = (itemId: number) => {
    setChargeItems(chargeItems.filter(item => item.id !== itemId));
  };

  const totalAdditionalCharges = chargeItems.reduce((sum, item) => sum + item.amount, 0);
  const newTotalAmount = bookingPrice + totalAdditionalCharges;

  return (
    <div className="bg-white w-full h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-[#56C490] flex-shrink-0">
        <StatusBar />
      </div>

      {/* Fixed Header */}
      <div className="px-[24px] py-[12px] flex items-center gap-[16px] bg-white flex-shrink-0 border-b border-[#f2f2f2]">
        <button
          onClick={() => navigate(-1)}
          className="w-[44px] h-[44px] flex items-center justify-center -ml-[10px] transition-all active:scale-90"
        >
          <ArrowLeft className="w-6 h-6 text-[#1a1a1a]" />
        </button>
        <div className="flex-1">
          <h2 className="font-['Nunito',sans-serif] text-[18px] text-[#111827]">
            Additional Charges
          </h2>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[24px] pb-[40px]">
        {/* Current Booking Price */}
        <div className="mt-[24px] mb-[20px] border-2 border-[#e5e5e5] rounded-[16px] p-[16px] bg-[#f9fafb]">
          <p className="font-['Nunito',sans-serif] text-[13px] text-[#9CA3AF] mb-[6px]">
            Current Booking Price
          </p>
          <p className="font-['Nunito',sans-serif] text-[24px] text-[#111827]">
            ₱{bookingPrice.toLocaleString()}
          </p>
        </div>

        {/* Add Item Form */}
        <div className="border-2 border-[#e5e5e5] rounded-[16px] p-[16px] mb-[20px]">
          <p className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[12px]">
            Additional Charges
          </p>

          <div className="space-y-[10px] mb-[12px]">
            <div>
              <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[6px] block">
                Description
              </label>
              <input
                type="text"
                placeholder="e.g., Extra pipe replacement"
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                className="w-full px-[12px] py-[10px] bg-[#f5f5f5] border border-[#e5e5e5] rounded-[10px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF]"
              />
            </div>

            <div>
              <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[6px] block">
                Amount (₱)
              </label>
              <input
                type="number"
                min="0"
                placeholder="0.00"
                value={itemAmount}
                onChange={(e) => setItemAmount(e.target.value)}
                className="w-full px-[12px] py-[10px] bg-[#f5f5f5] border border-[#e5e5e5] rounded-[10px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          <button
            onClick={handleAddItem}
            disabled={!itemDescription.trim() || !itemAmount.trim()}
            className="w-full bg-white border-2 border-[#56C490] text-[#56C490] font-['Nunito',sans-serif] text-[14px] py-[12px] rounded-[12px] transition-all active:scale-95 flex items-center justify-center gap-[8px] disabled:opacity-40 disabled:active:scale-100"
          >
            <Plus className="w-[18px] h-[18px]" />
            Add Item
          </button>
        </div>

        {/* List of Added Items */}
        {chargeItems.length > 0 && (
          <div className="border-2 border-[#e5e5e5] rounded-[16px] p-[16px] mb-[20px]">
            <p className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[12px]">
              Additional Items ({chargeItems.length})
            </p>

            <div className="space-y-[10px]">
              {chargeItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between bg-[#f9fafb] rounded-[10px] p-[12px]"
                >
                  <div className="flex-1 pr-[12px]">
                    <p className="font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] mb-[2px]">
                      {item.description}
                    </p>
                    <p className="font-['Nunito',sans-serif] text-[15px] text-[#56C490]">
                      ₱{item.amount.toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="w-[32px] h-[32px] bg-white border border-[#e5e5e5] rounded-[8px] flex items-center justify-center transition-all active:scale-90"
                  >
                    <X className="w-[16px] h-[16px] text-[#EF4444]" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        {chargeItems.length > 0 && (
          <div className="border-2 border-[#56C490] rounded-[16px] p-[16px] mb-[20px] bg-[#56C490]/5">
            <p className="font-['Nunito',sans-serif] text-[13px] text-[#9CA3AF] mb-[12px]">
              Summary
            </p>

            <div className="space-y-[8px]">
              <div className="flex items-center justify-between">
                <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280]">
                  Original Amount
                </p>
                <p className="font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a]">
                  ₱{bookingPrice.toLocaleString()}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <p className="font-['Nunito',sans-serif] text-[14px] text-[#56C490]">
                  Total Additional Charges
                </p>
                <p className="font-['Nunito',sans-serif] text-[14px] text-[#56C490]">
                  +₱{totalAdditionalCharges.toLocaleString()}
                </p>
              </div>

              <div className="border-t border-[#e5e5e5] pt-[8px]">
                <div className="flex items-center justify-between">
                  <p className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                    New Total Amount
                  </p>
                  <p className="font-['Nunito',sans-serif] text-[14px] text-[#56C490]">
                    ₱{newTotalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Justification */}
        <div className="border-2 border-[#e5e5e5] rounded-[16px] p-[16px] mb-[20px]">
          <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
            Justification <span className="text-[#EF4444]">*</span>
          </label>
          <textarea
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Explain why these additional charges are necessary..."
            rows={4}
            className="w-full px-[12px] py-[10px] bg-[#f5f5f5] border border-[#e5e5e5] rounded-[10px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF] resize-none"
          />
        </div>

        {/* Notice */}
        <div className="flex items-start gap-[10px] bg-[#FEF3C7] border border-[#FCD34D] rounded-[12px] p-[12px] mb-[24px]">
          <AlertCircle className="w-[18px] h-[18px] text-[#F59E0B] flex-shrink-0 mt-[1px]" />
          <p className="font-['Nunito',sans-serif] text-[13px] text-[#92400E]">
            Customer must approve before charges are applied
          </p>
        </div>

        {/* Spacer for fixed button */}
        <div className="h-[80px]" />
      </div>

      {/* Fixed Bottom Button */}
      <div className="px-[24px] py-[16px] bg-white border-t border-[#f2f2f2] flex-shrink-0">
        <button
          disabled={chargeItems.length === 0 || !justification.trim()}
          className="w-full bg-[#56C490] text-white font-['Nunito',sans-serif] text-[16px] py-[16px] rounded-[12px] transition-all active:scale-95 shadow-[0_4px_12px_rgba(86,196,144,0.25)] disabled:opacity-40 disabled:active:scale-100"
        >
          Send Request to Customer
        </button>
      </div>

      {/* Home Indicator — iOS Safe Area */}
      <div className="h-[34px] bg-white relative flex-shrink-0">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>
    </div>
  );
}
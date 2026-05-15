import { useState } from "react";
import { useNavigate } from "react-router";
import { StatusBar } from "../components/StatusBar";
import { ArrowLeft, CreditCard, Plus, Smartphone, ChevronRight } from "lucide-react";
import { BottomNavigation } from "../components/BottomNavigation";

export default function CustomerPaymentMethods() {
  const navigate = useNavigate();

  const savedCards = [
    {
      id: 1,
      type: "Visa",
      lastFour: "4532",
      expiryDate: "12/26",
      holderName: "Maria Santos",
      isDefault: true,
    },
    {
      id: 2,
      type: "Mastercard",
      lastFour: "8901",
      expiryDate: "08/25",
      holderName: "Maria Santos",
      isDefault: false,
    },
  ];

  const eWallets = [
    {
      id: 1,
      name: "GCash",
      phone: "+63 917 123 4567",
      isLinked: true,
    },
    {
      id: 2,
      name: "PayMaya",
      phone: "+63 917 123 4567",
      isLinked: true,
    },
    {
      id: 3,
      name: "GrabPay",
      phone: "Not Linked",
      isLinked: false,
    },
  ];

  const getCardIcon = (type: string) => {
    return <CreditCard className="w-[24px] h-[24px] text-white" />;
  };

  const getCardGradient = (type: string) => {
    switch (type) {
      case "Visa":
        return "from-[#1A1F71] to-[#2E3A8C]";
      case "Mastercard":
        return "from-[#EB001B] to-[#FF5F00]";
      default:
        return "from-[#56C490] to-[#00a055]";
    }
  };

  return (
    <div className="bg-white w-full h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-[#56C490] flex-shrink-0">
        <StatusBar />
      </div>

      {/* Top Navigation Bar */}
      <div className="px-[24px] py-[12px] flex items-center gap-[16px] bg-white flex-shrink-0 border-b border-[#e5e5e5]">
        <button
          onClick={() => navigate(-1)}
          className="w-[44px] h-[44px] flex items-center justify-center -ml-[10px] transition-all active:scale-90"
        >
          <ArrowLeft className="w-6 h-6 text-[#1a1a1a]" />
        </button>
        <div className="flex-1">
          <h2 className="font-['Nunito',sans-serif] text-[18px] text-[#111827]">
            Payment Methods
          </h2>
        </div>
      </div>

      {/* Scrollable Content */}
      <div 
        className="flex-1 overflow-y-auto px-[24px] pb-[180px]"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        <style>
          {`
            .flex-1::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>
        <div className="pt-[24px]">
          {/* Saved Cards Section */}
          <div className="mb-[32px]">
            <div className="flex items-center justify-between mb-[16px]">
              <h2 className="font-['Nunito',sans-serif] text-[16px] text-[#111827]">
                Saved Cards
              </h2>
              <button
                onClick={() => navigate("/customer/add-payment-method")}
                className="flex items-center gap-[6px] px-[12px] py-[8px] rounded-[8px] bg-[#56C490] transition-all active:scale-95"
              >
                <Plus className="w-[16px] h-[16px] text-white" />
                <span className="font-['Nunito',sans-serif] text-[13px] text-white">
                  Add Card
                </span>
              </button>
            </div>

            <div className="space-y-[12px]">
              {savedCards.map((card) => (
                <div
                  key={card.id}
                  className={`bg-gradient-to-r ${getCardGradient(card.type)} p-[20px] rounded-[16px] shadow-[0_4px_12px_rgba(0,0,0,0.15)]`}
                >
                  <div className="flex items-start justify-between mb-[16px]">
                    <div className="flex items-center gap-[8px]">
                      {getCardIcon(card.type)}
                      <span className="font-['Nunito',sans-serif] text-[14px] text-white">
                        {card.type}
                      </span>
                    </div>
                    {card.isDefault && (
                      <span className="px-[8px] py-[2px] rounded-[4px] bg-white/20 font-['Nunito',sans-serif] text-[10px] text-white">
                        Default
                      </span>
                    )}
                  </div>

                  <p className="font-['Nunito',sans-serif] text-[18px] text-white mb-[12px] tracking-[2px]">
                    •••• •••• •••• {card.lastFour}
                  </p>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-['Poppins',sans-serif] text-[10px] text-white/70 mb-[2px]">
                        Card Holder
                      </p>
                      <p className="font-['Nunito',sans-serif] text-[13px] text-white">
                        {card.holderName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-['Poppins',sans-serif] text-[10px] text-white/70 mb-[2px]">
                        Expires
                      </p>
                      <p className="font-['Nunito',sans-serif] text-[13px] text-white">
                        {card.expiryDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-[8px] mt-[16px] pt-[16px] border-t border-white/20">
                    <button className="flex-1 h-[32px] rounded-[8px] bg-white/10 font-['Nunito',sans-serif] text-[12px] text-white transition-all active:scale-95 hover:bg-white/20">
                      Edit
                    </button>
                    {!card.isDefault && (
                      <button className="flex-1 h-[32px] rounded-[8px] bg-white font-['Nunito',sans-serif] text-[12px] text-[#111827] transition-all active:scale-95">
                        Set as Default
                      </button>
                    )}
                    {!card.isDefault && (
                      <button className="h-[32px] px-[12px] rounded-[8px] bg-white/10 font-['Nunito',sans-serif] text-[12px] text-white transition-all active:scale-95 hover:bg-white/20">
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* E-Wallets Section */}
          <div>
            <div className="flex items-center justify-between mb-[16px]">
              <h2 className="font-['Nunito',sans-serif] text-[16px] text-[#111827]">
                E-Wallets
              </h2>
              <button className="flex items-center gap-[6px] px-[12px] py-[8px] rounded-[8px] bg-[#56C490] transition-all active:scale-95">
                <Plus className="w-[16px] h-[16px] text-white" />
                <span className="font-['Nunito',sans-serif] text-[13px] text-white">
                  Link Wallet
                </span>
              </button>
            </div>

            <div className="space-y-[12px]">
              {eWallets.map((wallet) => (
                <div
                  key={wallet.id}
                  className="bg-[#f5f5f5] p-[16px] rounded-[12px] border border-[#e5e5e5]"
                >
                  <div className="flex items-center justify-between mb-[12px]">
                    <div className="flex items-center gap-[12px]">
                      <div className="w-[48px] h-[48px] rounded-[12px] bg-[#56C490]/10 flex items-center justify-center">
                        <Smartphone className="w-[24px] h-[24px] text-[#56C490]" />
                      </div>
                      <div>
                        <h3 className="font-['Nunito',sans-serif] text-[15px] text-[#111827]">
                          {wallet.name}
                        </h3>
                        <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280]">
                          {wallet.phone}
                        </p>
                      </div>
                    </div>
                    {wallet.isLinked ? (
                      <span className="inline-block px-[8px] py-[2px] rounded-[4px] bg-[#56C490]/10 font-['Nunito',sans-serif] text-[10px] text-[#56C490]">
                        Linked
                      </span>
                    ) : (
                      <ChevronRight className="w-[20px] h-[20px] text-[#9CA3AF]" />
                    )}
                  </div>

                  {wallet.isLinked && (
                    <div className="flex gap-[8px]">
                      <button className="flex-1 h-[36px] rounded-[8px] border-2 border-[#e5e5e5] bg-white font-['Nunito',sans-serif] text-[13px] text-[#374151] transition-all active:scale-95">
                        Manage
                      </button>
                      <button className="flex-1 h-[36px] rounded-[8px] border-2 border-[#EF4444] bg-white font-['Nunito',sans-serif] text-[13px] text-[#EF4444] transition-all active:scale-95">
                        Unlink
                      </button>
                    </div>
                  )}

                  {!wallet.isLinked && (
                    <button className="w-full h-[36px] rounded-[8px] bg-[#56C490] font-['Nunito',sans-serif] text-[13px] text-white transition-all active:scale-95">
                      Link {wallet.name}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
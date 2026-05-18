"use client";

import dynamic from "next/dynamic";

const ProviderApp = dynamic(() => import("../../../provider-app/App"), {
  ssr: false,
});

export default function ProviderCatchAllPage() {
  return <ProviderApp />;
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SharedHeader } from "@/components/shared-header";

export default function FlashcardsPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/chat?tab=flashcards");
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col">
      <SharedHeader />

      {/* Added background pattern */}
      <div className="fixed inset-0 bg-[#F8F8FC]" style={{
        backgroundImage: 'radial-gradient(circle at center, rgba(120, 119, 198, 0.05) 0.25px, transparent 0.25px)',
        backgroundSize: '12px 12px'
      }} />

      <main className="flex-1 relative" />
    </div>
  );
} 
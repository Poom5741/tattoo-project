import { useEffect, useState } from "react";

interface ToastDetail {
  message: string;
}

export default function Toast() {
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const show = (e: Event) => {
      const detail = (e as CustomEvent<ToastDetail>).detail;
      setMsg(detail.message);
      setTimeout(() => setMsg(null), 2600);
    };
    window.addEventListener("suknid:toast", show);
    return () => window.removeEventListener("suknid:toast", show);
  }, []);

  return (
    <div className={`fixed bottom-6 right-6 bg-[#F0EBE1] text-[#1B1C18] px-6 py-3 rounded-lg shadow-lg border border-[#E8E3D8] font-sora text-sm flex items-center gap-3 transition-all duration-300 ${msg ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[#2E7D32]">
        <path d="M3 8.5l3.2 3L13 5" stroke="currentColor" strokeWidth="1.4" />
      </svg>
      {msg}
    </div>
  );
}

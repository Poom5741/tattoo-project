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
    window.addEventListener("inknoir:toast", show);
    return () => window.removeEventListener("inknoir:toast", show);
  }, []);

  return (
    <div className={"toast" + (msg ? " is-on" : "")}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 8.5l3.2 3L13 5" stroke="currentColor" strokeWidth="1.4" />
      </svg>
      {msg}
    </div>
  );
}
